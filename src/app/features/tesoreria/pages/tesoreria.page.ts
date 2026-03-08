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
import { Subject, takeUntil, finalize } from 'rxjs';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDividerModule } from '@angular/material/divider';
import dayjs from 'dayjs';
import 'dayjs/locale/es';

import { CajaService } from '../services/caja.service';
import { NotificationService } from '../../../shared/services/notification.service';
import { NotificationType } from '../../../shared/models/notification.model';
import { ReporteMensualResponse } from '../models/caja.model';
import { KpiCardComponent } from '../../../shared/components/kpi-card/kpi-card.component';

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
    KpiCardComponent,
  ],
  templateUrl: './tesoreria.page.html',
  styleUrls: ['./tesoreria.page.scss'],
})
export class TesoreriaPage implements OnInit, OnDestroy {
  private cajaService = inject(CajaService);
  private notification = inject(NotificationService);
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
      .slice(0, 6);
  });

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
  }

  ngOnDestroy(): void {
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
