import apiService from './api';
import { 
  AuthResponse, 
  LoginCredentials, 
  RegisterData, 
  User 
} from '../types';

class AuthService {
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const response = await apiService.post<AuthResponse>('/auth/login', credentials);
    
    if (response.token) {
      apiService.setAuthToken(response.token);
      localStorage.setItem('user', JSON.stringify(response.user));
    }
    
    return response;
  }

  async register(data: RegisterData): Promise<AuthResponse> {
    const response = await apiService.post<AuthResponse>('/auth/register', data);
    
    if (response.token) {
      apiService.setAuthToken(response.token);
      localStorage.setItem('user', JSON.stringify(response.user));
    }
    
    return response;
  }

  async getProfile(): Promise<{ user: User }> {
    return apiService.get<{ user: User }>('/auth/profile');
  }

  async updateProfile(data: Partial<User>): Promise<{ message: string }> {
    return apiService.put<{ message: string }>('/auth/profile', data);
  }

  logout(): void {
    apiService.clearAuthToken();
  }

  getCurrentUser(): User | null {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  }

  isAuthenticated(): boolean {
    return !!apiService.getAuthToken();
  }
}

export default new AuthService();