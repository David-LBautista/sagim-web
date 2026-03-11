export interface MunicipioRef {
  _id: string;
  nombre: string;
}

export interface Beneficiario {
  _id: string;
  nombre: string;
  apellidoPaterno: string;
  apellidoMaterno: string;
  curp: string;
  fechaNacimiento: string;
  sexo: string;
  telefono: string;
  email: string;
  domicilio: string;
  localidad: string;
  grupoVulnerable: string[];
  observaciones?: string;
  activo: boolean;
  municipioId: MunicipioRef | string;
  folio?: string;
  fechaRegistro: string;
  createdAt: string;
  updatedAt: string;
}

export interface BeneficiarioCreateDto {
  nombre: string;
  apellidoPaterno: string;
  apellidoMaterno: string;
  curp: string;
  fechaNacimiento: string;
  sexo: string;
  telefono: string;
  email: string;
  domicilio: string;
  localidad: string;
  grupoVulnerable: string[];
  observaciones?: string;
}

export interface BeneficiariosListResponse {
  data: Beneficiario[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// ─── Detalle por CURP ────────────────────────────────────────────────────────

export interface ProgramaRef {
  _id: string;
  nombre: string;
  descripcion?: string;
}

export interface EntregadoPorRef {
  nombre: string;
  email: string;
  rol: string;
}

export interface ApoyoHistorial {
  _id: string;
  folio: string;
  fecha: string;
  tipo: string;
  monto: number;
  cantidad: number;
  programaId: ProgramaRef;
  entregadoPor: EntregadoPorRef;
}

// ─── Estadísticas ───────────────────────────────────────────────────────────

export interface BeneficiariosEstadisticas {
  total: number;
  activos: number;
  registradosEsteMes: number;
  porGrupoVulnerable: Record<string, number>;
}

// ─── Importar ────────────────────────────────────────────────────────────────

export type AccionDuplicadosBen = 'ignorar' | 'actualizar';

export interface ImportarBenefErrorDetalle {
  fila: number;
  nombre: string;
  error: string;
}

export interface ImportarBeneficiariosParams {
  archivo: File;
  mapeo: string;
  accionDuplicados: AccionDuplicadosBen;
}

export interface ImportarBeneficiariosResponse {
  importados: number;
  actualizados: number;
  ignorados: number;
  errores: number;
  ciudadanosCreados: number;
  detalleErrores: ImportarBenefErrorDetalle[];
}

// ─── Programas ───────────────────────────────────────────────────────────────

export interface ProgramaDIF {
  _id: string;
  nombre: string;
  descripcion?: string;
}

export interface ApoyosHistorialPaginated {
  data: ApoyoHistorial[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface BeneficiarioDetalle extends Beneficiario {
  historialApoyos: ApoyosHistorialPaginated;
  programasActivos: ProgramaRef[];
  totalApoyos: number;
  ultimoApoyo?: ApoyoHistorial;
}

export {};
