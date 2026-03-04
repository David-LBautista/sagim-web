import {
  Component,
  inject,
  OnInit,
  OnDestroy,
  signal,
  computed,
} from '@angular/core';
import dayjs from 'dayjs';
import { CommonModule } from '@angular/common';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import {
  Subject,
  takeUntil,
  debounceTime,
  distinctUntilChanged,
  finalize,
} from 'rxjs';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDividerModule } from '@angular/material/divider';
import { MatDialog } from '@angular/material/dialog';
import { Clipboard } from '@angular/cdk/clipboard';

import { OrdenesPagoService } from '../../services/ordenes-pago.service';
import { NotificationService } from '../../../../shared/services/notification.service';
import { NotificationType } from '../../../../shared/models/notification.model';
import {
  OrdenPago,
  OrdenPagoMetrics,
  EstadoOrden,
  areaLabel,
} from '../../models/ordenes-pago.model';
import { KpiCardComponent } from '../../../../shared/components/kpi-card/kpi-card.component';
import {
  StatusBadgeComponent,
  BadgeVariant,
} from '../../../../shared/components/status-badge/status-badge.component';
import { FolioTagComponent } from '../../../../shared/components/folio-tag/folio-tag.component';
import { ActionButtonComponent } from '../../../../shared/components/action-button/action-button.component';
import {
  DataTableComponent,
  TableColumn,
} from '../../../../shared/components/data-table/data-table.component';
import { NuevaOrdenDialogComponent } from '../../components/nueva-orden-dialog/nueva-orden-dialog.component';

@Component({
  selector: 'app-ordenes-pago',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatProgressSpinnerModule,
    MatTooltipModule,
    MatDividerModule,
    KpiCardComponent,
    StatusBadgeComponent,
    FolioTagComponent,
    ActionButtonComponent,
    DataTableComponent,
  ],
  templateUrl: './ordenes-pago.page.html',
  styleUrls: ['./ordenes-pago.page.scss'],
})
export class OrdenesPagoPage implements OnInit, OnDestroy {
  private ordenesService = inject(OrdenesPagoService);
  private notification = inject(NotificationService);
  private dialog = inject(MatDialog);
  private clipboard = inject(Clipboard);
  private destroy$ = new Subject<void>();
  // ── Estado ───────────────────────────────────────────────────────────────
  ordenes = signal<OrdenPago[]>([]);
  metrics = signal<OrdenPagoMetrics | null>(null);
  loadingOrdenes = signal(true);
  loadingMetrics = signal(true);
  cancelando = signal<string | null>(null);
  reenviando = signal<string | null>(null);

  // ── Filtros ──────────────────────────────────────────────────────────────
  busquedaCtrl = new FormControl('');
  estadoCtrl = new FormControl<EstadoOrden | ''>('');
  fechaDesdeCtrl = new FormControl<Date | null>(null);
  fechaHastaCtrl = new FormControl<Date | null>(null);

  readonly estadoOpciones: { value: EstadoOrden | ''; label: string }[] = [
    { value: '', label: 'Todos los estados' },
    { value: 'PENDIENTE', label: 'Pendiente' },
    { value: 'PAGADA', label: 'Pagada' },
    { value: 'CANCELADA', label: 'Cancelada' },
    { value: 'EXPIRADA', label: 'Expirada' },
  ];

  readonly tableColumns: TableColumn[] = [
    { key: 'folio', label: 'Folio' },
    { key: 'descripcion', label: 'Descripción' },
    { key: 'ciudadano', label: 'Ciudadano' },
    { key: 'monto', label: 'Monto', align: 'right' },
    { key: 'estado', label: 'Estado' },
    { key: 'vigencia', label: 'Vigencia' },
    { key: 'area', label: 'Área' },
    { key: 'acciones', label: 'Acciones', align: 'center' },
  ];

  // ── Computed ──────────────────────────────────────────────────────────────
  recaudadoMesStr = computed(() => {
    const m = this.metrics();
    return m != null
      ? m.recaudadoMes.toLocaleString('es-MX', {
          style: 'currency',
          currency: 'MXN',
          minimumFractionDigits: 0,
        })
      : '—';
  });

  tasaConversionStr = computed(() => {
    const m = this.metrics();
    return m != null ? `${m.tasaConversion.toFixed(1)} %` : '—';
  });

  // ── Lifecycle ─────────────────────────────────────────────────────────────
  ngOnInit(): void {
    this.cargarMetrics();
    this.cargarOrdenes();
    this.setupFiltros();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // ── Carga de datos ────────────────────────────────────────────────────────
  private cargarMetrics(): void {
    this.loadingMetrics.set(true);
    this.ordenesService
      .getMetrics()
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => this.loadingMetrics.set(false)),
      )
      .subscribe({ next: (m) => this.metrics.set(m), error: () => {} });
  }

  cargarOrdenes(): void {
    this.loadingOrdenes.set(true);
    const fechaDesde = this.fechaDesdeCtrl.value;
    const fechaHasta = this.fechaHastaCtrl.value;
    this.ordenesService
      .getOrdenes({
        estado: this.estadoCtrl.value ?? '',
        busqueda: this.busquedaCtrl.value ?? '',
        fechaDesde: fechaDesde ? this.toISODate(fechaDesde) : undefined,
        fechaHasta: fechaHasta ? this.toISODate(fechaHasta) : undefined,
      })
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => this.loadingOrdenes.set(false)),
      )
      .subscribe({
        next: (lista) => this.ordenes.set(lista),
        error: () => this.ordenes.set([]),
      });
  }

  private setupFiltros(): void {
    this.busquedaCtrl.valueChanges
      .pipe(debounceTime(350), distinctUntilChanged(), takeUntil(this.destroy$))
      .subscribe(() => this.cargarOrdenes());

    this.estadoCtrl.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => this.cargarOrdenes());

    this.fechaDesdeCtrl.valueChanges
      .pipe(debounceTime(300), takeUntil(this.destroy$))
      .subscribe(() => this.cargarOrdenes());

    this.fechaHastaCtrl.valueChanges
      .pipe(debounceTime(300), takeUntil(this.destroy$))
      .subscribe(() => this.cargarOrdenes());
  }

  // ── Acciones ──────────────────────────────────────────────────────────────
  onNuevaOrden(): void {
    const ref = this.dialog.open(NuevaOrdenDialogComponent, {
      width: '560px',
      maxWidth: '95vw',
    });
    ref.afterClosed().subscribe((orden) => {
      if (orden) {
        this.cargarOrdenes();
        this.cargarMetrics();
      }
    });
  }

  onCopiarLink(orden: OrdenPago): void {
    this.clipboard.copy(this.ordenesService.buildPaymentLink(orden.token));
    this.notification.show({
      message: 'Link copiado al portapapeles',
      type: NotificationType.SUCCESS,
    });
  }

  onReenviarLink(orden: OrdenPago): void {
    if (this.reenviando()) return;
    this.reenviando.set(orden._id);
    this.ordenesService
      .reenviarLink(orden._id)
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => this.reenviando.set(null)),
      )
      .subscribe({
        next: () =>
          this.notification.show({
            message: 'Link reenviado al correo del ciudadano.',
            type: NotificationType.SUCCESS,
          }),
        error: () =>
          this.notification.show({
            message: 'No se pudo reenviar el link.',
            type: NotificationType.ERROR,
          }),
      });
  }

  onCancelar(orden: OrdenPago): void {
    if (this.cancelando()) return;
    this.cancelando.set(orden._id);
    this.ordenesService
      .cancelarOrden(orden._id)
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => this.cancelando.set(null)),
      )
      .subscribe({
        next: () => {
          this.notification.show({
            message: 'Orden cancelada',
            type: NotificationType.SUCCESS,
          });
          this.cargarOrdenes();
          this.cargarMetrics();
        },
        error: (err) =>
          this.notification.show({
            message: err?.error?.message ?? 'Error al cancelar la orden',
            type: NotificationType.ERROR,
          }),
      });
  }

  onVerRecibo(orden: OrdenPago): void {
    if (!orden.pagoId?._id) return;
    this.ordenesService
      .getRecibo(orden.pagoId._id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: ({ url }) => window.open(url, '_blank'),
        error: () =>
          this.notification.show({
            message: 'No se pudo obtener el recibo.',
            type: NotificationType.ERROR,
          }),
      });
  }

  // ── Helpers de presentación ───────────────────────────────────────────────
  readonly areaLabel = areaLabel;

  estadoBadge(estado: EstadoOrden): { variant: BadgeVariant; label: string } {
    switch (estado) {
      case 'PENDIENTE':
        return { variant: 'warning', label: 'Pendiente' };
      case 'PAGADA':
        return { variant: 'success', label: 'Pagada' };
      case 'CANCELADA':
        return { variant: 'neutral', label: 'Cancelada' };
      case 'EXPIRADA':
        return { variant: 'danger', label: 'Expirada' };
    }
  }

  vigenciaStr(expiresAt: string): string {
    return dayjs(expiresAt)
      .tz('America/Mexico_City')
      .format('DD/MM/YYYY HH:mm');
  }

  estaExpirada(expiresAt: string): boolean {
    return new Date(expiresAt) < new Date();
  }

  nombreCiudadano(orden: OrdenPago): string {
    const c = orden.ciudadanoId;
    if (!c) return '—';
    return `${c.nombre} ${c.apellidoPaterno}`;
  }

  formatMonto(n: number): string {
    return n.toLocaleString('es-MX', {
      style: 'currency',
      currency: 'MXN',
      minimumFractionDigits: 0,
    });
  }

  private toISODate(d: Date): string {
    return d.toISOString().slice(0, 10);
  }
}
