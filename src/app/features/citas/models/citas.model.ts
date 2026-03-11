// ────────────────────────────────────────────────────────────────────────────
// Estado de cita
// ────────────────────────────────────────────────────────────────────────────
export type EstadoCita =
  | 'pendiente'
  | 'confirmada'
  | 'atendida'
  | 'no_se_presento'
  | 'cancelada';

export const ESTADO_CITA_LABELS: Record<EstadoCita, string> = {
  pendiente: 'Pendiente',
  confirmada: 'Confirmada',
  atendida: 'Atendida',
  no_se_presento: 'No se presentó',
  cancelada: 'Cancelada',
};

// ────────────────────────────────────────────────────────────────────────────
// Cita completa (detalle y lista)
// ────────────────────────────────────────────────────────────────────────────
export interface CitaCiudadano {
  nombre: string;
  curp: string;
  telefono: string;
  correo?: string;
}

export interface CitaArea {
  _id: string;
  nombre: string;
  slugArea?: string;
}

export interface Cita {
  _id: string;
  folio: string;
  municipio: string;
  area: CitaArea;
  tramite: string;
  ciudadano: CitaCiudadano;
  fecha: string; // ISO date "YYYY-MM-DD"
  hora: string; // "HH:MM"
  estado: EstadoCita;
  notas?: string;
  origen: 'portal_publico' | 'recepcion';
  tokenConsulta?: string;
  atendidoPor?: string;
  creadoPor?: string;
  createdAt: string;
  updatedAt: string;
}

// ────────────────────────────────────────────────────────────────────────────
// Agenda de hoy
// ────────────────────────────────────────────────────────────────────────────
export interface CitaHoy {
  _id: string;
  folio: string;
  hora: string;
  tramite: string;
  area: { _id: string; nombre: string };
  ciudadano: { nombre: string; curp: string; telefono: string };
  estado: EstadoCita;
  notas?: string;
}

export interface ResumenHoy {
  fecha: string;
  total: number;
  atendidas: number;
  pendientes: number;
  noSePresentaron: number;
  canceladas: number;
  citas: CitaHoy[];
}

// ────────────────────────────────────────────────────────────────────────────
// Métricas
// ────────────────────────────────────────────────────────────────────────────
export interface MetricasCitas {
  totalAgendadas: number;
  totalAtendidas: number;
  totalNoSePresentaron: number;
  totalCanceladas: number;
  tasaAsistencia: number;
  porArea: {
    area: string;
    agendadas: number;
    atendidas: number;
    noSePresentaron: number;
    canceladas: number;
  }[];
  porDia: { fecha: string; total: number; atendidas: number }[];
  tramitesMasSolicitados: { tramite: string; total: number }[];
  origenCitas: { portalPublico: number; recepcion: number };
}

// ────────────────────────────────────────────────────────────────────────────
// Paginación y filtros
// ────────────────────────────────────────────────────────────────────────────
export interface PaginatedCitas {
  data: Cita[];
  total: number;
  page: number;
  totalPages: number;
}

export interface FiltrosCitas {
  area?: string;
  estado?: EstadoCita;
  fechaInicio?: string;
  fechaFin?: string;
  curp?: string;
  tramite?: string;
  origen?: 'ciudadano' | 'recepcion';
  page?: number;
  limit?: number;
}

// ────────────────────────────────────────────────────────────────────────────
// DTOs
// ────────────────────────────────────────────────────────────────────────────
export interface CrearCitaInternaDto {
  areaId: string;
  tramite: string;
  fecha: string;
  hora: string;
  ciudadano: CitaCiudadano;
  notas?: string;
}

export interface CambiarEstadoDto {
  estado: EstadoCita;
  notas?: string;
}

export interface ReagendarDto {
  fecha: string;
  hora: string;
}

// ────────────────────────────────────────────────────────────────────────────
// Configuración de horarios
// ────────────────────────────────────────────────────────────────────────────
export interface BloqueHorario {
  inicio: string; // "HH:MM"
  fin: string; // "HH:MM"
  capacidadPorSlot: number;
}

export type DiaSemana =
  | 'lunes'
  | 'martes'
  | 'miercoles'
  | 'jueves'
  | 'viernes'
  | 'sabado'
  | 'domingo';

export const DIAS_SEMANA: { key: DiaSemana; label: string }[] = [
  { key: 'lunes', label: 'Lunes' },
  { key: 'martes', label: 'Martes' },
  { key: 'miercoles', label: 'Miércoles' },
  { key: 'jueves', label: 'Jueves' },
  { key: 'viernes', label: 'Viernes' },
  { key: 'sabado', label: 'Sábado' },
  { key: 'domingo', label: 'Domingo' },
];

export interface HorarioDia {
  dia: DiaSemana;
  activo: boolean;
  bloques: BloqueHorario[];
}

/** Array form — lo que espera y devuelve el backend */
export type HorariosConfig = HorarioDia[];

export interface ConfiguracionCitasArea {
  _id: string;
  area: { _id: string; nombre: string };
  modulo?: string;
  municipio: string;
  horarios: HorariosConfig;
  activo: boolean;
  diasAnticipacionMinima: number;
  diasAnticipacionMaxima: number;
  duracionSlotMinutos: number;
  tramites: string[];
  instrucciones?: string;
  createdAt: string;
  updatedAt: string;
}

export interface BloqueoFecha {
  _id: string;
  fechaInicio: string;
  fechaFin: string;
  motivo: string;
  area?: string;
  municipio: string;
}

export interface UpsertConfigDto {
  horarios: HorariosConfig;
  activo: boolean;
  diasAnticipacionMinima: number;
  diasAnticipacionMaxima: number;
  duracionSlotMinutos: number;
  tramites: string[];
  instrucciones?: string;
}

export interface CrearConfiguracionDto {
  area: string;
  modulo?: string;
  duracionSlotMinutos: number;
  diasAnticipacionMinima: number;
  diasAnticipacionMaxima: number;
  tramites: string[];
  instrucciones?: string;
  horarios: HorariosConfig;
}

export interface AreaDisponible {
  modulo: string;
  area: string;
}

export interface CrearBloqueoDto {
  fechaInicio: string;
  fechaFin: string;
  motivo: string;
  areaId?: string;
}
