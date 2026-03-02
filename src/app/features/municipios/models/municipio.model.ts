export interface EstadoRef {
  _id: string;
  clave: string;
  nombre: string;
}

export interface AdminRef {
  _id: string;
  municipioId: string;
  nombre: string;
  email: string;
  activo: boolean;
}

export interface Municipio {
  id?: number;
  _id: string;
  nombre: string;
  estadoId?: EstadoRef;
  estado?: string;
  claveInegi: string;
  poblacion?: number;
  config?: MunicipioConfig;
  contactoEmail?: string;
  contactoTelefono?: string;
  direccion?: string;
  activo?: boolean;
  logoUrl?: string;
  admin?: AdminRef;
  createdAt?: string;
  updatedAt?: string;
}

export interface MunicipioConfig {
  modulos: Record<string, boolean>;
}

export interface MunicipioCreateDto {
  nombre: string;
  estado: string;
  poblacion?: number;
  config?: MunicipioConfig;
  contactoEmail?: string;
  contactoTelefono?: string;
  direccion?: string;
  adminEmail: string;
  adminPassword: string;
  adminNombre: string;
}

export interface MunicipioUpdateDto {
  nombre?: string;
  estado?: string;
  claveInegi?: string;
  poblacion?: number;
  config?: MunicipioConfig;
  contactoEmail?: string;
  contactoTelefono?: string;
  direccion?: string;
  activo?: boolean;
  adminNombre?: string;
  adminEmail?: string;
  adminPassword?: string;
}
