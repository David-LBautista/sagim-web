/**
 * Interfaces y tipos para la autenticación en SAGIM
 */

// ========================================
// REQUEST TYPES
// ========================================

/**
 * Payload para login de usuario
 */
export interface LoginRequest {
  email: string;
  password: string;
}

/**
 * Payload para refrescar el token
 */
export interface RefreshTokenRequest {
  refreshToken: string;
}

/**
 * Payload para logout (opcional si el backend lo requiere)
 */
export interface LogoutRequest {
  refreshToken?: string;
}

// ========================================
// RESPONSE TYPES
// ========================================

/**
 * Respuesta exitosa del login
 */
export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  user: User;
  expiresIn?: string; // Formato: "1h", "7d", etc.
  modulos: string[]; // Módulos habilitados para el usuario
  permisos: Record<string, string[]>; // Permisos agrupados por módulo
  municipio?: {
    nombre: string;
    logoUrl: string;
  };
}

/**
 * Respuesta exitosa del refresh token
 */
export interface RefreshTokenResponse {
  accessToken: string;
  refreshToken: string;
  expiresIn?: string;
}

/**
 * Respuesta de logout
 */
export interface LogoutResponse {
  message: string;
  success: boolean;
}

// ========================================
// USER TYPES
// ========================================

/**
 * Información del usuario autenticado de SAGIM
 */
export interface User {
  id: string;
  email: string;
  nombre: string;
  rol: string;
  municipioId: string;
  activo: boolean;
  telefono?: string;
  avatar?: string;
  createdAt?: string;
  updatedAt?: string;
}

/**
 * Roles de usuario en el sistema SAGIM
 */
export enum UserRole {
  SUPER_ADMIN = 'SUPER_ADMIN',
  ADMIN_MUNICIPIO = 'ADMIN_MUNICIPIO',
  ADMIN = 'ADMIN',
  DIF = 'DIF',
  OPERADOR = 'OPERADOR',
  USUARIO = 'USUARIO',
}

// ========================================
// ERROR TYPES
// ========================================

/**
 * Estructura de error de la API
 */
export interface ApiError {
  message: string;
  statusCode: number;
  error?: string;
  timestamp?: string;
}

/**
 * Error de autenticación
 */
export interface AuthError {
  message: string;
  code: AuthErrorCode;
}

export enum AuthErrorCode {
  INVALID_CREDENTIALS = 'INVALID_CREDENTIALS',
  TOKEN_EXPIRED = 'TOKEN_EXPIRED',
  INVALID_TOKEN = 'INVALID_TOKEN',
  UNAUTHORIZED = 'UNAUTHORIZED',
  ACCOUNT_LOCKED = 'ACCOUNT_LOCKED',
  ACCOUNT_DISABLED = 'ACCOUNT_DISABLED',
}
