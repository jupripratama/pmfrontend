// services/api.ts - UPDATED VERSION WITH WORKING USER MANAGEMENT API
import axios from 'axios';
import { LoginRequest, User } from '../types/auth';
import {  DailySummary, UploadCsvResponse, CallRecordsResponse, FleetStatisticType, FleetStatisticsDto } from '../types/callRecord';
import { AssignPermissionsRequest, CreatePermissionRequest, CreateRoleRequest, Permission, Role, RolePermission, RolePermissionMatrix } from '../types/permission';

// Determine base URL based on environment
const getBaseURL = () => {
  if (import.meta.env.DEV) {
    return '';
  }
  return import.meta.env.VITE_API_URL || 'https://pm-mkn-production.up.railway.app';
};

export const api = axios.create({
  baseURL: getBaseURL(),
  timeout: 30000,
  withCredentials: false,
});

// Enhanced request interceptor
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    if (!config.headers['Content-Type']) {
      config.headers['Content-Type'] = 'application/json';
    }
    
    console.log('🚀 API Request:', {
      method: config.method?.toUpperCase(),
      url: config.url,
      baseURL: config.baseURL,
      headers: config.headers
    });
    
    return config;
  },
  (error) => {
    console.error('❌ Request Interceptor Error:', error);
    return Promise.reject(error);
  }
);

// Enhanced response interceptor
api.interceptors.response.use(
  (response) => {
    console.log('✅ API Response Success:', {
      status: response.status,
      url: response.config.url,
    });
    return response;
  },
  (error) => {
    console.error('❌ API Response Error:', {
      status: error.response?.status,
      message: error.message,
      code: error.code,
      url: error.config?.url,
      config: error.config
    });
    
    if (error.code === 'ERR_NETWORK' || error.message === 'Network Error') {
      console.error('🌐 Network Error Details:');
      console.error('- Backend URL:', getBaseURL());
      console.error('- Environment:', import.meta.env.MODE);
      console.error('- VITE_API_URL:', import.meta.env.VITE_API_URL);
      
      throw new Error('Tidak dapat terhubung ke server. Periksa:\n1. Backend server sedang berjalan\n2. Koneksi internet stabil\n3. CORS configuration di backend');
    }
    
    if (error.response?.status === 401) {
      console.warn('🛑 Unauthorized - Redirect to login');
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
      localStorage.removeItem('permissions');
    } else if (error.response?.status === 403) {
      console.warn('🚫 Forbidden - Insufficient permissions');
    }
    
    return Promise.reject(error);
  }
);

// Test connection function
export const testConnection = async (): Promise<{ success: boolean; message: string }> => {
  try {
    console.log('🔗 Testing connection to:', getBaseURL());
    const response = await api.get('/api/auth/profile', { 
      timeout: 10000,
      validateStatus: (status) => status < 500
    });
    console.log('🔗 Connection test response status:', response.status);
    return { 
      success: true, 
      message: `Server connected (Status: ${response.status})` 
    };
  } catch (error: any) {
    console.error('🔗 Connection test failed:', error);
    return { 
      success: false, 
      message: error.message || 'Failed to connect to server' 
    };
  }
};

// Auth API functions
export const authApi = {
  login: async (credentials: LoginRequest) => {
    try {
      console.log('🔐 Login attempt to:', `${getBaseURL()}/api/auth/login`);
      
      const response = await api.post('/api/auth/login', credentials);
      console.log('🔐 Login response received:', response.data);
      
      const data = response.data.data;
      
      // Save token and user data
      localStorage.setItem('authToken', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      localStorage.setItem('permissions', JSON.stringify(data.permissions));
      
      console.log('🔐 Login successful, user:', data.user.fullName);
      return data;
      
    } catch (error: any) {
      console.error('❌ Login API error:', error);
      
      if (error.code === 'ERR_NETWORK') {
        throw new Error('Tidak dapat terhubung ke server. Pastikan backend sedang berjalan dan dapat diakses.');
      }
      
      const errorMessage = error.response?.data?.message || error.response?.data?.error || error.message;
      throw new Error(errorMessage || 'Login failed');
    }
  },

  getProfile: async (): Promise<User> => {
    console.log('📡 Fetching user profile...');
    const response = await api.get('/api/auth/profile');
    console.log('✅ Profile response:', response.data);
    
    // ✅ Handle structured response
    let userData: User;
    
    if (response.data.data) {
      // Structured response: { statusCode, message, data, meta }
      userData = response.data.data;
    } else {
      // Direct response (fallback)
      userData = response.data;
    }
    
    console.log('✅ Extracted user data:', userData);
    
    // ✅ Validate required fields
    if (!userData || !userData.userId) {
      throw new Error('Invalid user data received from server');
    }
    
    // ✅ Update localStorage
    localStorage.setItem('user', JSON.stringify(userData));
    
    return userData;
  },

  uploadProfilePhoto: async (userId: number, file: File): Promise<{ photoUrl: string }> => {
    const formData = new FormData();
    formData.append('photo', file);
    
    console.log('📤 Uploading photo for user:', userId);
    
    const response = await api.post(`/api/users/${userId}/photo`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    console.log('📤 Photo upload response:', response.data);

    // ✅ Handle both response structures
    let photoUrl: string;
    
    if (response.data.data) {
      photoUrl = response.data.data.photoUrl || response.data.data;
    } else {
      photoUrl = response.data.photoUrl || response.data;
    }
    
    if (!photoUrl) {
      console.error('❌ No photoUrl in response:', response.data);
      throw new Error('PhotoUrl not found in response');
    }

    console.log('✅ Photo uploaded successfully:', photoUrl);
    
    return { photoUrl };
  },

  deleteProfilePhoto: async (userId: number): Promise<void> => {
    console.log('🗑️ Deleting photo for user:', userId);
    await api.delete(`/api/users/${userId}/photo`);
    console.log('✅ Photo deleted successfully');
  },

  updateProfile: async (userId: number, profileData: {
    fullName?: string;
    email?: string;
  }): Promise<User> => {
    console.log('📝 Updating profile for user:', userId, profileData);
    const response = await api.put(`/api/users/${userId}`, profileData);
    console.log('✅ Profile updated:', response.data);
    
    const updatedUser = response.data.data;
    
    return updatedUser;
  },

  getPermissions: (): string[] => {
    const permissionsStr = localStorage.getItem('permissions');
    return permissionsStr ? JSON.parse(permissionsStr) : [];
  },

 
register: async (userData: {
  username: string;
  email: string;
  password: string;
  fullName: string;
}): Promise<void> => {
  console.log('📤 Sending register request:', {
    username: userData.username,
    email: userData.email,
    fullName: userData.fullName,
    // Don't log password
  });

  // ✅ ADD confirmPassword to match backend DTO
  const requestData = {
    username: userData.username,
    email: userData.email,
    password: userData.password,
    confirmPassword: userData.password,  // ← TAMBAHKAN INI!
    fullName: userData.fullName,
  };

  console.log('📦 Request payload (with confirmPassword):', {
    ...requestData,
    password: '***',
    confirmPassword: '***'
  });

  const response = await api.post('/api/auth/register', requestData);
  
  console.log('✅ Register response:', response.data);
  return response.data;
},

  changePassword: async (oldPassword: string, newPassword: string): Promise<void> => {
    await api.post('/api/auth/change-password', {
      currentPassword: oldPassword,
      newPassword: newPassword,
      confirmPassword: newPassword
    });
  },

  logout: () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    localStorage.removeItem('permissions');
    console.log('👋 Logout successful');
  },


  healthCheck: async (): Promise<boolean> => {
    try {
      const response = await api.get('/api/auth/profile', { 
        timeout: 5000,
        validateStatus: () => true
      });
      return response.status < 500;
    } catch (error: any) {
      console.error('🔍 Health check failed:', error);
      return false;
    }
  }
};

// Call Record API functions
export const callRecordApi = {
  getDailySummary: async (date: string): Promise<DailySummary> => {
    try {
      console.log('📡 API Call: getDailySummary', { date });
      const response = await api.get(`/api/call-records/summary/daily/${date}`);
      console.log('📊 Daily Summary Data:', response.data.data);
      return response.data.data;
    } catch (error: any) {
      console.error('❌ Error loading daily summary:', error);
      const errorMessage = error.response?.data?.message || error.message;
      throw new Error(`Failed to load daily summary: ${errorMessage}`);
    }
  },

  getOverallSummary: async (startDate: string, endDate: string): Promise<any> => {
    try {
      const response = await api.get(`/api/call-records/summary/overall?startDate=${startDate}&endDate=${endDate}`);
      return response.data.data;
    } catch (error: any) {
      console.error('❌ Error loading overall summary:', error);
      throw error;
    }
  },

  getCallRecords: async (
    startDate?: string, 
    endDate?: string, 
    page: number = 1, 
    pageSize: number = 15,
    search?: string,
    callCloseReason?: number,
    hourGroup?: number,
    sortBy?: string,
    sortDir?: string
  ): Promise<CallRecordsResponse> => {
    try {
      console.log('📡 API Call: getCallRecords', { 
        startDate, 
        endDate, 
        page, 
        pageSize,
        search,
        callCloseReason,
        hourGroup,
        sortBy,
        sortDir
      });

      const params: any = {
        page,
        pageSize
      };

      if (startDate) params.startDate = startDate;
      if (endDate) params.endDate = endDate;
      if (search) params.search = search;
      if (callCloseReason !== undefined) params.callCloseReason = callCloseReason;
      if (hourGroup !== undefined) params.hourGroup = hourGroup;
      if (sortBy) params.sortBy = sortBy;
      if (sortDir) params.sortDir = sortDir;

      const response = await api.get('/api/call-records', { params });
      
      console.log('📊 Call Records Response:', {
        totalCount: response.data.data?.totalCount,
        page: response.data.data?.page,
        totalPages: response.data.data?.totalPages,
        recordsCount: response.data.data?.data?.length
      });
      
      return response.data;
    } catch (error: any) {
      console.error('❌ Error fetching call records:', error);
      const errorMessage = error.response?.data?.message || error.message;
      throw new Error(`Failed to load call records: ${errorMessage}`);
    }
  },

  importCsv: async (file: File): Promise<UploadCsvResponse> => {
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await api.post('/api/call-records/import-csv', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        },
        timeout: 60000
      });
      return response.data.data;
    } catch (error: any) {
      console.error('❌ Error importing CSV:', error);
      throw error;
    }
  },

  exportCsv: async (startDate: string, endDate: string): Promise<void> => {
    try {
      const response = await api.get(`/api/call-records/export/csv?startDate=${startDate}&endDate=${endDate}`, {
        responseType: 'blob'
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `CallRecords_${startDate}_to_${endDate}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      
      console.log('📤 CSV Export completed');
    } catch (error: any) {
      console.error('❌ Error exporting CSV:', error);
      throw error;
    }
  },

  exportDailyCsv: async (date: string): Promise<void> => {
    try {
      const response = await api.get(`/api/call-records/export/csv/${date}`, {
        responseType: 'blob'
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `CallRecords_${date}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      
      console.log('📤 Daily CSV Export completed');
    } catch (error: any) {
      console.error('❌ Error exporting daily CSV:', error);
      throw error;
    }
  },

  exportDailySummaryExcel: async (date: string): Promise<void> => {
    try {
      const response = await api.get(`/api/call-records/export/daily-summary/${date}`, {
        responseType: 'blob'
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Daily_Summary_${date}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      
      console.log('📤 Daily Excel Export completed');
    } catch (error: any) {
      console.error('❌ Error exporting daily Excel:', error);
      throw error;
    }
  },

  exportOverallSummaryExcel: async (startDate: string, endDate: string): Promise<void> => {
    try {
      const response = await api.get(`/api/call-records/export/overall-summary?startDate=${startDate}&endDate=${endDate}`, {
        responseType: 'blob'
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Overall_Summary_${startDate}_to_${endDate}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      
      console.log('📤 Overall Excel Export completed');
    } catch (error: any) {
      console.error('❌ Error exporting overall Excel:', error);
      throw error;
    }
  },

  deleteCallRecords: async (date: string): Promise<boolean> => {
    try {
      console.log('🗑️ Delete API call for date:', date);
      
      const response = await api.delete(`/api/call-records/${date}`);
      
      console.log('📊 Delete API Response:', response.data);
      
      if (response.data?.data?.deleted !== undefined) {
        return response.data.data.deleted;
      } else if (response.data?.deleted !== undefined) {
        return response.data.deleted;
      } else {
        console.warn('❓ Unknown delete response structure:', response.data);
        return false;
      }
    } catch (error: any) {
      console.error('❌ Error deleting records:', error);
      
      const errorMessage = error.response?.data?.message || error.message;
      
      if (error.response?.status === 403) {
        throw new Error('Access denied: You do not have permission to delete call records');
      } else if (error.response?.status === 401) {
        throw new Error('Authentication required: Please login again');
      } else {
        throw new Error(errorMessage || 'Error deleting call records');
      }
    }
  },

  getFleetStatistics: async (
    date?: string, 
    top: number = 10, 
    type?: FleetStatisticType
  ): Promise<FleetStatisticsDto> => {
    try {
      console.log('📡 API Call: getFleetStatistics', { date, top, type });
      
      const params: any = { top };
      if (date) params.date = date;
      if (type && type !== FleetStatisticType.All) {
        params.type = type;
      }

      const response = await api.get('/api/call-records/fleet-statistics', { params });
      console.log('📊 Fleet Statistics Data:', response.data.data);
      
      return response.data.data;
    } catch (error: any) {
      console.error('❌ Error loading fleet statistics:', error);
      const errorMessage = error.response?.data?.message || error.message;
      throw new Error(`Failed to load fleet statistics: ${errorMessage}`);
    }
  },
};

// Permission APIs
export const permissionApi = {
  getAll: async (): Promise<Permission[]> => {
    const response = await api.get('/api/permissions');
    return response.data.data;
  },

  getById: async (id: number): Promise<Permission> => {
    const response = await api.get(`/api/permissions/${id}`);
    return response.data.data;
  },

  create: async (data: CreatePermissionRequest): Promise<Permission> => {
    const response = await api.post('/api/permissions', data);
    return response.data.data;
  },

  update: async (id: number, data: CreatePermissionRequest): Promise<Permission> => {
    const response = await api.put(`/api/permissions/${id}`, data);
    return response.data.data;
  },

  delete: async (id: number): Promise<void> => {
    await api.delete(`/api/permissions/${id}`);
  },
};

// Role APIs
export const roleApi = {
  getAll: async (): Promise<Role[]> => {
    const response = await api.get('/api/roles');
    return response.data.data;
  },

  getById: async (id: number): Promise<Role> => {
    const response = await api.get(`/api/roles/${id}`);
    return response.data.data;
  },

  create: async (data: CreateRoleRequest): Promise<Role> => {
    const response = await api.post('/api/roles', data);
    return response.data.data;
  },

  update: async (id: number, data: CreateRoleRequest): Promise<Role> => {
    const response = await api.put(`/api/roles/${id}`, data);
    return response.data.data;
  },

  delete: async (id: number): Promise<void> => {
    await api.delete(`/api/roles/${id}`);
  },
};

// Role-Permission APIs
export const rolePermissionApi = {
  getMatrix: async (): Promise<RolePermissionMatrix[]> => {
    const response = await api.get('/api/role-permissions/matrix');
    return response.data.data;
  },

  getByRole: async (roleId: number): Promise<RolePermission[]> => {
    const response = await api.get(`/api/role-permissions/by-role/${roleId}`);
    return response.data.data;
  },

  assignPermissions: async (roleId: number, permissionIds: number[]): Promise<void> => {
    await api.put(`/api/role-permissions/role/${roleId}`, { permissionIds });
  },

  removePermission: async (roleId: number, permissionId: number): Promise<void> => {
    await api.delete(`/api/role-permissions/role/${roleId}/permission/${permissionId}`);
  },
};

// ✅ UPDATED User Management APIs - WORKING VERSION
export const userApi = {
  getAll: async (): Promise<User[]> => {
    console.log('📡 Fetching all users...');
    const response = await api.get('/api/users');
    console.log('✅ Users fetched:', response.data.data);
    return response.data.data;
  },

  getById: async (id: number): Promise<User> => {
    console.log('📡 Fetching user by ID:', id);
    const response = await api.get(`/api/users/${id}`);
    console.log('✅ User fetched:', response.data.data);
    return response.data.data;
  },

  updateRole: async (userId: number, roleId: number): Promise<User> => {
    console.log('📝 Updating user role:', { userId, roleId });
    const response = await api.patch(`/api/users/${userId}/role`, { roleId });
    console.log('✅ User role updated:', response.data.data);
    return response.data.data;
  },

  activateUser: async (userId: number): Promise<User> => {
    console.log('✅ Activating user:', userId);
    const response = await api.patch(`/api/users/${userId}/activate`);
    console.log('✅ User activated:', response.data.data);
    return response.data.data;
  },

  deactivateUser: async (userId: number): Promise<User> => {
    console.log('🚫 Deactivating user:', userId);
    const response = await api.patch(`/api/users/${userId}/deactivate`);
    console.log('✅ User deactivated:', response.data.data);
    return response.data.data;
  },

  deleteUser: async (userId: number): Promise<void> => {
    console.log('🗑️ Deleting user:', userId);
    await api.delete(`/api/users/${userId}`);
    console.log('✅ User deleted successfully');
  },
};