// ── Tipos ─────────────────────────────────────────────────────────────────
export type EstadoOrden = 'PENDIENTE' | 'PAGADA' | 'CANCELADA' | 'EXPIRADA';

// ── Áreas responsables ────────────────────────────────────────────────────
export const AREAS_RESPONSABLES: { value: string; label: string }[] = [
  { value: 'REGISTRO_CIVIL', label: 'Registro Civil' },
  { value: 'PREDIAL', label: 'Predial' },
  { value: 'AGUA', label: 'Organismo de Agua' },
  { value: 'LICENCIAS', label: 'Licencias y Permisos' },
  { value: 'TESORERIA', label: 'Tesorería General' },
  { value: 'CATASTRO', label: 'Catastro' },
  { value: 'OBRAS_PUBLICAS', label: 'Obras Públicas' },
  { value: 'JURIDICO', label: 'Jurídico' },
];

export function areaLabel(value: string): string {
  return AREAS_RESPONSABLES.find((a) => a.value === value)?.label ?? value;
}

// ── Métricas ──────────────────────────────────────────────────────────────
export interface OrdenPagoMetrics {
  pendientes: number;
  recaudadoMes: number;
  porExpirar24h: number;
  tasaConversion: number;
}

// ── Entidad principal ─────────────────────────────────────────────────────
export interface OrdenPago {
  _id: string;
  token: string;
  monto: number;
  descripcion: string;
  estado: EstadoOrden;
  expiresAt: string;
  areaResponsable?: string;
  createdAt: string;
  servicioId?: { _id: string; nombre: string; costo: number };
  ciudadanoId?: {
    _id: string;
    nombre: string;
    apellidoPaterno: string;
    apellidoMaterno?: string;
  };
  creadaPorId?: { _id: string; nombre: string; email: string };
  pagoId?: { _id: string; folio: string };
}

// ── DTOs ──────────────────────────────────────────────────────────────────
export interface GenerarOrdenDto {
  descripcion: string;
  monto: number;
  areaResponsable?: string;
  horasValidez?: number;
  ciudadanoId?: string;
  emailCiudadano?: string;
  servicioId?: string;
}

export interface GenerarOrdenResponse {
  _id: string;
  token: string;
  monto: number;
  descripcion: string;
  estado: EstadoOrden;
  expiresAt: string;
  areaResponsable?: string;
  ciudadanoId?: string;
  creadaPorId: string;
  createdAt: string;
}

// ── Respuestas de acciones ────────────────────────────────────────────────
export interface ReenviarLinkResponse {
  url: string;
  expiraEn: string;
}

export interface ReciboOrdenResponse {
  url: string;
  expiresIn: number;
  message: string;
}

// ── Vista pública (sin auth) ─────────────────────────────────────────────
export interface OrdenPagoPublica {
  token: string;
  monto: number;
  descripcion: string;
  estado: EstadoOrden;
  expiresAt: string;
  areaResponsable?: string;
  municipioNombre: string;
  ciudadanoNombre?: string;
}

export interface PaymentIntentResponse {
  clientSecret: string;
  monto: number;
}

export interface PagoResponse {
  folio: string;
  pagoId: string;
}

export interface ReciboResponse {
  url: string;
}

// ── Filtros de tabla ──────────────────────────────────────────────────────
export interface OrdenFiltros {
  estado?: EstadoOrden | '';
  busqueda?: string;
  fechaDesde?: string;
  fechaHasta?: string;
}
