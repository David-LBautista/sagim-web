export interface BeneficiarioRef {
  _id: string;
  nombre: string;
  apellidoPaterno: string;
  apellidoMaterno: string;
  curp: string;
  folio?: string;
}

export interface ProgramaRef {
  _id: string;
  nombre: string;
}

export interface TipoApoyoRef {
  _id: string;
  nombre: string;
  clave?: string;
}

export interface MunicipioRef {
  _id: string;
  nombre: string;
}

export interface UsuarioRef {
  _id: string;
  nombre: string;
  email?: string;
}

export interface ApoyoItemDto {
  inventarioId: string;
  cantidad: number;
}

export interface Apoyo {
  _id: string;
  folio: string;
  beneficiarioId: BeneficiarioRef | string;
  municipioId: MunicipioRef | string;
  programaId: ProgramaRef | string;
  tipo: string;
  cantidad?: number;
  fecha: string;
  monto?: number;
  estatus: 'PENDIENTE' | 'ENTREGADO' | 'CANCELADO' | 'ACTIVO';
  observaciones?: string;
  documentos?: string[];
  creadoPor?: UsuarioRef | string;
  fechaRegistro: string;
  createdAt: string;
  updatedAt: string;
}

export interface ApoyoCreateDto {
  beneficiarioId: string;
  programaId: string;
  tipo: string;
  fecha: string;
  monto?: number;
  cantidad: number;
  observaciones?: string;
}

export interface ApoyosListResponse {
  data: Apoyo[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ApoyosDashboard {
  resumen: {
    totalApoyos: number;
    apoyosMes: number;
    apoyosMesAnterior: number;
    crecimientoMensual: number;
    beneficiariosAtenidosMes: number;
  };
  porPrograma: Array<{
    _id: string;
    total: number;
    monto: number;
    nombre: string;
  }>;
  porTipo: Array<{ _id: string; total: number; monto: number }>;
  recientes: Apoyo[];
}

export interface Programa {
  _id: string;
  municipioId?: string | null;
  clave?: string;
  nombre: string;
  descripcion?: string;
  nivel?: string;
  categoria?: string;
  tiposApoyo: string[];
  activo?: boolean;
  presupuestoAnual?: number;
  fechaInicio?: string | null;
  fechaFin?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface TipoApoyo {
  _id: string;
  nombre: string;
  clave?: string;
  activo?: boolean;
}
