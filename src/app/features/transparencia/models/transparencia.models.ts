export type DocumentoTipo = 'pdf' | 'excel' | 'link' | 'texto';
export type Periodicidad = 'Trimestral' | 'Anual' | 'Permanente' | 'Mensual';
export type EstadoFiltro =
  | 'todas'
  | 'al_corriente'
  | 'en_riesgo'
  | 'sin_documentos';
export type TipoFiltro = 'todas' | 'comun' | 'municipal';
export type Semaforo = 'verde' | 'amarillo' | 'rojo';

export interface TransparenciaDocumento {
  nombre: string;
  tipo: DocumentoTipo;
  descripcion?: string;
  periodoReferencia?: string;
  ejercicio?: string;
  // PDF
  archivoUrl?: string;
  archivoKey?: string;
  // Link
  url?: string;
  // Texto
  texto?: string;
  // Meta
  subidoPor?: string;
  nombreSubidoPor?: string;
  fechaSubida?: string;
}

export interface TransparenciaSubseccion {
  clave: string;
  titulo: string;
  descripcion?: string;
  documentos: TransparenciaDocumento[];
}

export interface TransparenciaSeccion {
  _id?: string;
  municipioId: string;
  clave: string;
  titulo: string;
  articulo: string;
  areaResponsable: string;
  periodoActualizacion: Periodicidad;
  esEspecificaMunicipio: boolean;
  documentos: TransparenciaDocumento[];
  subsecciones?: TransparenciaSubseccion[];
  alCorriente: boolean;
  notaInterna?: string;
  ultimaActualizacion?: string | null;
  ultimaModificacionPor?: { _id: string; nombre: string } | null;
}

/** Total de documentos sumando documentos directos + subsecciones */
export function totalDocumentos(sec: TransparenciaSeccion): number {
  const propios = sec.documentos.length;
  const sub =
    sec.subsecciones?.reduce((acc, s) => acc + s.documentos.length, 0) ?? 0;
  return propios + sub;
}

export interface SeccionEnRiesgo {
  clave: string;
  titulo: string;
  articulo: string;
  periodoActualizacion: Periodicidad;
  ultimaActualizacion?: string | null;
  tieneSubsecciones?: boolean;
  totalDocumentos?: number;
}

export interface ResumenCumplimiento {
  totalObligaciones: number;
  conDocumentos: number;
  alCorriente: number;
  sinDocumentos: number;
  porcentajeCumplimiento: number;
  enRiesgo: SeccionEnRiesgo[];
}

export interface TransparenciaResponse {
  secciones: TransparenciaSeccion[];
  resumen: ResumenCumplimiento;
}

export interface AgregarDocumentoDto {
  nombre: string;
  tipo: DocumentoTipo;
  descripcion?: string;
  periodoReferencia?: string;
  ejercicio?: string;
  subseccionClave?: string | null;
  // PDF: File object, manejado como FormData
  archivo?: File;
  // Link
  url?: string;
  // Texto
  texto?: string;
}
