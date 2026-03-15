// ── Respuesta del endpoint GET /public/:slug/portal ──────────────────────

export interface PortalGeneral {
  subtitulo: string;
  mensajeBienvenida: string;
  mostrarCitas: boolean;
  mostrarReportes: boolean;
  mostrarTransparencia: boolean;
  enMantenimiento: boolean;
  mensajeMantenimiento?: string;
  periodoGobierno?: string;
  presidenteMunicipal?: string;
}

export interface PortalApariencia {
  colorPrimario: string;
  colorSecundario: string;
  bannerUrl?: string;
  bannerAlt?: string;
}

export interface PortalRedesSociales {
  facebook?: string;
  twitter?: string;
  instagram?: string;
  youtube?: string;
  sitioWeb?: string;
}

export interface PortalFooterLink {
  texto: string;
  url: string;
  externo: boolean;
}

export interface PortalFooterColumna {
  titulo: string;
  links: PortalFooterLink[];
}

export interface PortalNumeroEmergencia {
  numero: string;
  servicio: string;
}

export interface PortalFooter {
  direccion?: string;
  correo?: string;
  telefono?: string;
  columnas: PortalFooterColumna[];
  numerosEmergencia: PortalNumeroEmergencia[];
  textoLegal?: string;
}

export type AvisoTipo = 'informativo' | 'alerta' | 'urgente';

export interface PortalAviso {
  _id: string;
  titulo: string;
  cuerpo: string;
  tipo: AvisoTipo;
  url?: string;
  urlTexto?: string;
  imagenUrl?: string;
  vigenciaInicio: string;
  vigenciaFin: string;
  orden: number;
  activo?: boolean;
}

export interface PortalPublicoData {
  nombre: string;
  logoUrl?: string;
  latitud?: number;
  longitud?: number;
  general: PortalGeneral;
  apariencia: PortalApariencia;
  redesSociales: PortalRedesSociales;
  footer: PortalFooter;
  avisos?: PortalAviso[];
}

// ── Transparencia pública ────────────────────────────────────────────────────

export type DocTipoPublico = 'pdf' | 'excel' | 'link' | 'texto';

export interface TransparenciaDocumentoPublico {
  nombre: string;
  descripcion?: string;
  tipo: DocTipoPublico;
  archivoUrl?: string;
  url?: string;
  texto?: string;
  periodoReferencia?: string;
  ejercicio?: string;
  fechaPublicacion?: string;
}

export interface TransparenciaSubseccionPublica {
  clave: string;
  titulo: string;
  descripcion?: string;
  documentos: TransparenciaDocumentoPublico[];
}

/** Ítem del listado GET /public/:slug/transparencia (sin documentos completos) */
export interface TransparenciaResumenPublico {
  clave: string;
  titulo: string;
  descripcion?: string;
  articulo: string;
  areaResponsable: string;
  periodoActualizacion: string;
  esEspecificaMunicipio: boolean;
  tieneSubsecciones: boolean;
  totalDocumentos: number;
  notaPeriodo?: string;
  ultimaActualizacion?: string | null;
}

/** Detalle GET /public/:slug/transparencia/:clave */
export interface TransparenciaDetallePublico {
  clave: string;
  titulo: string;
  descripcion?: string;
  articulo: string;
  areaResponsable: string;
  periodoActualizacion: string;
  esEspecificaMunicipio: boolean;
  tieneSubsecciones: boolean;
  notaPeriodo?: string;
  ultimaActualizacion?: string | null;
  documentos: TransparenciaDocumentoPublico[];
  subsecciones: TransparenciaSubseccionPublica[];
}

/** Respuesta del listado GET /public/:slug/transparencia */
export interface TransparenciaPublicaResponse {
  obligacionesComunes: TransparenciaResumenPublico[];
  obligacionesMunicipales: TransparenciaResumenPublico[];
}
