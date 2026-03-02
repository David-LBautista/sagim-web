export type TipoReporteDif =
  | 'apoyos'
  | 'beneficiarios'
  | 'inventario'
  | 'fondos';

export interface GenerarReporteDto {
  tipo: TipoReporteDif;
  fechaInicio: string; // 'YYYY-MM-DD'
  fechaFin: string; // 'YYYY-MM-DD'
  programaId?: string;
  localidad?: string;
  grupoVulnerable?: string;
  expiresIn?: number; // segundos (default 300)
}

export interface GenerarReporteResponse {
  url: string;
  key: string;
  expiraEn: number;
}
