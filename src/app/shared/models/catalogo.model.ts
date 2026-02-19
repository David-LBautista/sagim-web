/**
 * Interface para Estado del catálogo
 */
export interface Estado {
  _id: string;
  clave: string;
  nombre: string;
  activo: boolean;
  createdAt: string;
  updatedAt: string;
}

/**
 * Interface para Municipio del catálogo
 */
export interface MunicipioCatalogo {
  _id: string;
  nombre: string;
  claveInegi: string;
  poblacion: number;
  estadoId: string;
  activo: boolean;
  createdAt: string;
  updatedAt: string;
  __v?: number;
}

/**
 * Interface para Rol del catálogo
 */
export interface Rol {
  _id: string;
  nombre: string;
  descripcion: string;
  activo: boolean;
  createdAt: string;
  updatedAt: string;
}
