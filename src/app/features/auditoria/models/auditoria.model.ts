// ── Enums ──────────────────────────────────────────────────────────────────
export type AuditModulo =
  | 'AUTH'
  | 'USUARIOS'
  | 'DIF'
  | 'TESORERIA'
  | 'PRESIDENCIA'
  | 'SECRETARIA_AYUNTAMIENTO'
  | 'REGISTRO_CIVIL'
  | 'COMUNICACION_SOCIAL'
  | 'UIPPE'
  | 'CONTRALORIA'
  | 'SEGURIDAD_PUBLICA'
  | 'SERVICIOS_PUBLICOS'
  | 'DESARROLLO_URBANO'
  | 'DESARROLLO_ECONOMICO'
  | 'DESARROLLO_SOCIAL'
  | 'ORGANISMO_AGUA'
  | 'MUNICIPIOS'
  | 'CITAS'
  | 'REPORTES'
  | 'AUDITORIA'
  | 'CIUDADANOS'
  | 'PAGOS';

export type AuditAccion =
  | 'CREATE'
  | 'UPDATE'
  | 'DELETE'
  | 'VIEW'
  | 'LOGIN'
  | 'LOGOUT'
  | 'EXPORT'
  | 'DOWNLOAD';

// ── Filtros bitácora ───────────────────────────────────────────────────────
export interface AuditoriaFiltros {
  modulo?: AuditModulo;
  accion?: AuditAccion;
  usuarioId?: string;
  entidad?: string;
  desde?: string; // YYYY-MM-DD
  hasta?: string; // YYYY-MM-DD
}

// ── Params bitácora (filtros + paginación) ─────────────────────────────────
export interface AuditoriaLogsParams extends AuditoriaFiltros {
  page?: number; // default 1
  limit?: number; // default 50, max 200
}

// ── Respuesta paginada ─────────────────────────────────────────────────────
export interface AuditoriaLogsPaginado {
  data: AuditoriaLog[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// ── Log entry ──────────────────────────────────────────────────────────────
export interface AuditoriaLog {
  _id: string;
  modulo: AuditModulo;
  accion: AuditAccion;
  entidad: string;
  entidadId?: string;
  descripcion: string;
  usuarioId: { nombre: string; email: string } | null;
  rol: string;
  ip: string;
  userAgent: string;
  cambios: {
    antes: unknown;
    despues: unknown;
  } | null;
  metadata?: Record<string, unknown>;
  createdAt: string;
}

// ── Crear log manual ───────────────────────────────────────────────────────
export interface CrearAuditoriaLogDto {
  modulo: AuditModulo;
  accion: AuditAccion;
  entidad: string;
  entidadId?: string;
  descripcion: string;
  cambios?: { antes: unknown; despues: unknown };
  metadata?: Record<string, unknown>;
}

// ── Dashboard ──────────────────────────────────────────────────────────────
export interface AuditoriaDashboardResumen {
  accionesTotales: number;
  usuariosActivos: number;
  modulosAuditados: number;
  ultimosAccesos: number;
  periodo: string;
}

export interface ActividadPorModulo {
  modulo: AuditModulo | string;
  acciones: number;
}

export interface AccionCritica {
  fecha: string;
  accion: AuditAccion;
  modulo: AuditModulo | string;
  entidad: string;
  entidadId?: string;
  usuario: string;
  descripcion: string;
}

export interface AccesoReciente {
  fecha: string;
  usuario: string;
  email: string;
  rol: string;
  ip: string;
  userAgent: string;
}
