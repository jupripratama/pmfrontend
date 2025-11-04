import axios from 'axios';
import { LoginRequest, User } from '../types/auth';
import {  DailySummary, UploadCsvResponse, CallRecordsResponse, FleetStatisticType, FleetStatisticsDto } from '../types/callRecord';

// Determine base URL based on environment
const getBaseURL = () => {
  // Jika di development, gunakan proxy (empty string)
  if (import.meta.env.DEV) {
    return '';
  }
  // Jika di production, gunakan URL dari environment
  return import.meta.env.VITE_API_URL || 'https://pm-mkn-production.up.railway.app';
};

const api = axios.create({
  baseURL: getBaseURL(),
  timeout: 30000,
  withCredentials: false, // Set false dulu untuk avoid CORS issues
});

// Enhanced request interceptor
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // Add content type if not set
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
    
    // Handle specific error cases
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
      // Don't redirect here, let component handle it
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
      validateStatus: (status) => status < 500 // Consider any status < 500 as connection success
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
      
      // Enhanced error message
      if (error.code === 'ERR_NETWORK') {
        throw new Error('Tidak dapat terhubung ke server. Pastikan backend sedang berjalan dan dapat diakses.');
      }
      
      const errorMessage = error.response?.data?.message || error.response?.data?.error || error.message;
      throw new Error(errorMessage || 'Login failed');
    }
  },

  getProfile: async (): Promise<User> => {
    const response = await api.get('/api/auth/profile');
    return response.data.data;
  },

  updateProfile: async (data: { fullName?: string; email?: string }): Promise<User> => {
    try {
      console.log('🔄 Updating profile:', data);
      const response = await api.put('/api/auth/profile', data);
      
      // Update local storage
      const updatedUser = response.data.data;
      localStorage.setItem('user', JSON.stringify(updatedUser));
      
      console.log('✅ Profile updated successfully');
      return updatedUser;
    } catch (error: any) {
      console.error('❌ Error updating profile:', error);
      const errorMessage = error.response?.data?.message || error.message;
      throw new Error(errorMessage || 'Failed to update profile');
    }
  },

  getPermissions: (): string[] => {
    const permissionsStr = localStorage.getItem('permissions');
    return permissionsStr ? JSON.parse(permissionsStr) : [];
  },

  logout: () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    localStorage.removeItem('permissions');
    console.log('👋 Logout successful');
  },

  // Health check for server status
  healthCheck: async (): Promise<boolean> => {
    try {
      const response = await api.get('/api/auth/profile', { 
        timeout: 5000,
        validateStatus: () => true // Don't throw on any status
      });
      return response.status < 500; // Consider any status < 500 as server online
    } catch (error: any) {
      console.error('🔍 Health check failed:', error);
      return false;
    }
  }
};

// Call Record API functions
export const callRecordApi = {
  // Get daily summary for specific date
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

  // Get overall summary with date range
  getOverallSummary: async (startDate: string, endDate: string): Promise<any> => {
    try {
      const response = await api.get(`/api/call-records/summary/overall?startDate=${startDate}&endDate=${endDate}`);
      return response.data.data;
    } catch (error: any) {
      console.error('❌ Error loading overall summary:', error);
      throw error;
    }
  },

  // Get call records with pagination and filtering
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

  // Import CSV file
  importCsv: async (file: File): Promise<UploadCsvResponse> => {
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await api.post('/api/call-records/import-csv', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        },
        timeout: 60000 // 60 seconds for file upload
      });
      return response.data.data;
    } catch (error: any) {
      console.error('❌ Error importing CSV:', error);
      throw error;
    }
  },

  // Export call records as CSV file (date range)
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

  // Export call records for specific date as CSV
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

  // Export daily summary to Excel
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

  // Export overall summary to Excel
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

  // Delete call records for specific date
  deleteCallRecords: async (date: string): Promise<boolean> => {
    try {
      console.log('🗑️ Delete API call for date:', date);
      
      const response = await api.delete(`/api/call-records/${date}`);
      
      console.log('📊 Delete API Response:', response.data);
      
      // Handle response structure based on BE
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

  // Get fleet statistics
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