export type MetodoPago = 'EFECTIVO' | 'TARJETA';
export type CanalPago = 'CAJA' | 'EN_LINEA';

// ── Servicios para autocompletado ──────────────────────────────────────────
export interface ServicioCajaItem {
  _id: string;
  clave: string;
  nombre: string;
  descripcion: string;
  categoria: string;
  costo: number;
  montoVariable: boolean;
  requiereContribuyente: boolean;
  activo: boolean;
}

// ── Ciudadano ──────────────────────────────────────────────────────────────
export interface CiudadanoSearchResult {
  _id: string;
  nombre: string;
  apellidoPaterno: string;
  apellidoMaterno?: string;
  curp: string;
  nombreCompleto: string;
  email?: string;
  telefono?: string;
}

export interface CiudadanoCreateDto {
  nombre: string;
  apellidoPaterno: string;
  apellidoMaterno?: string;
  curp: string;
}

// ── Pago caja ──────────────────────────────────────────────────────────────
export interface PagoCajaDto {
  servicioId: string;
  monto: number;
  metodoPago: MetodoPago;
  ciudadanoId?: string;
  nombreContribuyente?: string;
  referenciaDocumento?: string;
  observaciones?: string;
}

export interface PagoCajaResponse {
  _id: string;
  folio: string;
  servicioId: string;
  servicioNombre: string;
  servicioCategoria: string;
  ciudadanoId: string | null;
  monto: number;
  metodoPago: MetodoPago;
  estado: string;
  canal: CanalPago;
  cajeroId: string;
  cajeroNombre: string;
  fechaPago: string;
  municipioId: string;
  reciboUrl: string | null;
}

export interface ReciboUrlResponse {
  reciboUrl: string;
  expiraEn: string;
}

// ── Reporte diario ─────────────────────────────────────────────────────────
export interface MovimientoDiario {
  _id: string;
  folio: string;
  hora: string;
  servicio: string;
  ciudadano: string | null;
  nombreContribuyente?: string | null;
  monto: number;
  metodoPago: MetodoPago;
  canal: CanalPago;
}

export interface TotalesDia {
  totalRecaudado: number;
  totalOperaciones: number;
  porCanal: { CAJA: number; EN_LINEA: number };
}

export interface ReporteDiarioResponse {
  fecha: string;
  totalRecaudado: number;
  totalOperaciones: number;
  porCanal: { CAJA: number; EN_LINEA: number };
  porServicio: Record<string, { cantidad: number; total: number }>;
  pagos: MovimientoDiario[];
}

export interface ReporteDiarioPdfResponse {
  url: string;
  key: string;
  expiraEn: string;
}

// ── Reporte mensual ────────────────────────────────────────────────────────
export interface ReporteMensualResponse {
  mes: number;
  anio: number;
  totalRecaudado: number;
  totalOperaciones: number;
  porCanal: { CAJA: number; EN_LINEA: number };
  porServicio: Record<string, { cantidad: number; total: number }>;
}

// ── Reporte por servicio ───────────────────────────────────────────────────
export interface ReporteServicioResponse {
  servicio: { nombre: string; costoBase: number };
  estadisticas: {
    totalOrdenes: number;
    ordenesPagadas: number;
    ordenesPendientes: number;
    ordenesExpiradas: number;
    recaudadoEnLinea: number;
    recaudadoCaja: number;
    totalRecaudado: number;
  };
}
