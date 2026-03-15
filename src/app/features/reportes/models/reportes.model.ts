// ── Tipos base ────────────────────────────────────────────────────────────────
export type EstadoReporte =
  | 'pendiente'
  | 'en_proceso'
  | 'resuelto'
  | 'cancelado';
export type PrioridadReporte = 'baja' | 'normal' | 'alta' | 'urgente';
export type OrigenReporte = 'portal_publico' | 'interno' | 'telefono';
export type CategoriaReporte =
  | 'infraestructura_vial'
  | 'alumbrado_publico'
  | 'agua_drenaje'
  | 'basura_limpieza'
  | 'areas_verdes'
  | 'medio_ambiente'
  | 'seguridad_publica'
  | 'transito_vialidad'
  | 'proteccion_civil'
  | 'otro';

export type ModuloReporte =
  | 'DESARROLLO_URBANO'
  | 'ORGANISMO_AGUA'
  | 'SERVICIOS_PUBLICOS'
  | 'SEGURIDAD_PUBLICA'
  | 'PRESIDENCIA';

// ── Labels y constantes ───────────────────────────────────────────────────────
export const ESTADO_REPORTE_LABELS: Record<EstadoReporte, string> = {
  pendiente: 'Pendiente',
  en_proceso: 'En proceso',
  resuelto: 'Resuelto',
  cancelado: 'Cancelado',
};

export const PRIORIDAD_REPORTE_LABELS: Record<PrioridadReporte, string> = {
  baja: 'Baja',
  normal: 'Normal',
  alta: 'Alta',
  urgente: 'Urgente',
};

export const ORIGEN_REPORTE_LABELS: Record<OrigenReporte, string> = {
  portal_publico: 'Portal Público',
  interno: 'Interno',
  telefono: 'Teléfono',
};

export const CATEGORIA_REPORTE_LABELS: Record<CategoriaReporte, string> = {
  infraestructura_vial: 'Baches y Pavimento',
  alumbrado_publico: 'Alumbrado Público',
  agua_drenaje: 'Agua y Drenaje',
  basura_limpieza: 'Basura y Limpieza',
  areas_verdes: 'Áreas Verdes',
  medio_ambiente: 'Medio Ambiente',
  seguridad_publica: 'Seguridad Pública',
  transito_vialidad: 'Tránsito y Vialidad',
  proteccion_civil: 'Protección Civil',
  otro: 'Otro',
};

export const CATEGORIA_REPORTE_ICONS: Record<CategoriaReporte, string> = {
  infraestructura_vial: 'construction',
  alumbrado_publico: 'lightbulb',
  agua_drenaje: 'water_drop',
  basura_limpieza: 'delete_sweep',
  areas_verdes: 'park',
  medio_ambiente: 'eco',
  seguridad_publica: 'local_police',
  transito_vialidad: 'traffic',
  proteccion_civil: 'emergency',
  otro: 'report_problem',
};

export const MODULO_REPORTE_LABELS: Record<ModuloReporte, string> = {
  DESARROLLO_URBANO: 'Desarrollo Urbano',
  ORGANISMO_AGUA: 'Organismo de Agua',
  SERVICIOS_PUBLICOS: 'Servicios Públicos',
  SEGURIDAD_PUBLICA: 'Seguridad Pública',
  PRESIDENCIA: 'Presidencia',
};

// ── Interfaces del dominio ────────────────────────────────────────────────────
export interface UbicacionReporte {
  descripcion: string;
  colonia?: string;
  referencia?: string;
}

export interface CiudadanoReporte {
  nombre?: string;
  telefono?: string;
  correo?: string;
  recibirNotificaciones?: boolean;
}

export interface HistorialReporte {
  _id: string;
  fecha: string;
  estado?: EstadoReporte;
  estadoAnterior?: EstadoReporte;
  estadoNuevo?: EstadoReporte;
  usuario: string;
  nombreUsuario?: string;
  comentarioPublico?: string;
  notaInterna?: string;
  tipo: string;
}

export interface Reporte {
  _id: string;
  folio: string;
  municipioId: string;
  categoria: CategoriaReporte;
  categoriaNombre: string;
  areaResponsable: string;
  modulo: ModuloReporte;
  descripcion: string;
  ubicacion: UbicacionReporte;
  ciudadano: CiudadanoReporte;
  evidencia: string[];
  estado: EstadoReporte;
  prioridad: PrioridadReporte;
  origen: OrigenReporte;
  visible: boolean;
  asignadoA: string | null;
  nombreAsignado: string;
  fechaResolucion: string | null;
  historial: HistorialReporte[];
  createdAt: string;
  updatedAt: string;
}

// ── Listado paginado ──────────────────────────────────────────────────────────
export interface ResumenReportes {
  pendientes: number;
  enProceso: number;
  resueltos: number;
  cancelados: number;
}

export interface PaginatedReportes {
  data: Reporte[];
  total: number;
  page: number;
  totalPages: number;
  resumen: ResumenReportes;
}

// ── Filtros ───────────────────────────────────────────────────────────────────
export interface FiltrosReportes {
  categoria?: CategoriaReporte;
  estado?: EstadoReporte;
  modulo?: ModuloReporte;
  prioridad?: PrioridadReporte;
  origen?: OrigenReporte;
  asignadoA?: string;
  fechaInicio?: string;
  fechaFin?: string;
  buscar?: string;
  page?: number;
  limit?: number;
}

// ── DTOs para mutaciones ─────────────────────────────────────────────────────
export interface CrearReporteInternoDto {
  categoria: CategoriaReporte;
  descripcion: string;
  ubicacion: { descripcion: string; colonia?: string; referencia?: string };
  nombre?: string;
  telefono?: string;
  prioridad?: PrioridadReporte;
  origen?: 'interno' | 'telefono';
}

export interface CambiarEstadoReporteDto {
  estado: 'en_proceso' | 'resuelto' | 'cancelado';
  comentarioPublico?: string;
  notaInterna?: string;
}

export interface AsignarReporteDto {
  usuarioId: string;
  nombreAsignado: string;
  notaInterna?: string;
}

export interface CambiarPrioridadDto {
  prioridad: PrioridadReporte;
}

export interface CambiarVisibilidadDto {
  visible: boolean;
}

// ── Métricas ──────────────────────────────────────────────────────────────────
export interface MetricasReportes {
  totalMes: number;
  resueltoseMes: number;
  pendientes: number;
  enProceso: number;
  cancelados: number;
  tasaResolucion: number;
  tiempoPromedioResolucion: number;
  porCategoria: Array<{
    clave: string;
    nombre: string;
    total: number;
    resueltos: number;
  }>;
  porModulo: Array<{
    modulo: string;
    total: number;
    resueltos: number;
    pendientes: number;
  }>;
  porOrigen: { portalPublico: number; interno: number; telefono: number };
  porPrioridad: { baja: number; normal: number; alta: number; urgente: number };
  tendencia: Array<{ fecha: string; total: number; resueltos: number }>;
}

// ── Configuración ─────────────────────────────────────────────────────────────
export interface ConfiguracionReportes {
  municipioId: string;
  categoriasActivas: CategoriaReporte[];
  mensajeBienvenida: string;
  tiempoRespuestaEstimado: string;
  activo: boolean;
}

export interface CatalogoCategoriaReporte {
  clave: CategoriaReporte;
  nombre: string;
  descripcion: string;
  icono: string;
  areaResponsable: string;
  modulo: ModuloReporte;
}

export interface ActualizarConfigReportesDto {
  categoriasActivas?: CategoriaReporte[];
  mensajeBienvenida?: string;
  tiempoRespuestaEstimado?: string;
  activo?: boolean;
}

// ── Filtros para mis reportes ─────────────────────────────────────────────────
export interface MisReportesResponse {
  data: Reporte[];
  total: number;
}
