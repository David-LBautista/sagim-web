// ── Tipos ─────────────────────────────────────────────────────────────────
export type EstadoOrdenInterna = 'PENDIENTE' | 'PAGADA' | 'CANCELADA';

// ── Entidades pobladas ─────────────────────────────────────────────────────
export interface CiudadanoPoblado {
  _id: string;
  nombre: string;
  apellidoPaterno: string;
  apellidoMaterno?: string;
  curp: string;
}

export interface ServicioPoblado {
  _id: string;
  nombre: string;
  costoBase: number;
}

export interface UsuarioPoblado {
  _id: string;
  nombre: string;
  email: string;
}

// ── Entidad principal ─────────────────────────────────────────────────────
export interface OrdenInterna {
  _id: string;
  folio: string;
  tipo: 'INTERNA';
  estado: EstadoOrdenInterna;
  monto: number;
  descripcion: string;
  areaResponsable: string;
  observaciones?: string | null;
  nombreContribuyente?: string | null;
  folioDocumento?: string | null;
  ciudadanoId?: CiudadanoPoblado | null;
  servicioId?: ServicioPoblado | null;
  creadaPorId: UsuarioPoblado;
  municipioId?: string;
  token?: string;
  createdAt: string;
}

// ── DTO ────────────────────────────────────────────────────────────────────
export interface CrearOrdenInternaDto {
  ciudadanoId?: string;
  nombreContribuyente?: string;
  servicioId?: string;
  folioDocumento?: string;
  monto: number;
  descripcion: string;
  areaResponsable: string;
  observaciones?: string;
}

// ── Respuestas ─────────────────────────────────────────────────────────────
export interface CrearOrdenInternaResponse {
  success: boolean;
  data: OrdenInterna;
}

export interface ListarOrdenInternaResponse {
  success: boolean;
  data: OrdenInterna[];
}

// ── Filtros ────────────────────────────────────────────────────────────────
export interface FiltrosOrdenInterna {
  estado?: EstadoOrdenInterna | '';
  areaResponsable?: string;
  ciudadanoId?: string;
  busqueda?: string;
  fechaDesde?: string;
  fechaHasta?: string;
}

// ── Cobro desde caja ──────────────────────────────────────────────────────
export interface CobrarOrdenDto {
  metodoPago: 'EFECTIVO' | 'TARJETA' | 'TRANSFERENCIA';
  nombreContribuyente?: string;
  folioDocumento?: string;
  observaciones?: string;
}

// ── Utilidades ─────────────────────────────────────────────────────────────
export function nombreCiudadano(c: CiudadanoPoblado): string {
  return [c.nombre, c.apellidoPaterno, c.apellidoMaterno]
    .filter(Boolean)
    .join(' ');
}
