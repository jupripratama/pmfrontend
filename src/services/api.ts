import axios from 'axios';
import { LoginRequest, User } from '../types/auth';
import { CallRecord, DailySummary, UploadCsvResponse, CallRecordsResponse, FleetStatisticType, FleetStatisticsDto } from '../types/callRecord';

const API_BASE_URL = 'http://localhost:5116/api';

const api = axios.create({
  baseURL: API_BASE_URL,
});

// Add request interceptor to include auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Simpan token ke localStorage
export const authApi = {
  login: async (credentials: LoginRequest) => {
    const response = await api.post('/auth/login', credentials);
    const data = response.data.data;
    
    // Simpan token dan user data
    localStorage.setItem('authToken', data.token);
    localStorage.setItem('user', JSON.stringify(data.user));
    localStorage.setItem('permissions', JSON.stringify(data.permissions)); // Simpan permissions terpisah
    
    return data;
  },

  getProfile: async (): Promise<User> => {
    const response = await api.get('/auth/profile');
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
  }
};

export const callRecordApi = {
  // Get daily summary untuk tanggal tertentu
 getDailySummary: async (date: string): Promise<DailySummary> => {
    try {
      console.log('📡 API Call: getDailySummary', { date });
      const response = await api.get(`/call-records/summary/daily/${date}`);
      console.log('📊 Daily Summary Response:', response.data);
      return response.data.data;
    } catch (error: any) {
      console.error('❌ Error loading daily summary:', error);
      throw error;
    }
  },

  // Get overall summary dengan range tanggal
  getOverallSummary: async (startDate: string, endDate: string): Promise<any> => {
    const response = await api.get(`/call-records/summary/overall?startDate=${startDate}&endDate=${endDate}`);
    return response.data.data;
  },

  // Get call records dengan pagination dan filtering
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

    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    params.append('page', page.toString());
    params.append('pageSize', pageSize.toString());
    if (search) params.append('search', search);
    if (callCloseReason !== undefined) params.append('callCloseReason', callCloseReason.toString());
    if (hourGroup !== undefined) params.append('hourGroup', hourGroup.toString());
    if (sortBy) params.append('sortBy', sortBy);
    if (sortDir) params.append('sortDir', sortDir);

    const response = await api.get(`/call-records?${params}`);
    
    console.log('📊 Full API Response:', response.data);
    
    // Return the entire response structure
    return response.data;
  } catch (error: any) {
    console.error('❌ Error fetching call records:', error);
    console.error('Error response:', error.response?.data);
    throw error;
  }
},


  // Import CSV file
  importCsv: async (file: File): Promise<UploadCsvResponse> => {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await api.post('/call-records/import-csv', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data.data;
  },

  // Export call records sebagai CSV file (range tanggal)
  exportCsv: async (startDate: string, endDate: string): Promise<void> => {
    const response = await api.get(`/call-records/export/csv?startDate=${startDate}&endDate=${endDate}`, {
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
  },

  // Export call records untuk tanggal tertentu sebagai CSV
  exportDailyCsv: async (date: string): Promise<void> => {
    const response = await api.get(`/call-records/export/csv/${date}`, {
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
  },

  // Export daily summary ke Excel
  exportDailySummaryExcel: async (date: string): Promise<void> => {
    const response = await api.get(`/call-records/export/daily-summary/${date}`, {
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
  },

  // Export overall summary ke Excel
  exportOverallSummaryExcel: async (startDate: string, endDate: string): Promise<void> => {
    const response = await api.get(`/call-records/export/overall-summary?startDate=${startDate}&endDate=${endDate}`, {
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
  },

  // Delete call records untuk tanggal tertentu
  deleteCallRecords: async (date: string): Promise<boolean> => {
    try {
      console.log('🗑️ Delete API call for date:', date);
      
      const response = await api.delete(`/call-records/${date}`);
      
      console.log('📊 Delete API Response:', response.data);
      
      // Handle response structure berdasarkan BE update
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
      console.error('Error response:', error.response?.data);
      
      // Handle error messages dari BE
      const errorMessage = error.response?.data?.message || error.message;
      
      if (error.response?.status === 403) {
        alert('Access denied: You do not have permission to delete call records');
      } else if (error.response?.status === 401) {
        alert('Authentication required: Please login again');
      } else if (errorMessage) {
        alert(`Error: ${errorMessage}`);
      } else {
        alert('Error deleting call records');
      }
      
      throw error;
    }
  },

  getFleetStatistics: async (
  date?: string, 
  top: number = 10, 
  type?: FleetStatisticType
  ): Promise<FleetStatisticsDto> => {
    try {
      console.log('📡 API Call: getFleetStatistics', { date, top, type });
      
      const params = new URLSearchParams();
      if (date) params.append('date', date);
      params.append('top', top.toString());
      if (type && type !== FleetStatisticType.All) {
        params.append('type', type);
      }

      const response = await api.get(`/call-records/fleet-statistics?${params}`);
      console.log('📊 Fleet Statistics Response:', response.data);
      
      return response.data.data;
    } catch (error: any) {
      console.error('❌ Error loading fleet statistics:', error);
      throw error;
    }
  },
};