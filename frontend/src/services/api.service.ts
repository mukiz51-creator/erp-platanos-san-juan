import axios from 'axios';
import * as types from '@/types/api';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

class ApiService {
  private api = axios.create({
    baseURL: API_BASE_URL,
    headers: { 'Content-Type': 'application/json' },
  });
  private token: string | null = null;

  constructor() {
    this.api.interceptors.request.use((config) => {
      if (this.token) {
        config.headers.Authorization = `Bearer ${this.token}`;
      }
      return config;
    });

    if (typeof window !== 'undefined') {
      this.token = localStorage.getItem('access_token');
    }
  }

  async login(email: string, password: string) {
    const response = await this.api.post('/auth/login', { email, password });
    this.setToken(response.data.access_token);
    return response.data;
  }

  setToken(token: string) {
    this.token = token;
    if (typeof window !== 'undefined') {
      localStorage.setItem('access_token', token);
    }
  }

  async getMe() {
    return (await this.api.get('/usuarios/me')).data;
  }

  async getDashboardStats() {
    return (await this.api.get('/reportes/dashboard')).data;
  }

  logout() {
    this.token = null;
    if (typeof window !== 'undefined') {
      localStorage.removeItem('access_token');
    }
  }
}

export const apiService = new ApiService();