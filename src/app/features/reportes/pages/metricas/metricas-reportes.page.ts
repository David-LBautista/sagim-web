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
  ApexDataLabels,
  ApexGrid,
  ApexTooltip,
  ApexPlotOptions,
  ApexLegend,
  ApexFill,
} from 'ng-apexcharts';
import { ReportesService } from '../../services/reportes.service';
import { NotificationService } from '../../../../shared/services/notification.service';
import {
  MetricasReportes,
  ModuloReporte,
  MODULO_REPORTE_LABELS,
} from '../../models/reportes.model';

@Component({
  selector: 'app-metricas-reportes',
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
  templateUrl: './metricas-reportes.page.html',
  styleUrl: './metricas-reportes.page.scss',
})
export class MetricasReportesPage implements OnInit {
  private reportesService = inject(ReportesService);
  private notif = inject(NotificationService);
  private destroyRef = inject(DestroyRef);

  cargando = signal(false);
  metricas = signal<MetricasReportes | null>(null);

  readonly moduloLabels = MODULO_REPORTE_LABELS;

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
  readonly modulosFiltro: Array<{ value: ModuloReporte | ''; label: string }> =
    [
      { value: '', label: 'Todos' },
      {
        value: 'SERVICIOS_PUBLICOS',
        label: MODULO_REPORTE_LABELS['SERVICIOS_PUBLICOS'],
      },
      {
        value: 'DESARROLLO_URBANO',
        label: MODULO_REPORTE_LABELS['DESARROLLO_URBANO'],
      },
      {
        value: 'SEGURIDAD_PUBLICA',
        label: MODULO_REPORTE_LABELS['SEGURIDAD_PUBLICA'],
      },
      {
        value: 'ORGANISMO_AGUA',
        label: MODULO_REPORTE_LABELS['ORGANISMO_AGUA'],
      },
      { value: 'PRESIDENCIA', label: MODULO_REPORTE_LABELS['PRESIDENCIA'] },
    ];

  mesSeleccionado = signal(new Date().getMonth() + 1);
  anioSeleccionado = signal(new Date().getFullYear());
  moduloSeleccionado = signal<ModuloReporte | ''>('');

  tasaResolucion = computed(() => this.metricas()?.tasaResolucion ?? 0);

  mesLabel = computed(
    () =>
      this.meses.find((m) => m.value === this.mesSeleccionado())?.label ?? '',
  );

  // ── Tendencia (line chart) ────────────────────────────────
  tendenciaSeries: ApexAxisChartSeries = [
    { name: 'Total', data: [] },
    { name: 'Resueltos', data: [] },
  ];
  tendenciaConfig: ApexChart = {
    type: 'line',
    height: 280,
    toolbar: { show: false },
    fontFamily: 'Poppins, sans-serif',
    foreColor: '#7A7A7A',
  };
  tendenciaXaxis: ApexXAxis = {
    categories: [],
    labels: { style: { fontSize: '11px' } },
  };
  tendenciaYaxis: ApexYAxis = {
    min: 0,
    labels: { style: { fontSize: '11px' } },
  };
  tendenciaStroke: ApexStroke = { curve: 'smooth', width: [2, 2] };
  tendenciaColors: string[] = ['#1F6FAE', '#6FAE3B'];
  tendenciaDataLabels: ApexDataLabels = { enabled: false };
  tendenciaGrid: ApexGrid = { borderColor: '#e2e8f0', strokeDashArray: 3 };
  tendenciaTooltip: ApexTooltip = {
    y: { formatter: (v: number) => v + ' reportes' },
  };
  tendenciaLegend: ApexLegend = {
    position: 'top',
    fontFamily: 'Poppins, sans-serif',
    fontSize: '12px',
  };

  // ── Por categoría (bar chart horizontal) ─────────────────
  categoriaSeries: ApexAxisChartSeries = [
    { name: 'Total', data: [] },
    { name: 'Resueltos', data: [] },
  ];
  categoriaConfig: ApexChart = {
    type: 'bar',
    height: 320,
    toolbar: { show: false },
    fontFamily: 'Poppins, sans-serif',
    foreColor: '#7A7A7A',
  };
  categoriaXaxis: ApexXAxis = { categories: [] };
  categoriaPlotOptions: ApexPlotOptions = {
    bar: { horizontal: true, barHeight: '60%', borderRadius: 4 },
  };
  categoriaColors: string[] = ['#1F6FAE', '#6FAE3B'];
  categoriaDataLabels: ApexDataLabels = { enabled: false };
  categoriaTooltip: ApexTooltip = {
    y: { formatter: (v: number) => v + ' reportes' },
  };
  categoriaLegend: ApexLegend = {
    position: 'top',
    fontFamily: 'Poppins, sans-serif',
    fontSize: '12px',
  };

  // ── Por origen (donut) ────────────────────────────────────
  origenSeries: ApexNonAxisChartSeries = [0, 0, 0];
  origenConfig: ApexChart = {
    type: 'donut',
    height: 240,
    toolbar: { show: false },
    fontFamily: 'Poppins, sans-serif',
    foreColor: '#7A7A7A',
  };
  origenLabels: string[] = ['Portal Público', 'Interno', 'Teléfono'];
  origenColors: string[] = ['#1F6FAE', '#0F2A44', '#F0A12A'];
  origenLegend: ApexLegend = {
    position: 'bottom',
    fontFamily: 'Poppins, sans-serif',
    fontSize: '12px',
  };
  origenTooltip: ApexTooltip = {
    y: { formatter: (v: number) => v + ' reportes' },
  };

  ngOnInit(): void {
    this.cargar();
  }

  getModuloLabel(mod: string): string {
    return this.moduloLabels[mod as ModuloReporte] ?? mod;
  }

  cargar(): void {
    this.cargando.set(true);
    const modulo = this.moduloSeleccionado() as ModuloReporte | undefined;
    this.reportesService
      .getMetricas(
        this.mesSeleccionado(),
        this.anioSeleccionado(),
        modulo || undefined,
      )
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (m) => {
          this.metricas.set(m);
          this.actualizarGraficas(m);
          this.cargando.set(false);
        },
        error: () => {
          this.notif.error('Error al cargar métricas');
          this.cargando.set(false);
        },
      });
  }

  private actualizarGraficas(m: MetricasReportes): void {
    // Tendencia
    this.tendenciaXaxis = {
      ...this.tendenciaXaxis,
      categories: m.tendencia.map((t) => t.fecha),
    };
    this.tendenciaSeries = [
      { name: 'Total', data: m.tendencia.map((t) => t.total) },
      { name: 'Resueltos', data: m.tendencia.map((t) => t.resueltos) },
    ];

    // Por categoría
    this.categoriaXaxis = {
      ...this.categoriaXaxis,
      categories: m.porCategoria.map((c) => c.nombre),
    };
    this.categoriaSeries = [
      { name: 'Total', data: m.porCategoria.map((c) => c.total) },
      { name: 'Resueltos', data: m.porCategoria.map((c) => c.resueltos) },
    ];

    // Por origen
    this.origenSeries = [
      m.porOrigen.portalPublico,
      m.porOrigen.interno,
      m.porOrigen.telefono,
    ];
  }
}
