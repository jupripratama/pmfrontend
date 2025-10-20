import axios from 'axios';
import { LoginRequest, User } from '../types/auth';
import { CallRecord, DailySummary, UploadCsvResponse } from '../types/callRecord';

const API_BASE_URL = 'http://localhost:5116/api';

const api = axios.create({
  baseURL: API_BASE_URL,
});

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
    const token = localStorage.getItem('authToken');
    const response = await api.get('/auth/profile', {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data.data;
  },

  logout: () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
  }
};

export const callRecordApi = {
  getDailySummary: async (date: string): Promise<DailySummary> => {
    const token = localStorage.getItem('authToken');
    const response = await api.get(`/call-records/summary/daily/${date}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data.data;
  },
  importCsv: async (file: File): Promise<UploadCsvResponse> => {
    const token = localStorage.getItem('authToken');
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await api.post('/call-records/import-csv', formData, {
      headers: { 
        Authorization: `Bearer ${token}`,
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data.data;
  },

  exportCsv: async (startDate: string, endDate: string): Promise<void> => {
    const token = localStorage.getItem('authToken');
    const response = await api.get(`/call-records/export/csv?startDate=${startDate}&endDate=${endDate}`, {
      headers: { Authorization: `Bearer ${token}` },
      responseType: 'blob'
    });
    
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `CallRecords_${startDate}_to_${endDate}.csv`);
    document.body.appendChild(link);
    link.click();
    link.remove();
  },

    getCallRecords: async (date: string): Promise<CallRecord[]> => {
  const token = localStorage.getItem('authToken');
  try {
    const response = await api.get(`/call-records?startDate=${date}&endDate=${date}&pageSize=1000`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
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

    
  
  
};