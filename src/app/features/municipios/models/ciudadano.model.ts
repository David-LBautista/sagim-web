// ============================================================
// Submodelos
// ============================================================

export interface DireccionCiudadano {
  localidad: string;
  colonia: string;
  calle: string;
  numero: string;
  codigoPostal: string;
  referencias?: string;
}

// ============================================================
// Entidad completa
// ============================================================

export interface Ciudadano {
  _id: string;
  curp: string;
  nombre: string;
  apellidoPaterno: string;
  apellidoMaterno: string;
  fechaNacimiento: string; // ISO date string
  telefono?: string;
  email?: string;
  direccion: DireccionCiudadano;
  activo: boolean;
  municipioId: string;
  createdAt: string;
  updatedAt: string;
}

// ============================================================
// Versión resumida para autocomplete
// ============================================================

export interface CiudadanoResumen {
  _id: string;
  curp: string;
  nombre: string;
  apellidoPaterno: string;
  apellidoMaterno: string;
  telefono?: string;
  email?: string;
}

// ============================================================
// DTOs de escritura
// ============================================================

export interface CiudadanoCreateDto {
  curp: string;
  nombre: string;
  apellidoPaterno: string;
  apellidoMaterno: string;
  fechaNacimiento: string;
  telefono?: string;
  email?: string;
  direccion: DireccionCiudadano;
}

export interface CiudadanoUpdateDto {
  nombre?: string;
  apellidoPaterno?: string;
  apellidoMaterno?: string;
  fechaNacimiento?: string;
  telefono?: string;
  email?: string;
  direccion?: Partial<DireccionCiudadano>;
}

// ============================================================
// Respuesta paginada del listado
// ============================================================

export interface CiudadanosListResponse {
  data: Ciudadano[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// ============================================================
// Parámetros de consulta para el listado
// ============================================================

export interface CiudadanosListParams {
  page?: number;
  limit?: number;
  busqueda?: string;
  localidad?: string;
  activo?: boolean;
}

// ============================================================
// Estadísticas del padrón
// ============================================================

export interface CiudadanosEstadisticas {
  total: number;
  conEmail: number;
  registradosEsteMes: number;
}

// ============================================================
// Importación
// ============================================================

export interface ErrorImportacion {
  fila: number;
  nombre: string;
  error: string;
}

export interface ImportarPadronResponse {
  importados: number;
  actualizados: number;
  ignorados: number;
  errores: number;
  detalleErrores: ErrorImportacion[];
}

export type AccionDuplicados = 'ignorar' | 'actualizar';

export interface ImportarPadronParams {
  /** Archivo .xlsx / .xls / .csv */
  archivo: File;
  /** JSON serializado del mapeo de columnas */
  mapeo: string;
  accionDuplicados?: AccionDuplicados;
}

// ============================================================
// Respuesta al desactivar
// ============================================================

export interface DesactivarCiudadanoResponse {
  message: string;
}
