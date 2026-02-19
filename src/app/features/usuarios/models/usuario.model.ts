export interface Usuario {
  _id: string;
  nombre: string;
  email: string;
  rol: UsuarioRol;
  municipioId?: {
    _id: string;
    nombre: string;
  };
  moduloId?: {
    _id: string;
    nombre: string;
    descripcion?: string;
  };
  telefono?: string;
  activo: boolean;
  ultimoAcceso?: string;
  createdAt?: string;
  updatedAt?: string;
}

export enum UsuarioRol {
  SUPER_ADMIN = 'SUPER_ADMIN',
  ADMIN = 'ADMIN',
  OPERADOR = 'OPERADOR',
}

export interface UsuarioCreateDto {
  nombre: string;
  email: string;
  password: string;
  rol: UsuarioRol;
  municipioId?: string;
  moduloId?: string;
  telefono?: string;
  activo?: boolean;
}

export interface UsuarioUpdateDto {
  nombre?: string;
  email?: string;
  password?: string;
  rol?: UsuarioRol;
  municipioId?: string;
  moduloId?: string;
  telefono?: string;
  activo?: boolean;
}

export interface UsuariosMetrics {
  total: number;
  activos: number;
  inactivos: number;
  porMunicipio?: number;
  porRol?: {
    superAdmin: number;
    admin: number;
    operador: number;
  };
}
