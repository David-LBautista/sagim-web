export interface Municipio {
  id?: number;
  _id: string;
  nombre: string;
  estado: string;
  claveInegi: string;
  poblacion?: number;
  config?: MunicipioConfig;
  contactoEmail?: string;
  contactoTelefono?: string;
  direccion?: string;
  activo?: boolean;
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
}
