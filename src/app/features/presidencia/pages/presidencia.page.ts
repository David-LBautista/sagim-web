import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { NgApexchartsModule } from 'ng-apexcharts';
import type {
  ApexAxisChartSeries,
  ApexChart,
  ApexXAxis,
  ApexYAxis,
  ApexStroke,
  ApexFill,
  ApexDataLabels,
  ApexGrid,
  ApexTooltip,
  ApexMarkers,
  ApexPlotOptions,
} from 'ng-apexcharts';
import { PresidenciaDashboardService } from '../services/presidencia-dashboard.service';
import type {
  AlertaItem,
  ApoyoPorPrograma,
  ComparativoMensualDifItem,
  IngresosPorAreaItem,
  IngresosPorDiaItem,
  PresidenciaDashboardData,
  ServicioTop,
} from '../models/presidencia-dashboard.model';
import {
  WebSocketService,
  PresidencialDashboardUpdateEvent,
} from '../../../core/services/websocket.service';

@Component({
  selector: 'app-presidencia',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatIconModule,
    MatProgressBarModule,
    NgApexchartsModule,
  ],
  templateUrl: './presidencia.page.html',
  styleUrls: ['./presidencia.page.scss'],
})
export class PresidenciaPage implements OnInit, OnDestroy {
  private dashboardService = inject(PresidenciaDashboardService);
  private wsService = inject(WebSocketService);
  private destroy$ = new Subject<void>();

  loading = true;
  loadingIngresos = true;
  data: PresidenciaDashboardData | null = null;

  // ─── ApexCharts: Ingresos por día ────────────────────────────────────────
  chartSeries: ApexAxisChartSeries = [{ name: 'Ingresos', data: [] }];

  chartConfig: ApexChart = {
    type: 'area',
    height: 280,
    toolbar: { show: false },
    zoom: { enabled: false },
    fontFamily: 'Poppins, sans-serif',
    foreColor: '#7A7A7A',
  };

  chartStroke: ApexStroke = {
    curve: 'smooth',
    width: 2.5,
    colors: ['#1F6FAE'],
  };

  chartFill: ApexFill = {
    type: 'gradient',
    gradient: {
      shadeIntensity: 1,
      opacityFrom: 0.35,
      opacityTo: 0.02,
      colorStops: [
        { offset: 0, color: '#1F6FAE', opacity: 0.35 },
        { offset: 100, color: '#1F6FAE', opacity: 0.02 },
      ],
    },
  };

  chartXaxis: ApexXAxis = {
    type: 'category',
    categories: [],
    labels: { rotate: -30, style: { fontSize: '11px' } },
    axisBorder: { show: false },
    axisTicks: { show: false },
  };

  chartYaxis: ApexYAxis = {
    labels: {
      formatter: (val: number) =>
        '$' + val.toLocaleString('es-MX', { minimumFractionDigits: 0 }),
      style: { fontSize: '11px' },
    },
  };

  chartGrid: ApexGrid = {
    borderColor: 'rgba(0,0,0,0.06)',
    strokeDashArray: 4,
    xaxis: { lines: { show: false } },
  };

  chartTooltip: ApexTooltip = {
    y: {
      formatter: (val: number) =>
        '$' + val.toLocaleString('es-MX', { minimumFractionDigits: 2 }),
    },
  };

  chartMarkers: ApexMarkers = {
    size: 4,
    colors: ['#1F6FAE'],
    strokeColors: '#fff',
    strokeWidth: 2,
    hover: { size: 6 },
  };

  chartDataLabels: ApexDataLabels = { enabled: false };
  chartColors: string[] = ['#1F6FAE'];

  // ─── Bar chart: Ingresos por área ────────────────────────────────────────
  loadingArea = true;
  ingresosPorArea: IngresosPorAreaItem[] = [];

  barSeries: ApexAxisChartSeries = [{ name: 'Ingresos', data: [] }];

  barConfig: ApexChart = {
    type: 'bar',
    height: 260,
    toolbar: { show: false },
    fontFamily: 'Poppins, sans-serif',
    foreColor: '#7A7A7A',
  };

  barPlotOptions: ApexPlotOptions = {
    bar: { borderRadius: 6, columnWidth: '55%', distributed: true },
  };

  barXaxis: ApexXAxis = {
    categories: [],
    labels: { style: { fontSize: '11px' }, trim: true },
    axisBorder: { show: false },
    axisTicks: { show: false },
  };

  barYaxis: ApexYAxis = {
    labels: {
      formatter: (val: number) =>
        '$' + val.toLocaleString('es-MX', { minimumFractionDigits: 0 }),
      style: { fontSize: '11px' },
    },
  };

  barGrid: ApexGrid = {
    borderColor: 'rgba(0,0,0,0.06)',
    strokeDashArray: 4,
    xaxis: { lines: { show: false } },
  };

  barTooltip: ApexTooltip = {
    y: {
      formatter: (val: number) =>
        '$' + val.toLocaleString('es-MX', { minimumFractionDigits: 2 }),
    },
  };

  barDataLabels: ApexDataLabels = { enabled: false };
  barColors: string[] = [
    '#1F6FAE',
    '#0F2A44',
    '#6FAE3B',
    '#F0A12A',
    '#D64545',
    '#7A7A7A',
  ];

  // ─── Ranking: Servicios más cobrados ─────────────────────────────────────
  loadingServicios = true;
  serviciosTop: ServicioTop[] = [];

  // ─── Horizontal bar: Apoyos por programa (DIF) ───────────────────────────
  loadingApoyos = true;

  hBarSeries: ApexAxisChartSeries = [{ name: 'Apoyos', data: [] }];

  hBarConfig: ApexChart = {
    type: 'bar',
    height: 260,
    toolbar: { show: false },
    fontFamily: 'Poppins, sans-serif',
    foreColor: '#7A7A7A',
  };

  hBarPlotOptions: ApexPlotOptions = {
    bar: {
      horizontal: true,
      borderRadius: 4,
      barHeight: '55%',
      distributed: true,
    },
  };

  hBarXaxis: ApexXAxis = {
    categories: [],
    labels: { style: { fontSize: '11px' } },
    axisBorder: { show: false },
    axisTicks: { show: false },
  };

  hBarYaxis: ApexYAxis = {
    labels: { style: { fontSize: '12px' } },
  };

  hBarGrid: ApexGrid = {
    borderColor: 'rgba(0,0,0,0.06)',
    strokeDashArray: 4,
    yaxis: { lines: { show: false } },
  };

  hBarTooltip: ApexTooltip = {
    y: { formatter: (val: number) => val + ' apoyos' },
  };

  hBarDataLabels: ApexDataLabels = {
    enabled: true,
    formatter: (val: number) => val + '',
    style: { fontSize: '11px', colors: ['#fff'] },
  };

  hBarColors: string[] = [
    '#1F6FAE',
    '#0F2A44',
    '#6FAE3B',
    '#F0A12A',
    '#D64545',
  ];

  // ─── Line chart: Comparativo mensual DIF ─────────────────────────────────
  loadingComparativoDif = true;

  difLineSeries: ApexAxisChartSeries = [{ name: 'Apoyos', data: [] }];

  difLineConfig: ApexChart = {
    type: 'line',
    height: 260,
    toolbar: { show: false },
    zoom: { enabled: false },
    fontFamily: 'Poppins, sans-serif',
    foreColor: '#7A7A7A',
  };

  difLineStroke: ApexStroke = {
    curve: 'smooth',
    width: 3,
    colors: ['#6FAE3B'],
  };

  difLineXaxis: ApexXAxis = {
    categories: [],
    labels: { style: { fontSize: '11px' } },
    axisBorder: { show: false },
    axisTicks: { show: false },
  };

  difLineYaxis: ApexYAxis = {
    labels: {
      formatter: (val: number) => Math.round(val) + '',
      style: { fontSize: '11px' },
    },
    min: 0,
  };

  difLineGrid: ApexGrid = {
    borderColor: 'rgba(0,0,0,0.06)',
    strokeDashArray: 4,
    xaxis: { lines: { show: false } },
  };

  difLineTooltip: ApexTooltip = {
    y: { formatter: (val: number) => val + ' apoyos' },
  };

  difLineMarkers: ApexMarkers = {
    size: 5,
    colors: ['#6FAE3B'],
    strokeColors: '#fff',
    strokeWidth: 2,
    hover: { size: 7 },
  };

  difLineDataLabels: ApexDataLabels = { enabled: false };
  difLineColors: string[] = ['#6FAE3B'];

  // ─── Alertas estratégicas ─────────────────────────────────────────────────
  loadingAlertasTesoreria = true;
  loadingAlertasDif = true;
  alertasTesoreria: AlertaItem[] = [];
  alertasDif: AlertaItem[] = [];

  ngOnInit(): void {
    this.suscribirWebSocket();

    this.dashboardService
      .getDashboard()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (d) => {
          this.data = d;
          this.loading = false;
        },
        error: () => {
          this.loading = false;
        },
      });

    this.dashboardService
      .getIngresosMesActual()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (items) => {
          this.buildIngresosChart(items);
          this.loadingIngresos = false;
        },
        error: () => {
          this.loadingIngresos = false;
        },
      });

    this.dashboardService
      .getIngresosPorArea()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (items) => {
          this.ingresosPorArea = items;
          this.buildAreaChart(items);
          this.loadingArea = false;
        },
        error: () => {
          this.loadingArea = false;
        },
      });

    this.dashboardService
      .getServiciosTop(10)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (items) => {
          this.serviciosTop = items;
          this.loadingServicios = false;
        },
        error: () => {
          this.loadingServicios = false;
        },
      });

    this.dashboardService
      .getApoyosPorPrograma()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (items) => {
          this.buildApoyosChart(items);
          this.loadingApoyos = false;
        },
        error: () => {
          this.loadingApoyos = false;
        },
      });

    this.dashboardService
      .getComparativoMensualDif(6)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (items) => {
          this.buildComparativoDifChart(items);
          this.loadingComparativoDif = false;
        },
        error: () => {
          this.loadingComparativoDif = false;
        },
      });

    this.dashboardService
      .getAlertasTesoreria()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (items) => {
          this.alertasTesoreria = items;
          this.loadingAlertasTesoreria = false;
        },
        error: () => {
          this.loadingAlertasTesoreria = false;
        },
      });

    this.dashboardService
      .getAlertasDif()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (items) => {
          this.alertasDif = items;
          this.loadingAlertasDif = false;
        },
        error: () => {
          this.loadingAlertasDif = false;
        },
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private suscribirWebSocket(): void {
    this.wsService.presidencialDashboardUpdate$
      .pipe(takeUntil(this.destroy$))
      .subscribe((ev: PresidencialDashboardUpdateEvent) => {
        // ── Tesorería ────────────────────────────────────────────────────
        if (this.data) {
          this.data = {
            ...this.data,
            tesoreriaResumen: {
              ...this.data.tesoreriaResumen,
              recaudacionTotal: ev.tesoreria.resumen.recaudacionTotal,
              pagosRealizados: ev.tesoreria.resumen.pagosRealizados,
            },
            comparativoMensual: ev.tesoreria.comparativoMensual,
            difResumen: {
              ...this.data.difResumen,
              beneficiariosUnicos: ev.dif.resumen.beneficiariosUnicos,
              apoyosEntregados: ev.dif.resumen.apoyosEntregados,
            },
            beneficiariosPorLocalidad: ev.dif.beneficiariosPorLocalidad,
          };
        }

        if (ev.tesoreria.ingresos?.length) {
          this.buildIngresosChart(ev.tesoreria.ingresos);
        }
        if (ev.tesoreria.ingresosPorArea?.length) {
          this.ingresosPorArea = ev.tesoreria.ingresosPorArea;
          this.buildAreaChart(ev.tesoreria.ingresosPorArea);
        }
        if (ev.tesoreria.serviciosTop?.length) {
          this.serviciosTop = ev.tesoreria.serviciosTop;
        }
        if (ev.tesoreria.alertas) {
          this.alertasTesoreria = ev.tesoreria.alertas;
        }

        // ── DIF ──────────────────────────────────────────────────────────
        if (ev.dif.apoyosPorPrograma?.length) {
          this.buildApoyosChart(ev.dif.apoyosPorPrograma);
        }
        if (ev.dif.comparativoMensual?.length) {
          this.buildComparativoDifChart(ev.dif.comparativoMensual);
        }
        if (ev.dif.alertas) {
          this.alertasDif = ev.dif.alertas;
        }
      });

    // Reconexión → recargar HTTP snapshot
    this.wsService.reconectado$.pipe(takeUntil(this.destroy$)).subscribe(() => {
      this.loading = true;
      this.dashboardService
        .getDashboard()
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (d) => {
            this.data = d;
            this.loading = false;
          },
          error: () => {
            this.loading = false;
          },
        });
    });
  }

  private buildIngresosChart(items: IngresosPorDiaItem[]): void {
    const sorted = [...items].sort((a, b) => a.fecha.localeCompare(b.fecha));
    const categories = sorted.map((i) => {
      const [, m, d] = i.fecha.split('-');
      return `${d}/${m}`;
    });
    this.chartSeries = [{ name: 'Ingresos', data: sorted.map((i) => i.monto) }];
    this.chartXaxis = { ...this.chartXaxis, categories };
  }

  private buildAreaChart(items: IngresosPorAreaItem[]): void {
    const sorted = [...items].sort((a, b) => b.monto - a.monto);
    this.barSeries = [{ name: 'Ingresos', data: sorted.map((i) => i.monto) }];
    this.barXaxis = {
      ...this.barXaxis,
      categories: sorted.map((i) => this.cleanLabel(i.area)),
    };
  }

  private cleanLabel(value: string): string {
    if (value === 'SIN_AREA') return 'Sin área';
    if (value === 'SERVICIO_DESCONOCIDO') return 'Desconocido';
    if (value === 'SIN_PROGRAMA') return 'Sin programa';
    return value;
  }

  private buildApoyosChart(items: ApoyoPorPrograma[]): void {
    const sorted = [...items].sort((a, b) => b.total - a.total);
    this.hBarSeries = [{ name: 'Apoyos', data: sorted.map((i) => i.total) }];
    this.hBarXaxis = {
      ...this.hBarXaxis,
      categories: sorted.map((i) => this.cleanLabel(i.programa)),
    };
  }

  private buildComparativoDifChart(items: ComparativoMensualDifItem[]): void {
    const MESES = [
      'Ene',
      'Feb',
      'Mar',
      'Abr',
      'May',
      'Jun',
      'Jul',
      'Ago',
      'Sep',
      'Oct',
      'Nov',
      'Dic',
    ];
    const sorted = [...items].sort((a, b) => a.mes.localeCompare(b.mes));
    const categories = sorted.map((i) => {
      const [, m] = i.mes.split('-');
      return MESES[parseInt(m, 10) - 1];
    });
    this.difLineSeries = [
      { name: 'Apoyos', data: sorted.map((i) => i.apoyos) },
    ];
    this.difLineXaxis = { ...this.difLineXaxis, categories };
  }

  get beneficiariosConPct(): Array<{
    localidad: string;
    total: number;
    pct: number;
  }> {
    const list = this.data?.beneficiariosPorLocalidad ?? [];
    if (!list.length) return [];
    const grand = list.reduce((sum, l) => sum + l.total, 0);
    return [...list]
      .sort((a, b) => b.total - a.total)
      .map((l) => ({
        localidad: l.localidad,
        total: l.total,
        pct: grand > 0 ? Math.round((l.total / grand) * 100) : 0,
      }));
  }

  get serviciosTopConPct(): Array<{
    servicio: string;
    total: number;
    pct: number;
  }> {
    if (!this.serviciosTop.length) return [];
    const top5 = [...this.serviciosTop]
      .sort((a, b) => b.total - a.total)
      .slice(0, 5);
    const grand = top5.reduce((sum, s) => sum + s.total, 0);
    return top5.map((s) => ({
      servicio: this.cleanLabel(s.servicio),
      total: s.total,
      pct: grand > 0 ? Math.round((s.total / grand) * 100) : 0,
    }));
  }

  // ─── KPI 1: Recaudación total ──────────────────────────────────────────────
  get recaudacionTotal(): string {
    if (!this.data) return '—';
    return (
      '$' +
      this.data.tesoreriaResumen.recaudacionTotal.toLocaleString('es-MX', {
        minimumFractionDigits: 2,
      })
    );
  }
  get periodoLabel(): string {
    if (!this.data?.comparativoMensual?.length) return '';
    const sorted = [...this.data.comparativoMensual].sort((a, b) =>
      a.mes.localeCompare(b.mes),
    );
    const ultimo = sorted[sorted.length - 1].mes;
    const [anio, mes] = ultimo.split('-');
    const MESES = [
      'Enero',
      'Febrero',
      'Marzo',
      'Abril',
      'Mayo',
      'Junio',
      'Julio',
      'Agosto',
      'Septiembre',
      'Octubre',
      'Noviembre',
      'Diciembre',
    ];
    return `${MESES[parseInt(mes, 10) - 1]} ${anio}`;
  }

  get periodoAnteriorLabel(): string {
    if (!this.data?.comparativoMensual?.length) return 'mes anterior';
    const sorted = [...this.data.comparativoMensual].sort((a, b) =>
      a.mes.localeCompare(b.mes),
    );
    if (sorted.length < 2) return 'mes anterior';
    const penultimo = sorted[sorted.length - 2].mes;
    const [, mes] = penultimo.split('-');
    const MESES = [
      'Ene',
      'Feb',
      'Mar',
      'Abr',
      'May',
      'Jun',
      'Jul',
      'Ago',
      'Sep',
      'Oct',
      'Nov',
      'Dic',
    ];
    return MESES[parseInt(mes, 10) - 1];
  }
  // ─── KPI 2: Variación mensual ──────────────────────────────────────────────
  get variacionMensual(): number | null {
    if (!this.data?.comparativoMensual?.length) return null;
    const sorted = [...this.data.comparativoMensual].sort((a, b) =>
      a.mes.localeCompare(b.mes),
    );
    if (sorted.length < 2) return null;
    const actual = sorted[sorted.length - 1].monto;
    const anterior = sorted[sorted.length - 2].monto;
    if (anterior === 0) return null;
    return Math.round(((actual - anterior) / anterior) * 100 * 10) / 10;
  }

  get variacionMensualLabel(): string {
    const v = this.variacionMensual;
    if (v === null) return '—';
    return `${v > 0 ? '+' : ''}${v}%`;
  }

  get variacionTrend(): 'up' | 'down' | 'neutral' {
    const v = this.variacionMensual;
    if (v === null || v === 0) return 'neutral';
    return v > 0 ? 'up' : 'down';
  }

  get recaudacionTrend(): {
    label: string;
    direction: 'up' | 'down' | 'neutral';
  } {
    const v = this.variacionMensual;
    if (v === null) return { label: '', direction: 'neutral' };
    return {
      label: `${v > 0 ? '+' : ''}${v}% vs ${this.periodoAnteriorLabel}`,
      direction: v > 0 ? 'up' : v < 0 ? 'down' : 'neutral',
    };
  }

  // ─── KPI 3: Apoyos entregados ──────────────────────────────────────────────
  get apoyosEntregados(): number {
    return this.data?.difResumen.apoyosEntregados ?? 0;
  }

  get programasActivos(): number {
    return this.data?.difResumen.programasActivos ?? 0;
  }

  // ─── KPI 4: Beneficiarios únicos ──────────────────────────────────────────
  get beneficiariosUnicos(): number {
    return this.data?.difResumen.beneficiariosUnicos ?? 0;
  }

  get localidadesAtendidas(): number {
    return this.data?.beneficiariosPorLocalidad?.length ?? 0;
  }

  alertaConfig(tipo: string): {
    icon: string;
    severity: 'danger' | 'warning' | 'info';
  } {
    const map: Record<
      string,
      { icon: string; severity: 'danger' | 'warning' | 'info' }
    > = {
      // Tesorería
      BAJA_RECAUDACION: { icon: 'trending_down', severity: 'danger' },
      ORDENES_POR_EXPIRAR: { icon: 'schedule', severity: 'warning' },
      // DIF
      DUPLICIDAD: { icon: 'people', severity: 'danger' },
      REZAGO: { icon: 'location_off', severity: 'warning' },
    };
    return map[tipo] ?? { icon: 'info', severity: 'info' };
  }
}
