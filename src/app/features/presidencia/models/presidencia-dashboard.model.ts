export interface TesoreriaResumen {
  recaudacionTotal: number;
  pagosRealizados: number;
  pagosPendientes: number;
  serviciosActivos: number;
  periodo: string;
}

export interface ComparativoMensualItem {
  mes: string;
  monto: number;
}

export interface IngresosPorDiaItem {
  fecha: string;
  monto: number;
}

export interface IngresosPorAreaItem {
  area: string;
  monto: number;
}

export interface ServicioTop {
  servicio: string;
  total: number;
}

export interface ApoyoPorPrograma {
  programaId: string;
  programa: string;
  total: number;
}

export interface ComparativoMensualDifItem {
  mes: string;
  apoyos: number;
}

export interface AlertaItem {
  tipo: string;
  mensaje: string;
}

export interface DifResumen {
  beneficiariosUnicos: number;
  apoyosEntregados: number;
  apoyosPendientes: number;
  programasActivos: number;
  localidadesAtendidas: number;
}

export interface BeneficiarioPorLocalidad {
  localidad: string;
  total: number;
}

export interface PresidenciaDashboardData {
  tesoreriaResumen: TesoreriaResumen;
  comparativoMensual: ComparativoMensualItem[];
  difResumen: DifResumen;
  beneficiariosPorLocalidad: BeneficiarioPorLocalidad[];
}
