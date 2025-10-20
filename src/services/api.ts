import axios from 'axios';
import { LoginRequest, User } from '../types/auth';
import { CallRecord, DailySummary, UploadCsvResponse, CallRecordsResponse } from '../types/callRecord';

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
    const token = response.data.data.token;
    localStorage.setItem('authToken', token);
    localStorage.setItem('user', JSON.stringify(response.data.data.user));
    return response.data.data;
  },

  getProfile: async (): Promise<User> => {
    const response = await api.get('/auth/profile');
    return response.data.data;
  },

  logout: () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
  }
};

export const callRecordApi = {
  // Get daily summary untuk tanggal tertentu
  getDailySummary: async (date: string): Promise<DailySummary> => {
    const response = await api.get(`/call-records/summary/daily/${date}`);
    return response.data.data;
  },

  // Get overall summary dengan range tanggal
  getOverallSummary: async (startDate: string, endDate: string): Promise<any> => {
    const response = await api.get(`/call-records/summary/overall?startDate=${startDate}&endDate=${endDate}`);
    return response.data.data;
  },

  // Get call records dengan pagination dan filtering
  getCallRecords: async (startDate: string, endDate: string, pageSize: number = 1000): Promise<CallRecord[]> => {
    try {
      const response = await api.get(`/call-records?startDate=${startDate}&endDate=${endDate}&pageSize=${pageSize}`);
      
      console.log('Full API Response:', response.data);
      
      // Cek berbagai kemungkinan struktur
      const responseData = response.data;
      
      if (responseData.data?.items) {
        return responseData.data.items;
      } else if (responseData.items) {
        return responseData.items;
      } else if (responseData.data) {
        return responseData.data;
      } else {
        return responseData;
      }
    } catch (error) {
      console.error('Error fetching call records:', error);
      return [];
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
    const response = await api.delete(`/call-records/${date}`);
    return response.data.data.deleted;
  }
};