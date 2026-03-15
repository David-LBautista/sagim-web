// ── Área con citas activas ─────────────────────────────────────────────────
export interface AreaCitas {
  area: string;
  modulo: string;
  instrucciones: string;
  tramites: string[];
}

// ── Disponibilidad por día ─────────────────────────────────────────────────
export interface SlotDisponibilidad {
  horario: string;
  disponible: boolean;
  capacidadTotal: number;
  citasAgendadas: number;
  lugaresRestantes: number;
}

export interface DisponibilidadDia {
  fecha: string; // YYYY-MM-DD
  disponible: boolean;
  slots: SlotDisponibilidad[];
}

// ── DTO para crear cita ────────────────────────────────────────────────────
export interface CrearCitaPublicaDto {
  area: string;
  tramite: string;
  servicioId?: string;
  fechaCita: string; // YYYY-MM-DD
  horario: string; // HH:mm
  curp: string;
  nombreCompleto: string;
  telefono: string;
  correo?: string;
  notasCiudadano?: string;
}

// ── Respuesta al crear cita ────────────────────────────────────────────────
export interface RespuestaCitaCreada {
  folio: string;
  tokenConsulta: string;
  fechaCita: string;
  horario: string;
  area: string;
  tramite: string;
  ciudadano: {
    nombreCompleto: string;
    curp: string;
  };
  instrucciones: string;
  mensaje: string;
}

// ── Respuesta al consultar cita ────────────────────────────────────────────
export type EstadoCita =
  | 'pendiente'
  | 'confirmada'
  | 'atendida'
  | 'cancelada'
  | 'no_asistio';

export interface ConsultaCita {
  folio: string;
  area: string;
  tramite: string;
  fechaCita: string;
  horario: string;
  estado: EstadoCita;
  instrucciones: string;
  puedeCancelar: boolean;
}

// ── Info pública del municipio ─────────────────────────────────────────────
export interface MunicipioPublico {
  nombre: string;
  logoUrl?: string;
  bannerUrl?: string;
  slug: string;
  claveInegi?: string;
}

// ── Ciudadano precargado desde CURP ───────────────────────────────────────
export interface CiudadanoCurp {
  nombreCompleto: string;
  telefono?: string;
  correo?: string;
}
