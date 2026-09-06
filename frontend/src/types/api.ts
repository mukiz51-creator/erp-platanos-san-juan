// Tipos para la API del backend

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  access_token: string;
  refresh_token: string;
}

export interface Usuario {
  id: string;
  email: string;
  nombre: string;
  apellidos?: string;
  activo: boolean;
  creado_en: string;
}

export interface Cliente {
  id: string;
  razon_social: string;
  nit: string;
  tipo: string;
  telefono?: string;
  email?: string;
  credito_maximo: number;
  credito_disponible: number;
  estado: string;
  creado_en: string;
}

export interface Producto {
  id: string;
  codigo: string;
  nombre: string;
  descripcion?: string;
  precio_base: number;
  unidad_medida: string;
  categoria: string;
  estado: string;
  creado_en: string;
}

export interface Venta {
  id: string;
  numero: string;
  cliente_id: string;
  tipo: string;
  metodo_pago: string;
  total_sin_impuestos: number;
  iva: number;
  descuento: number;
  total_con_impuestos: number;
  estado: string;
  creado_en: string;
}

export interface Inventario {
  id: string;
  producto_id: string;
  cantidad: number;
  cantidad_minima: number;
  cantidad_maxima: number;
}

export interface Credito {
  id: string;
  numero: string;
  cliente_id: string;
  monto: number;
  saldo_deudor: number;
  tasa_interes: number;
  estado: string;
  creado_en: string;
}

export interface DashboardStats {
  total_ventas_hoy: number;
  total_clientes: number;
  total_productos: number;
  inventario_bajo: number;
  creditos_vencidos: number;
  ingresos_mes: number;
}