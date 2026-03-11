import {
  Component,
  inject,
  OnInit,
  OnDestroy,
  signal,
  computed,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Subject, takeUntil, finalize } from 'rxjs';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDividerModule } from '@angular/material/divider';
import { NgApexchartsModule } from 'ng-apexcharts';
import type {
  ApexAxisChartSeries,
  ApexNonAxisChartSeries,
  ApexChart,
  ApexXAxis,
  ApexYAxis,
  ApexPlotOptions,
  ApexDataLabels,
  ApexTooltip,
  ApexGrid,
} from 'ng-apexcharts';
import dayjs from 'dayjs';
import 'dayjs/locale/es';

import { CajaService } from '../services/caja.service';
import { NotificationService } from '../../../shared/services/notification.service';
import { NotificationType } from '../../../shared/models/notification.model';
import {
  ReporteMensualResponse,
  AlertaTesoreria,
  MovimientoDiario,
} from '../models/caja.model';
import { KpiCardComponent } from '../../../shared/components/kpi-card/kpi-card.component';
import {
  WebSocketService,
  NuevoPagoCajaEvent,
  TesoreriaDashboardUpdateEvent,
} from '../../../core/services/websocket.service';
import { ActionButtonComponent } from '../../../shared/components/action-button/action-button.component';

dayjs.locale('es');

@Component({
  selector: 'app-tesoreria',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    MatFormFieldModule,
    MatSelectModule,
    MatProgressSpinnerModule,
    MatTooltipModule,
    MatDividerModule,
    NgApexchartsModule,
    KpiCardComponent,
    ActionButtonComponent,
  ],
  templateUrl: './tesoreria.page.html',
  styleUrls: ['./tesoreria.page.scss'],
})
export class TesoreriaPage implements OnInit, OnDestroy {
  private cajaService = inject(CajaService);
  private notification = inject(NotificationService);
  private router = inject(Router);
  private wsService = inject(WebSocketService);
  private destroy$ = new Subject<void>();

  // ── Selector mes/año ──────────────────────────────────────────────────────
  mesSeleccionado = signal(dayjs().month() + 1); // 1-12
  anioSeleccionado = signal(dayjs().year());

  readonly meses = [
    { valor: 1, label: 'Enero' },
    { valor: 2, label: 'Febrero' },
    { valor: 3, label: 'Marzo' },
    { valor: 4, label: 'Abril' },
    { valor: 5, label: 'Mayo' },
    { valor: 6, label: 'Junio' },
    { valor: 7, label: 'Julio' },
    { valor: 8, label: 'Agosto' },
    { valor: 9, label: 'Septiembre' },
    { valor: 10, label: 'Octubre' },
    { valor: 11, label: 'Noviembre' },
    { valor: 12, label: 'Diciembre' },
  ];

  readonly anios = Array.from({ length: 5 }, (_, i) => dayjs().year() - i);

  // ── Estado reporte ────────────────────────────────────────────────────────
  reporte = signal<ReporteMensualResponse | null>(null);
  cargando = signal(false);
  generandoPdf = signal(false);
  // ── Alertas ───────────────────────────────────────────────────────────
  alertas = signal<AlertaTesoreria[]>([]);
  loadingAlertas = signal(false);

  // ── Actividad reciente (tiempo real) ───────────────────────────────────
  actividadRealtime = signal<MovimientoDiario[]>([]);
  loadingDiario = signal(false);

  readonly ultimosMovimientos = computed<MovimientoDiario[]>(() =>
    this.actividadRealtime().slice(0, 5),
  );

  readonly fechaDiariaLabel = computed(() =>
    dayjs().format('D [de] MMMM [de] YYYY'),
  );
  readonly mesLabel = computed(
    () =>
      this.meses.find((m) => m.valor === this.mesSeleccionado())?.label ?? '',
  );

  readonly topServicios = computed(() => {
    const r = this.reporte();
    if (!r?.porServicio) return [];
    return Object.entries(r.porServicio)
      .map(([nombre, data]) => ({ nombre, ...data }))
      .sort((a, b) => b.total - a.total)
      .slice(0, 8);
  });

  readonly ingresosChartSeries = computed<ApexAxisChartSeries>(() => {
    const servicios = this.topServicios();
    return [{ name: 'Total', data: servicios.map((s) => s.total) }];
  });

  readonly ingresosChartCategories = computed<string[]>(() =>
    this.topServicios().map((s) => s.nombre),
  );

  readonly ingresosChartConfig: ApexChart = {
    type: 'bar',
    height: 340,
    toolbar: { show: false },
    fontFamily: 'Poppins, sans-serif',
    foreColor: '#7A7A7A',
  };

  readonly ingresosChartPlotOptions: ApexPlotOptions = {
    bar: {
      horizontal: true,
      borderRadius: 4,
      barHeight: '55%',
      distributed: true,
    },
  };

  readonly ingresosChartDataLabels: ApexDataLabels = { enabled: false };

  readonly ingresosChartTooltip: ApexTooltip = {
    y: {
      formatter: (val: number) =>
        '$' + val.toLocaleString('es-MX', { minimumFractionDigits: 2 }),
    },
  };

  readonly ingresosChartGrid: ApexGrid = {
    borderColor: 'rgba(0,0,0,0.06)',
    strokeDashArray: 4,
    yaxis: { lines: { show: false } },
  };

  readonly ingresosChartColors: string[] = [
    '#1F6FAE',
    '#0F2A44',
    '#6FAE3B',
    '#F0A12A',
    '#D64545',
    '#7A7A7A',
    '#1F6FAE',
    '#0F2A44',
  ];

  readonly ingresosChartXAxis = computed(() => ({
    categories: this.ingresosChartCategories(),
    labels: {
      formatter: (v: string) =>
        '$' + (+v).toLocaleString('es-MX', { minimumFractionDigits: 0 }),
      style: { fontSize: '11px' },
    },
    axisBorder: { show: false },
    axisTicks: { show: false },
  }));

  readonly ingresosChartYAxis: ApexYAxis = {
    labels: { style: { fontSize: '12px' }, maxWidth: 220 },
  };

  // ── Donut: desglose por canal ───────────────────────────────────────────
  readonly canalChartSeries = computed<ApexNonAxisChartSeries>(() => {
    const r = this.reporte();
    if (!r) return [0, 0];
    return [r.porCanal.CAJA, r.porCanal.EN_LINEA];
  });

  readonly canalChartConfig: ApexChart = {
    type: 'donut',
    height: 280,
    toolbar: { show: false },
    fontFamily: 'Poppins, sans-serif',
    foreColor: '#7A7A7A',
  };

  readonly canalChartLabels = ['Caja', 'En línea'];
  readonly canalChartColors = ['#1F6FAE', '#6FAE3B'];

  readonly canalChartDataLabels: ApexDataLabels = {
    enabled: true,
    formatter: (val: number) => val.toFixed(1) + '%',
    style: {
      fontSize: '12px',
      fontFamily: 'Poppins, sans-serif',
      colors: ['#fff'],
    },
  };

  readonly canalChartTooltip: ApexTooltip = {
    y: {
      formatter: (val: number) =>
        '$' + val.toLocaleString('es-MX', { minimumFractionDigits: 2 }),
    },
  };

  readonly canalChartLegend = {
    position: 'bottom' as const,
    fontFamily: 'Poppins, sans-serif',
    fontSize: '13px',
  };

  private formatMXN(val: number): string {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN',
      maximumFractionDigits: 2,
    }).format(val);
  }

  readonly kpiTotalRecaudado = computed(() => {
    const r = this.reporte();
    return r ? this.formatMXN(r.totalRecaudado) : '—';
  });

  readonly kpiOperaciones = computed(
    () => this.reporte()?.totalOperaciones ?? 0,
  );

  readonly kpiCaja = computed(() => {
    const r = this.reporte();
    return r ? this.formatMXN(r.porCanal.CAJA) : '—';
  });

  readonly kpiEnLinea = computed(() => {
    const r = this.reporte();
    return r ? this.formatMXN(r.porCanal.EN_LINEA) : '—';
  });

  ngOnInit(): void {
    this.cargarReporte();
    this.cargarAlertas();
    this.cargarDiario();
    this.wsService.joinArea('tesoreria');
    this.suscribirWebSocket();
  }

  ngOnDestroy(): void {
    this.wsService.leaveArea('tesoreria');
    this.destroy$.next();
    this.destroy$.complete();
  }

  cargarReporte(): void {
    this.cargando.set(true);
    this.reporte.set(null);
    this.cajaService
      .getReporteMensual(this.mesSeleccionado(), this.anioSeleccionado())
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => this.cargando.set(false)),
      )
      .subscribe({
        next: (data) => this.reporte.set(data),
        error: () =>
          this.notification.show({
            message: 'No se pudo cargar el reporte mensual.',
            type: NotificationType.ERROR,
          }),
      });
  }

  cargarAlertas(): void {
    this.loadingAlertas.set(true);
    this.cajaService
      .getAlertas()
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => this.loadingAlertas.set(false)),
      )
      .subscribe({
        next: (data) => this.alertas.set(data),
        error: () => this.alertas.set([]),
      });
  }

  cargarDiario(): void {
    this.loadingDiario.set(true);
    this.cajaService
      .getReporteDiario()
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => this.loadingDiario.set(false)),
      )
      .subscribe({
        next: (data) => {
          const inicial = (data.pagos ?? []).slice(0, 5);
          this.actividadRealtime.set(inicial);
        },
        error: () => {},
      });
  }

  suscribirWebSocket(): void {
    // Nuevo pago → prepend a la lista, máximo 5
    this.wsService.nuevoPagoCaja$
      .pipe(takeUntil(this.destroy$))
      .subscribe((pago: NuevoPagoCajaEvent) => {
        const nuevo: MovimientoDiario = {
          _id: pago.folio,
          folio: pago.folio,
          hora: dayjs(pago.timestamp).isValid()
            ? dayjs(pago.timestamp).format('hh:mm a')
            : dayjs().format('hh:mm a'),
          servicio: pago.servicio ?? '—',
          ciudadano: pago.ciudadano,
          monto: pago.monto,
          metodoPago: (pago.metodoPago ??
            'EFECTIVO') as MovimientoDiario['metodoPago'],
          canal: (pago.canal ?? 'CAJA') as MovimientoDiario['canal'],
        };
        this.actividadRealtime.update((prev) => [nuevo, ...prev].slice(0, 5));
      });

    // Snapshot completo → actualiza KPIs y gráficas reactivamente
    this.wsService.tesoreriaDashboardUpdate$
      .pipe(takeUntil(this.destroy$))
      .subscribe((ev: TesoreriaDashboardUpdateEvent) => {
        // Solo actualizar si estamos viendo el mes/año actual
        const ahora = dayjs();
        if (
          this.mesSeleccionado() !== ahora.month() + 1 ||
          this.anioSeleccionado() !== ahora.year()
        )
          return;

        const porServicio: ReporteMensualResponse['porServicio'] =
          ev.serviciosTop.reduce(
            (acc, s) => {
              acc[s.nombre] = { cantidad: s.cantidad, total: s.total };
              return acc;
            },
            {} as ReporteMensualResponse['porServicio'],
          );

        this.reporte.update((prev) =>
          prev
            ? {
                ...prev,
                totalRecaudado: ev.resumen.totalRecaudado,
                totalOperaciones: ev.resumen.totalOperaciones,
                porCanal: ev.resumen.porCanal,
                porServicio,
              }
            : {
                mes: ahora.month() + 1,
                anio: ahora.year(),
                ...ev.resumen,
                porServicio,
              },
        );
      });

    // Reconexion → recargar todo
    this.wsService.reconectado$.pipe(takeUntil(this.destroy$)).subscribe(() => {
      this.cargarReporte();
      this.cargarAlertas();
      this.cargarDiario();
    });
  }

  alertaIcon(tipo: string): string {
    if (tipo === 'ORDENES_POR_EXPIRAR') return 'schedule';
    if (tipo === 'BAJA_RECAUDACION') return 'trending_down';
    return 'warning';
  }

  alertaClass(severidad: string): string {
    if (severidad === 'danger') return 'alerta-danger';
    if (severidad === 'warning') return 'alerta-warning';
    return 'alerta-info';
  }

  irAOrdenes(): void {
    this.router.navigate(['/tesoreria/ordenes-pago']);
  }

  onExportarPdf(): void {
    if (this.generandoPdf()) return;
    this.generandoPdf.set(true);
    this.cajaService
      .getReporteMensualPdf(this.mesSeleccionado(), this.anioSeleccionado())
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => this.generandoPdf.set(false)),
      )
      .subscribe({
        next: ({ url }) => window.open(url, '_blank'),
        error: () =>
          this.notification.show({
            message: 'No se pudo generar el PDF mensual. Intenta de nuevo.',
            type: NotificationType.ERROR,
          }),
      });
  }
}
