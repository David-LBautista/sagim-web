import {
  Component,
  inject,
  OnInit,
  OnDestroy,
  signal,
  computed,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Subject, forkJoin } from 'rxjs';
import { takeUntil, finalize } from 'rxjs';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { NgApexchartsModule } from 'ng-apexcharts';
import type {
  ApexAxisChartSeries,
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

import { AuditoriaService } from '../../services/auditoria.service';
import type {
  AuditoriaDashboardResumen,
  ActividadPorModulo,
  AccionCritica,
  AccesoReciente,
  AuditAccion,
} from '../../models/auditoria.model';
import { ActionButtonComponent } from '../../../../shared/components/action-button/action-button.component';

dayjs.locale('es');

@Component({
  selector: 'app-auditoria-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    MatSelectModule,
    MatFormFieldModule,
    MatProgressBarModule,
    MatTooltipModule,
    NgApexchartsModule,
    ActionButtonComponent,
  ],
  templateUrl: './auditoria-dashboard.page.html',
  styleUrls: ['./auditoria-dashboard.page.scss'],
})
export class AuditoriaDashboardPage implements OnInit, OnDestroy {
  private auditoriaService = inject(AuditoriaService);
  private router = inject(Router);
  private destroy$ = new Subject<void>();

  // ── Estado ──────────────────────────────────────────────────────────────
  cargando = signal(true);
  diasSeleccionados = signal(30);
  resumen = signal<AuditoriaDashboardResumen | null>(null);
  actividadModulo = signal<ActividadPorModulo[]>([]);
  accionesCriticas = signal<AccionCritica[]>([]);
  accesos = signal<AccesoReciente[]>([]);

  readonly opciones = [
    { valor: 7, label: 'Últimos 7 días' },
    { valor: 15, label: 'Últimos 15 días' },
    { valor: 30, label: 'Últimos 30 días' },
  ];

  // ── Chart: Actividad por módulo ──────────────────────────────────────────
  readonly barSeries = computed<ApexAxisChartSeries>(() => [
    { name: 'Acciones', data: this.actividadModulo().map((m) => m.acciones) },
  ]);

  readonly barCategories = computed<string[]>(() =>
    this.actividadModulo().map((m) => m.modulo),
  );

  readonly barChartConfig: ApexChart = {
    type: 'bar',
    height: 260,
    toolbar: { show: false },
    fontFamily: 'Poppins, sans-serif',
    foreColor: '#7A7A7A',
  };

  readonly barPlotOptions: ApexPlotOptions = {
    bar: {
      horizontal: true,
      borderRadius: 4,
      barHeight: '55%',
      distributed: true,
    },
  };

  readonly barDataLabels: ApexDataLabels = {
    enabled: true,
    formatter: (val: number) => val + '',
    style: { fontSize: '11px', colors: ['#fff'] },
  };

  readonly barTooltip: ApexTooltip = {
    y: { formatter: (val: number) => val + ' acciones' },
  };

  readonly barGrid: ApexGrid = {
    borderColor: 'rgba(0,0,0,0.06)',
    strokeDashArray: 4,
    yaxis: { lines: { show: false } },
  };

  readonly barColors = [
    '#1F6FAE',
    '#0F2A44',
    '#6FAE3B',
    '#F0A12A',
    '#D64545',
    '#7A7A7A',
    '#1F6FAE',
    '#0F2A44',
    '#6FAE3B',
  ];

  readonly barXAxis = computed(() => ({
    categories: this.barCategories(),
    labels: { style: { fontSize: '11px' } },
    axisBorder: { show: false },
    axisTicks: { show: false },
  }));

  readonly barYAxis: ApexYAxis = {
    labels: { style: { fontSize: '12px' }, maxWidth: 140 },
  };

  // ── Lifecycle ────────────────────────────────────────────────────────────
  ngOnInit(): void {
    this.cargar();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  cargar(): void {
    this.cargando.set(true);
    const dias = this.diasSeleccionados();

    forkJoin({
      resumen: this.auditoriaService.getDashboardResumen(dias),
      actividad: this.auditoriaService.getActividadPorModulo(dias),
      criticas: this.auditoriaService.getAccionesCriticas(dias),
      accesos: this.auditoriaService.getAccesos(dias),
    })
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => this.cargando.set(false)),
      )
      .subscribe({
        next: ({ resumen, actividad, criticas, accesos }) => {
          this.resumen.set(resumen);
          this.actividadModulo.set(
            [...actividad].sort((a, b) => b.acciones - a.acciones),
          );
          this.accionesCriticas.set(criticas);
          this.accesos.set(accesos);
        },
        error: () => {},
      });
  }

  onDiasChange(dias: number): void {
    this.diasSeleccionados.set(dias);
    this.cargar();
  }

  irALogs(): void {
    this.router.navigate(['/auditoria/logs']);
  }

  // ── Helpers UI ───────────────────────────────────────────────────────────
  accionLabel(accion: AuditAccion | string): string {
    const map: Record<string, string> = {
      CREATE: 'Crear',
      UPDATE: 'Editar',
      DELETE: 'Eliminar',
      VIEW: 'Ver',
      LOGIN: 'Ingreso',
      LOGOUT: 'Salida',
      EXPORT: 'Exportar',
      DOWNLOAD: 'Descargar',
    };
    return map[accion] ?? accion;
  }

  accionClass(accion: AuditAccion | string): string {
    const map: Record<string, string> = {
      DELETE: 'badge-danger',
      UPDATE: 'badge-warning',
      CREATE: 'badge-success',
      LOGIN: 'badge-info',
      LOGOUT: 'badge-info',
      EXPORT: 'badge-neutral',
      DOWNLOAD: 'badge-neutral',
      VIEW: 'badge-neutral',
    };
    return map[accion] ?? 'badge-neutral';
  }

  formatFecha(iso: string): string {
    return dayjs(iso).format('DD/MM HH:mm');
  }

  formatHora(iso: string): string {
    return dayjs(iso).format('HH:mm');
  }

  rolLabel(rol: string): string {
    const map: Record<string, string> = {
      SUPER_ADMIN: 'Super Admin',
      ADMIN_MUNICIPIO: 'Admin',
      OPERATIVO: 'Operativo',
    };
    return map[rol] ?? rol;
  }
}
