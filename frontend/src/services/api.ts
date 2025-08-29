import axios, { AxiosInstance, AxiosResponse } from 'axios';
import { toast } from 'react-toastify';

class ApiService {
  private api: AxiosInstance;

  constructor() {
    this.api = axios.create({
      baseURL: '/api',
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.setupInterceptors();
  }

  private setupInterceptors() {
    // Request interceptor to add auth token
    this.api.interceptors.request.use(
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

    // Response interceptor to handle errors globally
    this.api.interceptors.response.use(
      (response: AxiosResponse) => {
        return response;
      },
      (error) => {
        if (error.response) {
          const { status, data } = error.response;
          
          switch (status) {
            case 401:
              // Unauthorized - clear token and redirect to login
              localStorage.removeItem('authToken');
              localStorage.removeItem('user');
              window.location.href = '/login';
              toast.error('Session expired. Please login again.');
              break;
            case 403:
              toast.error('Access denied');
              break;
            case 404:
              toast.error('Resource not found');
              break;
            case 422:
              toast.error(data.error || 'Validation error');
              break;
            case 500:
              toast.error('Server error. Please try again later.');
              break;
            default:
              toast.error(data.error || 'An error occurred');
          }
        } else if (error.request) {
          toast.error('Network error. Please check your connection.');
        } else {
          toast.error('An unexpected error occurred');
        }
        
        return Promise.reject(error);
      }
    );
  }

  // Generic HTTP methods
  async get<T>(url: string, params?: any): Promise<T> {
    const response = await this.api.get(url, { params });
    return response.data;
  }

  async post<T>(url: string, data?: any): Promise<T> {
    const response = await this.api.post(url, data);
    return response.data;
  }

  async put<T>(url: string, data?: any): Promise<T> {
    const response = await this.api.put(url, data);
    return response.data;
  }

  async delete<T>(url: string): Promise<T> {
    const response = await this.api.delete(url);
    return response.data;
  }

  // File upload method
  async uploadFile<T>(url: string, file: File, onProgress?: (progress: number) => void): Promise<T> {
    const formData = new FormData();
    formData.append('file', file);

    const response = await this.api.post(url, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress: (progressEvent) => {
        if (onProgress && progressEvent.total) {
          const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          onProgress(progress);
        }
      },
    });

    return response.data;
  }

  // Set auth token
  setAuthToken(token: string) {
    localStorage.setItem('authToken', token);
  }

  // Clear auth token
  clearAuthToken() {
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
  }

  // Get current token
  getAuthToken(): string | null {
    return localStorage.getItem('authToken');
  }
}

export default new ApiService();