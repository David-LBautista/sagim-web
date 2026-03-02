import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { forkJoin, Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../../../environments/environment';
import { ApiEndpoints } from '../../../core/enums/api-endpoints.enum';
import type {
  AlertaItem,
  ApoyoPorPrograma,
  BeneficiarioPorLocalidad,
  ComparativoMensualDifItem,
  ComparativoMensualItem,
  DifResumen,
  IngresosPorAreaItem,
  IngresosPorDiaItem,
  PresidenciaDashboardData,
  ServicioTop,
  TesoreriaResumen,
} from '../models/presidencia-dashboard.model';

// ─── Mock Data ───────────────────────────────────────────────────────────────

const MOCK_TESORERIA_RESUMEN: TesoreriaResumen = {
  recaudacionTotal: 4_872_350.75,
  pagosRealizados: 312,
  pagosPendientes: 47,
  serviciosActivos: 18,
  periodo: '2026-02',
};

const MOCK_COMPARATIVO_MENSUAL: ComparativoMensualItem[] = [
  { mes: '2025-09', monto: 3_210_450 },
  { mes: '2025-10', monto: 3_875_200 },
  { mes: '2025-11', monto: 3_540_900 },
  { mes: '2025-12', monto: 4_120_780 },
  { mes: '2026-01', monto: 4_455_630 },
  { mes: '2026-02', monto: 4_872_350 },
];

const MOCK_DIF_RESUMEN: DifResumen = {
  beneficiariosUnicos: 1_847,
  apoyosEntregados: 3_204,
  apoyosPendientes: 156,
  programasActivos: 12,
  localidadesAtendidas: 24,
};

const MOCK_BENEFICIARIOS_POR_LOCALIDAD: BeneficiarioPorLocalidad[] = [
  { localidad: 'Cabecera Municipal', total: 542 },
  { localidad: 'San Miguel', total: 308 },
  { localidad: 'El Saucillo', total: 241 },
  { localidad: 'La Noria', total: 198 },
  { localidad: 'El Llano', total: 175 },
  { localidad: 'Buena Vista', total: 147 },
  { localidad: 'Otras', total: 236 },
];

const MOCK_INGRESOS_POR_DIA: IngresosPorDiaItem[] = [
  { fecha: '2026-02-02', monto: 210_500 },
  { fecha: '2026-02-03', monto: 185_200 },
  { fecha: '2026-02-04', monto: 320_000 },
  { fecha: '2026-02-05', monto: 198_750 },
  { fecha: '2026-02-06', monto: 415_300 },
  { fecha: '2026-02-09', monto: 270_800 },
  { fecha: '2026-02-10', monto: 380_000 },
  { fecha: '2026-02-11', monto: 305_900 },
  { fecha: '2026-02-12', monto: 490_200 },
  { fecha: '2026-02-13', monto: 265_400 },
  { fecha: '2026-02-14', monto: 310_600 },
  { fecha: '2026-02-17', monto: 422_000 },
  { fecha: '2026-02-18', monto: 355_750 },
  { fecha: '2026-02-19', monto: 287_400 },
  { fecha: '2026-02-20', monto: 460_800 },
  { fecha: '2026-02-21', monto: 312_450 },
  { fecha: '2026-02-24', monto: 276_300 },
  { fecha: '2026-02-25', monto: 398_000 },
  { fecha: '2026-02-26', monto: 215_000 },
  { fecha: '2026-02-27', monto: 190_000 },
];

const MOCK_INGRESOS_POR_AREA: IngresosPorAreaItem[] = [
  { area: 'Agua y Saneamiento', monto: 1_245_800 },
  { area: 'Predial', monto: 980_450 },
  { area: 'Licencias y Permisos', monto: 742_300 },
  { area: 'Infraestructura', monto: 615_200 },
  { area: 'Servicios Públicos', monto: 528_900 },
  { area: 'Otros', monto: 320_700 },
];

const MOCK_SERVICIOS_TOP: ServicioTop[] = [
  { servicio: 'Pago de Agua', total: 892 },
  { servicio: 'Predial Urbano', total: 734 },
  { servicio: 'Licencia Comercial', total: 412 },
  { servicio: 'Predial Rústico', total: 318 },
  { servicio: 'Constancia de Residencia', total: 276 },
  { servicio: 'Certificado de No Adeudo', total: 215 },
  { servicio: 'Permiso de Construcción', total: 198 },
  { servicio: 'Licencia de Alcohol', total: 143 },
  { servicio: 'Refrendo de Licencia', total: 112 },
  { servicio: 'Otros Servicios', total: 88 },
];

const MOCK_APOYOS_POR_PROGRAMA: ApoyoPorPrograma[] = [
  { programaId: '1', programa: 'Canasta Alimentaria', total: 856 },
  { programaId: '2', programa: 'Apoyo Adulto Mayor', total: 624 },
  { programaId: '3', programa: 'Útiles Escolares', total: 512 },
  { programaId: '4', programa: 'Becas DIF', total: 438 },
  { programaId: '5', programa: 'Apoyo Discapacidad', total: 312 },
  { programaId: '6', programa: 'Despensa Navideña', total: 271 },
  { programaId: '7', programa: 'Silla de Ruedas', total: 191 },
];

const MOCK_COMPARATIVO_MENSUAL_DIF: ComparativoMensualDifItem[] = [
  { mes: '2025-09', apoyos: 420 },
  { mes: '2025-10', apoyos: 518 },
  { mes: '2025-11', apoyos: 485 },
  { mes: '2025-12', apoyos: 612 },
  { mes: '2026-01', apoyos: 574 },
  { mes: '2026-02', apoyos: 595 },
];

const MOCK_ALERTAS_TESORERIA: AlertaItem[] = [
  {
    tipo: 'ORDENES_POR_EXPIRAR',
    mensaje: '47 órdenes de pago vencen en los próximos 3 días.',
  },
  {
    tipo: 'BAJA_RECAUDACION',
    mensaje:
      'El área de Licencias registra una recaudación 18% menor a la meta mensual.',
  },
];

const MOCK_ALERTAS_DIF: AlertaItem[] = [
  {
    tipo: 'DUPLICIDAD',
    mensaje:
      '3 posibles beneficiarios registrados con CURP duplicado pendientes de revisión.',
  },
  {
    tipo: 'REZAGO',
    mensaje: '12 comunidades sin visita de seguimiento en los últimos 30 días.',
  },
];

@Injectable({ providedIn: 'root' })
export class PresidenciaDashboardService {
  private http = inject(HttpClient);

  getDashboard(): Observable<PresidenciaDashboardData> {
    const base = environment.apiUrl;

    const tesoreriaResumen$ = this.http.get<TesoreriaResumen>(
      `${base}${ApiEndpoints.DASHBOARD_TESORERIA_RESUMEN}`,
    );

    const comparativoParams = new HttpParams().set('meses', '6');
    const comparativoMensual$ = this.http.get<ComparativoMensualItem[]>(
      `${base}${ApiEndpoints.DASHBOARD_TESORERIA_COMPARATIVO_MENSUAL}`,
      { params: comparativoParams },
    );

    const difResumen$ = this.http.get<DifResumen>(
      `${base}${ApiEndpoints.DASHBOARD_DIF_RESUMEN}`,
    );

    const beneficiariosPorLocalidad$ = this.http.get<
      BeneficiarioPorLocalidad[]
    >(`${base}${ApiEndpoints.DASHBOARD_DIF_BENEFICIARIOS_POR_LOCALIDAD}`);

    return forkJoin({
      tesoreriaResumen: tesoreriaResumen$,
      comparativoMensual: comparativoMensual$,
      difResumen: difResumen$,
      beneficiariosPorLocalidad: beneficiariosPorLocalidad$,
    }).pipe(
      catchError(() =>
        of({
          tesoreriaResumen: MOCK_TESORERIA_RESUMEN,
          comparativoMensual: MOCK_COMPARATIVO_MENSUAL,
          difResumen: MOCK_DIF_RESUMEN,
          beneficiariosPorLocalidad: MOCK_BENEFICIARIOS_POR_LOCALIDAD,
        }),
      ),
    );
  }

  getIngresosPorDia(
    desde?: string,
    hasta?: string,
  ): Observable<IngresosPorDiaItem[]> {
    const base = environment.apiUrl;
    let params = new HttpParams();
    if (desde) params = params.set('desde', desde);
    if (hasta) params = params.set('hasta', hasta);
    return this.http
      .get<
        IngresosPorDiaItem[]
      >(`${base}${ApiEndpoints.DASHBOARD_TESORERIA_INGRESOS}`, { params })
      .pipe(catchError(() => of(MOCK_INGRESOS_POR_DIA)));
  }

  private firstDayOfMonth(): string {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`;
  }

  private today(): string {
    const now = new Date();
    return now.toISOString().slice(0, 10);
  }

  getIngresosMesActual(): Observable<IngresosPorDiaItem[]> {
    return this.getIngresosPorDia(this.firstDayOfMonth(), this.today());
  }

  getIngresosPorArea(): Observable<IngresosPorAreaItem[]> {
    return this.http
      .get<
        IngresosPorAreaItem[]
      >(`${environment.apiUrl}${ApiEndpoints.DASHBOARD_TESORERIA_INGRESOS_POR_AREA}`)
      .pipe(catchError(() => of(MOCK_INGRESOS_POR_AREA)));
  }

  getServiciosTop(limit = 10): Observable<ServicioTop[]> {
    const params = new HttpParams().set('limit', limit);
    return this.http
      .get<
        ServicioTop[]
      >(`${environment.apiUrl}${ApiEndpoints.DASHBOARD_TESORERIA_SERVICIOS_TOP}`, { params })
      .pipe(catchError(() => of(MOCK_SERVICIOS_TOP)));
  }

  getApoyosPorPrograma(): Observable<ApoyoPorPrograma[]> {
    return this.http
      .get<
        ApoyoPorPrograma[]
      >(`${environment.apiUrl}${ApiEndpoints.DASHBOARD_DIF_APOYOS_POR_PROGRAMA}`)
      .pipe(catchError(() => of(MOCK_APOYOS_POR_PROGRAMA)));
  }

  getComparativoMensualDif(meses = 6): Observable<ComparativoMensualDifItem[]> {
    const params = new HttpParams().set('meses', meses);
    return this.http
      .get<
        ComparativoMensualDifItem[]
      >(`${environment.apiUrl}${ApiEndpoints.DASHBOARD_DIF_COMPARATIVO_MENSUAL}`, { params })
      .pipe(catchError(() => of(MOCK_COMPARATIVO_MENSUAL_DIF)));
  }

  getAlertasTesoreria(): Observable<AlertaItem[]> {
    return this.http
      .get<
        AlertaItem[]
      >(`${environment.apiUrl}${ApiEndpoints.DASHBOARD_TESORERIA_ALERTAS}`)
      .pipe(catchError(() => of(MOCK_ALERTAS_TESORERIA)));
  }

  getAlertasDif(): Observable<AlertaItem[]> {
    return this.http
      .get<
        AlertaItem[]
      >(`${environment.apiUrl}${ApiEndpoints.DASHBOARD_DIF_ALERTAS}`)
      .pipe(catchError(() => of(MOCK_ALERTAS_DIF)));
  }
}
