// ── Info del módulo de reportes público ───────────────────────────────────
export interface InfoReportesPublica {
  activo: boolean;
  mensajeBienvenida: string;
  tiempoRespuestaEstimado: string;
}

// ── Categoría pública (solo activas) ─────────────────────────────────────
export interface CategoriaReportePublica {
  clave: string;
  nombre: string;
  descripcion: string;
  areaResponsable: string;
  modulo: string;
}

// ── DTO para crear un reporte público ─────────────────────────────────────
export interface UbicacionReportePublico {
  descripcion?: string;
  lat?: number;
  lng?: number;
}

export interface CrearReportePublicoDto {
  categoria: string;
  descripcion: string;
  ubicacion: UbicacionReportePublico;
  nombre?: string;
  telefono?: string;
  correo?: string;
  recibirNotificaciones?: boolean;
}

// ── Respuesta al crear ────────────────────────────────────────────────────
export interface RespuestaReporteCreado {
  folio: string;
  tokenConsulta: string;
  estado: string;
  mensaje: string;
  categoria: string;
  areaResponsable: string;
}

// ── Historial público (sin notaInterna) ───────────────────────────────────
export interface HistorialReportePublico {
  estado: string;
  fecha: string;
  comentarioPublico: string;
  cambiadoPor?: string;
}

// ── Reporte público completo (resultado de consultar) ─────────────────────
export interface ReportePublico {
  folio: string;
  categoria: string;
  categoriaNombre: string;
  descripcion: string;
  ubicacion: UbicacionReportePublico;
  estado: string;
  areaResponsable: string;
  fechaCreacion: string;
  historial: HistorialReportePublico[];
}

// ── Métricas públicas ─────────────────────────────────────────────────────
export interface MetricaPorCategoria {
  categoria: string;
  categoriaNombre: string;
  total: number;
  resueltos: number;
}

export interface ReporteResueltoPuntos {
  folio: string;
  categoriaNombre: string;
  fechaResolucion: string;
  areaResponsable: string;
}

export interface MetricasReportesPublicas {
  totalMes: number;
  resueltoseMes: number;
  tasaResolucion: number;
  tiempoPromedioResolucion: number;
  porCategoria: MetricaPorCategoria[];
  ultimos5Resueltos: ReporteResueltoPuntos[];
}
