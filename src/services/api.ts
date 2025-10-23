import axios from 'axios';
import { LoginRequest, User } from '../types/auth';
import { CallRecord, DailySummary, UploadCsvResponse, CallRecordsResponse, FleetStatisticType, FleetStatisticsDto } from '../types/callRecord';

// Remove baseURL or set to empty string for proxy to work
const api = axios.create({
  baseURL: '', // Empty for proxy
  timeout: 30000, // Increase timeout
});

// Enhanced request interceptor with better logging
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // Log request details
    console.log('🚀 API Request:', {
      method: config.method?.toUpperCase(),
      url: config.url,
      params: config.params,
      data: config.data
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
      data: response.data
    });
    return response;
  },
  (error) => {
    console.error('❌ API Response Error:', {
      status: error.response?.status,
      message: error.message,
      url: error.config?.url,
      data: error.response?.data
    });
    
    // Handle specific error cases
    if (error.response?.status === 401) {
      console.warn('🛑 Unauthorized - Redirect to login');
      // You can add redirect to login here if needed
    } else if (error.response?.status === 403) {
      console.warn('🚫 Forbidden - Insufficient permissions');
    } else if (error.code === 'ERR_NETWORK') {
      console.error('🌐 Network Error - Check backend server');
    }
    
    return Promise.reject(error);
  }
);

// Auth API functions
export const authApi = {
  login: async (credentials: LoginRequest) => {
    const response = await api.post('/api/auth/login', credentials);
    const data = response.data.data;
    
    // Save token and user data
    localStorage.setItem('authToken', data.token);
    localStorage.setItem('user', JSON.stringify(data.user));
    localStorage.setItem('permissions', JSON.stringify(data.permissions));
    
    console.log('🔐 Login successful:', data.user);
    return data;
  },

  getProfile: async (): Promise<User> => {
    const response = await api.get('/api/auth/profile');
    return response.data.data;
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
        }
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