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
  municipioId: string;
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

export {};
