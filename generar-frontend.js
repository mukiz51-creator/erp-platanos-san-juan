const fs = require('fs');
const path = require('path');

const basePath = './frontend/src';

console.log('🚀 Generando archivos del frontend...\n');

// 1. CREAR api.service.ts
const apiServiceContent = `import axios, { AxiosInstance, AxiosError } from 'axios';
import * as types from '@/types/api';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

class ApiService {
  private api: AxiosInstance;
  private token: string | null = null;

  constructor() {
    this.api = axios.create({
      baseURL: API_BASE_URL,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.api.interceptors.request.use((config) => {
      if (this.token) {
        config.headers.Authorization = \`Bearer \${this.token}\`;
      }
      return config;
    });

    this.api.interceptors.response.use(
      (response) => response,
      (error: AxiosError) => {
        if (error.response?.status === 401) {
          this.logout();
        }
        return Promise.reject(error);
      }
    );

    if (typeof window !== 'undefined') {
      this.token = localStorage.getItem('access_token');
    }
  }

  async login(email: string, password: string): Promise<types.LoginResponse> {
    const response = await this.api.post<types.LoginResponse>('/auth/login', {
      email,
      password,
    });
    this.setToken(response.data.access_token);
    return response.data;
  }

  async logout(): Promise<void> {
    this.token = null;
    if (typeof window !== 'undefined') {
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
    }
  }

  setToken(token: string): void {
    this.token = token;
    if (typeof window !== 'undefined') {
      localStorage.setItem('access_token', token);
    }
  }

  async getMe(): Promise<types.Usuario> {
    const response = await this.api.get<types.Usuario>('/usuarios/me');
    return response.data;
  }

  async getClientes(): Promise<types.Cliente[]> {
    const response = await this.api.get<types.Cliente[]>('/clientes');
    return response.data;
  }

  async getProductos(): Promise<types.Producto[]> {
    const response = await this.api.get<types.Producto[]>('/productos');
    return response.data;
  }

  async getVentas(): Promise<types.Venta[]> {
    const response = await this.api.get<types.Venta[]>('/ventas');
    return response.data;
  }

  async getInventario(): Promise<types.Inventario[]> {
    const response = await this.api.get<types.Inventario[]>('/inventario');
    return response.data;
  }

  async getCreditos(): Promise<types.Credito[]> {
    const response = await this.api.get<types.Credito[]>('/creditos');
    return response.data;
  }

  async getDashboardStats(): Promise<types.DashboardStats> {
    const response = await this.api.get<types.DashboardStats>('/reportes/dashboard');
    return response.data;
  }
}

export const apiService = new ApiService();
`;

fs.writeFileSync(path.join(basePath, 'services', 'api.service.ts'), apiServiceContent);
console.log('✅ Archivo creado: services/api.service.ts');

// 2. CREAR auth.store.ts
const authStoreContent = `'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import * as types from '@/types/api';
import { apiService } from '@/services/api.service';

interface AuthStore {
  usuario: types.Usuario | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  setUser: (usuario: types.Usuario) => void;
  clearError: () => void;
}

export const useAuthStore = create<AuthStore>(
  persist(
    (set) => ({
      usuario: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      login: async (email: string, password: string) => {
        set({ isLoading: true, error: null });
        try {
          const response = await apiService.login(email, password);
          const usuario = await apiService.getMe();
          set({
            usuario,
            isAuthenticated: true,
            isLoading: false,
          });
        } catch (error: any) {
          set({
            error: error.message || 'Error al iniciar sesión',
            isLoading: false,
          });
          throw error;
        }
      },

      logout: () => {
        apiService.logout();
        set({
          usuario: null,
          isAuthenticated: false,
          error: null,
        });
      },

      setUser: (usuario: types.Usuario) => {
        set({ usuario, isAuthenticated: true });
      },

      clearError: () => set({ error: null }),
    }),
    {
      name: 'auth-store',
    }
  )
);
`;

fs.writeFileSync(path.join(basePath, 'store', 'auth.store.ts'), authStoreContent);
console.log('✅ Archivo creado: store/auth.store.ts');

// 3. CREAR login/page.tsx
const loginPageContent = `'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth.store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const { login, isLoading, error, clearError } = useAuthStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();

    try {
      await login(email, password);
      router.push('/dashboard');
    } catch (err) {
      // Error ya está en el store
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-900 to-slate-800">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl">🍌 Plátanos San Juan</CardTitle>
          <CardDescription>ERP - Sistema de Distribución</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="flex items-center gap-2 p-3 bg-red-100 text-red-800 rounded-md">
                <AlertCircle className="w-5 h-5" />
                <span className="text-sm">{error}</span>
              </div>
            )}

            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium">
                Email
              </label>
              <Input
                id="email"
                type="email"
                placeholder="admin@platanos.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-medium">
                Contraseña
              </label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
            </Button>

            <div className="text-center text-sm text-slate-600">
              <p>Usuario: admin@platanos.com</p>
              <p>Contraseña: Admin123!</p>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
`;

fs.writeFileSync(path.join(basePath, 'app', 'auth', 'login', 'page.tsx'), loginPageContent);
console.log('✅ Archivo creado: app/auth/login/page.tsx');

// 4. CREAR dashboard/page.tsx
const dashboardPageContent = `'use client';

import { useEffect, useState } from 'react';
import { useAuthStore } from '@/store/auth.store';
import { useRouter } from 'next/navigation';
import { apiService } from '@/services/api.service';
import * as types from '@/types/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart3, Users, Package, TrendingUp, AlertCircle, DollarSign } from 'lucide-react';

export default function DashboardPage() {
  const router = useRouter();
  const { usuario, isAuthenticated } = useAuthStore();
  const [stats, setStats] = useState<types.DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/auth/login');
      return;
    }

    loadStats();
  }, [isAuthenticated, router]);

  const loadStats = async () => {
    try {
      const data = await apiService.getDashboardStats();
      setStats(data);
    } catch (error) {
      console.error('Error cargando estadísticas:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-slate-600">Bienvenido, {usuario?.nombre}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ventas Hoy</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">\\$\${stats?.total_ventas_hoy || 0}</div>
            <p className="text-xs text-muted-foreground">Últimas 24 horas</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Clientes</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.total_clientes || 0}</div>
            <p className="text-xs text-muted-foreground">Clientes activos</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Productos</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.total_productos || 0}</div>
            <p className="text-xs text-muted-foreground">Ítems en catálogo</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Bajo Stock</CardTitle>
            <AlertCircle className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{stats?.inventario_bajo || 0}</div>
            <p className="text-xs text-muted-foreground">Productos alertados</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Créditos Vencidos</CardTitle>
            <AlertCircle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats?.creditos_vencidos || 0}</div>
            <p className="text-xs text-muted-foreground">Pendientes de pago</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ingresos Mes</CardTitle>
            <DollarSign className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">\\$\${stats?.ingresos_mes || 0}</div>
            <p className="text-xs text-muted-foreground">Mes actual</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
`;

fs.writeFileSync(path.join(basePath, 'app', 'dashboard', 'page.tsx'), dashboardPageContent);
console.log('✅ Archivo creado: app/dashboard/page.tsx');

// 5. CREAR .env.local
const envContent = `NEXT_PUBLIC_API_URL=http://localhost:3001/api
`;

fs.writeFileSync('./frontend/.env.local', envContent);
console.log('✅ Archivo creado: .env.local');

console.log('\n🎉 ¡Todos los archivos fueron creados exitosamente!');
console.log('\n📝 Próximos pasos:');
console.log('1. cd frontend');
console.log('2. npm run dev');
console.log('3. Abre http://localhost:3000 en tu navegador');
`;

fs.writeFileSync('./generar-frontend.js', generarFrontendContent);
console.log('✅ Script generador creado');