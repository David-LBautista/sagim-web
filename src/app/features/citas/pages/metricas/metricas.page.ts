import {
  Component,
  inject,
  signal,
  computed,
  DestroyRef,
  OnInit,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { NgApexchartsModule } from 'ng-apexcharts';
import type {
  ApexAxisChartSeries,
  ApexNonAxisChartSeries,
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
  ApexLegend,
} from 'ng-apexcharts';
import { CitasService } from '../../services/citas.service';
import { NotificationService } from '../../../../shared/services/notification.service';
import { MetricasCitas } from '../../models/citas.model';

@Component({
  selector: 'app-metricas-citas',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatSelectModule,
    MatProgressBarModule,
    MatTooltipModule,
    NgApexchartsModule,
  ],
  templateUrl: './metricas.page.html',
  styleUrl: './metricas.page.scss',
})
export class MetricasPage implements OnInit {
  private citasService = inject(CitasService);
  private notif = inject(NotificationService);
  private destroyRef = inject(DestroyRef);

  cargando = signal(false);
  metricas = signal<MetricasCitas | null>(null);

  readonly meses = [
    { value: 1, label: 'Enero' },
    { value: 2, label: 'Febrero' },
    { value: 3, label: 'Marzo' },
    { value: 4, label: 'Abril' },
    { value: 5, label: 'Mayo' },
    { value: 6, label: 'Junio' },
    { value: 7, label: 'Julio' },
    { value: 8, label: 'Agosto' },
    { value: 9, label: 'Septiembre' },
    { value: 10, label: 'Octubre' },
    { value: 11, label: 'Noviembre' },
    { value: 12, label: 'Diciembre' },
  ];

  readonly anios: number[] = (() => {
    const a = new Date().getFullYear();
    return [a - 2, a - 1, a, a + 1].filter((x) => x >= 2024);
  })();

  mesSeleccionado = signal(new Date().getMonth() + 1);
  anioSeleccionado = signal(new Date().getFullYear());

  tasaAsistencia = computed(() => {
    const m = this.metricas();
    if (!m || m.totalAgendadas === 0) return 0;
    return Math.round((m.totalAtendidas / m.totalAgendadas) * 100);
  });

  tasaNoPresencia = computed(() => {
    const m = this.metricas();
    if (!m || m.totalAgendadas === 0) return 0;
    return Math.round((m.totalNoSePresentaron / m.totalAgendadas) * 100);
  });

  mesLabel = computed(() => {
    const mes = this.meses.find((m) => m.value === this.mesSeleccionado());
    return mes?.label ?? '';
  });

  // ── Origen donut chart ──────────────────────────────────────────────────
  origenDonutSeries: ApexNonAxisChartSeries = [0, 0];
  origenDonutLabels: string[] = ['Portal Ciudadano', 'Recepción'];
  origenDonutConfig: ApexChart = {
    type: 'donut',
    height: 260,
    toolbar: { show: false },
    fontFamily: 'Poppins, sans-serif',
    foreColor: '#7A7A7A',
  };
  origenDonutColors: string[] = ['#1F6FAE', '#0F2A44'];
  origenDonutDataLabels: ApexDataLabels = {
    enabled: true,
    style: { fontSize: '12px', fontFamily: 'Poppins, sans-serif' },
  };
  origenDonutLegend: ApexLegend = {
    position: 'bottom',
    fontSize: '12px',
    fontFamily: 'Poppins, sans-serif',
  };
  origenDonutTooltip: ApexTooltip = {
    y: { formatter: (val: number) => val + ' citas' },
  };

  // ── Área chart (horizontal bar) ────────────────────────────────────────
  areaBarSeries: ApexAxisChartSeries = [{ name: 'Citas', data: [] }];
  areaBarConfig: ApexChart = {
    type: 'bar',
    height: 220,
    toolbar: { show: false },
    fontFamily: 'Poppins, sans-serif',
    foreColor: '#7A7A7A',
  };
  areaBarPlotOptions: ApexPlotOptions = {
    bar: {
      horizontal: true,
      borderRadius: 4,
      barHeight: '55%',
      distributed: true,
    },
  };
  areaBarXaxis: ApexXAxis = {
    categories: [],
    labels: { style: { fontSize: '11px' } },
    axisBorder: { show: false },
    axisTicks: { show: false },
  };
  areaBarYaxis: ApexYAxis = { labels: { style: { fontSize: '12px' } } };
  areaBarGrid: ApexGrid = {
    borderColor: 'rgba(0,0,0,0.06)',
    strokeDashArray: 4,
    yaxis: { lines: { show: false } },
  };
  areaBarDataLabels: ApexDataLabels = {
    enabled: true,
    formatter: (val: number) => val + '',
    style: { fontSize: '11px', colors: ['#fff'] },
  };
  areaBarTooltip: ApexTooltip = {
    y: { formatter: (val: number) => val + ' citas' },
  };
  areaBarColors: string[] = [
    '#1F6FAE',
    '#0F2A44',
    '#6FAE3B',
    '#F0A12A',
    '#D64545',
    '#7A7A7A',
  ];

  // ── Trámites chart (vertical bar) ────────────────────────────────────────
  tramitesBarSeries: ApexAxisChartSeries = [{ name: 'Total', data: [] }];
  tramitesBarConfig: ApexChart = {
    type: 'bar',
    height: 220,
    toolbar: { show: false },
    fontFamily: 'Poppins, sans-serif',
    foreColor: '#7A7A7A',
  };
  tramitesBarPlotOptions: ApexPlotOptions = {
    bar: { borderRadius: 6, columnWidth: '55%', distributed: true },
  };
  tramitesBarXaxis: ApexXAxis = {
    categories: [],
    labels: { style: { fontSize: '11px' }, trim: true, rotate: -30 },
    axisBorder: { show: false },
    axisTicks: { show: false },
  };
  tramitesBarYaxis: ApexYAxis = {
    labels: {
      formatter: (val: number) => Math.round(val) + '',
      style: { fontSize: '11px' },
    },
  };
  tramitesBarGrid: ApexGrid = {
    borderColor: 'rgba(0,0,0,0.06)',
    strokeDashArray: 4,
    xaxis: { lines: { show: false } },
  };
  tramitesBarDataLabels: ApexDataLabels = { enabled: false };
  tramitesBarTooltip: ApexTooltip = {
    y: { formatter: (val: number) => val + ' citas' },
  };
  tramitesBarColors: string[] = [
    '#1F6FAE',
    '#0F2A44',
    '#6FAE3B',
    '#F0A12A',
    '#D64545',
    '#7A7A7A',
  ];

  // ── Por día chart (area) ─────────────────────────────────────────────────
  porDiaSeries: ApexAxisChartSeries = [{ name: 'Citas', data: [] }];
  porDiaConfig: ApexChart = {
    type: 'area',
    height: 260,
    toolbar: { show: false },
    zoom: { enabled: false },
    fontFamily: 'Poppins, sans-serif',
    foreColor: '#7A7A7A',
  };
  porDiaStroke: ApexStroke = {
    curve: 'smooth',
    width: 2.5,
    colors: ['#1F6FAE'],
  };
  porDiaFill: ApexFill = {
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
  porDiaXaxis: ApexXAxis = {
    type: 'category',
    categories: [],
    labels: { rotate: -30, style: { fontSize: '11px' } },
    axisBorder: { show: false },
    axisTicks: { show: false },
  };
  porDiaYaxis: ApexYAxis = {
    labels: {
      formatter: (val: number) => Math.round(val) + '',
      style: { fontSize: '11px' },
    },
    min: 0,
  };
  porDiaGrid: ApexGrid = {
    borderColor: 'rgba(0,0,0,0.06)',
    strokeDashArray: 4,
    xaxis: { lines: { show: false } },
  };
  porDiaMarkers: ApexMarkers = {
    size: 4,
    colors: ['#1F6FAE'],
    strokeColors: '#fff',
    strokeWidth: 2,
    hover: { size: 6 },
  };
  porDiaDataLabels: ApexDataLabels = { enabled: false };
  porDiaColors: string[] = ['#1F6FAE'];
  porDiaTooltip: ApexTooltip = {
    y: { formatter: (val: number) => val + ' citas' },
  };

  ngOnInit(): void {
    this.cargar();
  }

  cargar(): void {
    this.cargando.set(true);
    this.citasService
      .getMetricas(this.mesSeleccionado(), this.anioSeleccionado())
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (m) => {
          this.metricas.set(m);
          this.buildCharts(m);
          this.cargando.set(false);
        },
        error: () => {
          this.notif.error('Error al cargar métricas');
          this.cargando.set(false);
        },
      });
  }

  onMesChange(mes: number): void {
    this.mesSeleccionado.set(mes);
    this.cargar();
  }

  onAnioChange(anio: number): void {
    this.anioSeleccionado.set(anio);
    this.cargar();
  }

  private buildCharts(m: MetricasCitas): void {
    // Área: horizontal bar
    this.areaBarXaxis = {
      ...this.areaBarXaxis,
      categories: m.porArea.map((a) => a.area),
    };
    this.areaBarSeries = [
      { name: 'Citas', data: m.porArea.map((a) => a.agendadas) },
    ];

    // Trámites: vertical bar
    this.tramitesBarXaxis = {
      ...this.tramitesBarXaxis,
      categories: m.tramitesMasSolicitados.map((t) => t.tramite),
    };
    this.tramitesBarSeries = [
      { name: 'Total', data: m.tramitesMasSolicitados.map((t) => t.total) },
    ];

    // Por día: area chart
    this.porDiaXaxis = {
      ...this.porDiaXaxis,
      categories: m.porDia.map((d) => d.fecha),
    };
    this.porDiaSeries = [{ name: 'Citas', data: m.porDia.map((d) => d.total) }];

    // Origen: donut
    this.origenDonutSeries = [
      m.origenCitas.portalPublico,
      m.origenCitas.recepcion,
    ];
  }
}
