import { Component, inject, signal, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import {
  Subject,
  takeUntil,
  debounceTime,
  distinctUntilChanged,
  finalize,
} from 'rxjs';
import { MatDialog } from '@angular/material/dialog';
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

import { OrdenesInternasService } from '../../../tesoreria/services/ordenes-internas.service';
import { NotificationService } from '../../../../shared/services/notification.service';
import { NotificationType } from '../../../../shared/models/notification.model';
import {
  OrdenInterna,
  EstadoOrdenInterna,
} from '../../../tesoreria/models/ordenes-internas.model';
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
import { NuevaOrdenInternaDialogComponent } from '../../../tesoreria/components/nueva-orden-interna-dialog/nueva-orden-interna-dialog.component';
import { WebSocketService } from '../../../../core/services/websocket.service';

import dayjs from 'dayjs';

@Component({
  selector: 'app-ordenes-pago-secretaria',
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
    StatusBadgeComponent,
    FolioTagComponent,
    ActionButtonComponent,
    DataTableComponent,
  ],
  templateUrl: './ordenes-pago-secretaria.page.html',
  styleUrls: ['./ordenes-pago-secretaria.page.scss'],
})
export class OrdenesPagoSecretariaPage implements OnInit, OnDestroy {
  private ordenesService = inject(OrdenesInternasService);
  private notification = inject(NotificationService);
  private dialog = inject(MatDialog);
  private wsService = inject(WebSocketService);
  private destroy$ = new Subject<void>();

  readonly areaResponsable = 'Secretaría del Ayuntamiento';

  // ── Estado ───────────────────────────────────────────────────────────────
  ordenes = signal<OrdenInterna[]>([]);
  loading = signal(false);
  cancelando = signal<string | null>(null);

  // ── Filtros ──────────────────────────────────────────────────────────────
  busquedaCtrl = new FormControl('');
  estadoCtrl = new FormControl<EstadoOrdenInterna | ''>('');
  fechaDesdeCtrl = new FormControl<Date | null>(null);
  fechaHastaCtrl = new FormControl<Date | null>(null);

  readonly estadoOpciones: { value: EstadoOrdenInterna | ''; label: string }[] =
    [
      { value: '', label: 'Todos los estados' },
      { value: 'PENDIENTE', label: 'Pendiente' },
      { value: 'PAGADA', label: 'Pagada' },
      { value: 'CANCELADA', label: 'Cancelada' },
    ];

  readonly tableColumns: TableColumn[] = [
    { key: 'folio', label: 'Folio' },
    { key: 'ciudadano', label: 'Ciudadano' },
    { key: 'servicio', label: 'Servicio' },
    { key: 'monto', label: 'Monto', align: 'right' },
    { key: 'estado', label: 'Estado' },
    { key: 'fecha', label: 'Fecha' },
    { key: 'acciones', label: 'Acciones', align: 'center' },
  ];

  // ── Lifecycle ─────────────────────────────────────────────────────────────
  ngOnInit(): void {
    this.cargarOrdenes();
    this.setupFiltros();
    this.setupWebSocket();
  }

  ngOnDestroy(): void {
    this.wsService.leaveArea(this.areaResponsable);
    this.destroy$.next();
    this.destroy$.complete();
  }
  // ── WebSocket ───────────────────────────────────────────────────────────────
  private setupWebSocket(): void {
    this.wsService.ordenPagada$
      .pipe(takeUntil(this.destroy$))
      .subscribe((evento) => {
        if (evento.area && evento.area !== this.areaResponsable) return;
        this.ordenes.update((lista) =>
          lista.map((o) =>
            o.folio === evento.folioOrden
              ? { ...o, estado: 'PAGADA' as const }
              : o,
          ),
        );
        this.notification.show({
          message: `✅ Orden ${evento.folioOrden} pagada — ${evento.ciudadano}`,
          type: NotificationType.SUCCESS,
        });
      });

    // Refrescar tabla si el socket se reconectó
    this.wsService.reconectado$.pipe(takeUntil(this.destroy$)).subscribe(() => {
      console.log('[Secretaría] reconectado — refrescando órdenes');
      this.cargarOrdenes();
    });
  }
  // ── Carga ─────────────────────────────────────────────────────────────────
  cargarOrdenes(): void {
    this.loading.set(true);
    const estado = this.estadoCtrl.value || undefined;
    const busqueda = this.busquedaCtrl.value?.trim() || undefined;
    const fechaDesde = this.fechaDesdeCtrl.value
      ? dayjs(this.fechaDesdeCtrl.value).format('YYYY-MM-DD')
      : undefined;
    const fechaHasta = this.fechaHastaCtrl.value
      ? dayjs(this.fechaHastaCtrl.value).format('YYYY-MM-DD')
      : undefined;

    this.ordenesService
      .getOrdenes({
        areaResponsable: this.areaResponsable,
        ...(estado && { estado }),
        ...(busqueda && { busqueda }),
        ...(fechaDesde && { fechaDesde }),
        ...(fechaHasta && { fechaHasta }),
      })
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => this.loading.set(false)),
      )
      .subscribe({
        next: (data) => this.ordenes.set(data ?? []),
        error: () =>
          this.notification.show({
            message: 'Error al cargar las órdenes',
            type: NotificationType.ERROR,
          }),
      });
  }

  private setupFiltros(): void {
    this.busquedaCtrl.valueChanges
      .pipe(debounceTime(400), distinctUntilChanged(), takeUntil(this.destroy$))
      .subscribe(() => this.cargarOrdenes());

    this.estadoCtrl.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => this.cargarOrdenes());

    this.fechaDesdeCtrl.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => this.cargarOrdenes());

    this.fechaHastaCtrl.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => this.cargarOrdenes());
  }

  // ── Acciones ──────────────────────────────────────────────────────────────
  onNuevaOrden(): void {
    const ref = this.dialog.open(NuevaOrdenInternaDialogComponent, {
      width: '560px',
      disableClose: true,
      data: { areaResponsable: this.areaResponsable },
    });
    ref.afterClosed().subscribe((orden: OrdenInterna | null | undefined) => {
      console.log('[Secretaría] dialog cerrado, orden:', orden);
      this.cargarOrdenes();
    });
  }

  onCancelar(orden: OrdenInterna): void {
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
            message: `Orden ${orden.folio} cancelada.`,
            type: NotificationType.SUCCESS,
          });
          this.cargarOrdenes();
        },
        error: (err) =>
          this.notification.show({
            message: err?.error?.message ?? 'No se pudo cancelar la orden',
            type: NotificationType.ERROR,
          }),
      });
  }

  // ── Helpers ───────────────────────────────────────────────────────────────
  nombreCiudadano(o: OrdenInterna): string {
    const c = o.ciudadanoId;
    if (!c) return o.nombreContribuyente ?? '—';
    return [c.nombre, c.apellidoPaterno, c.apellidoMaterno]
      .filter(Boolean)
      .join(' ');
  }

  estadoBadge(estado: EstadoOrdenInterna): {
    label: string;
    variant: BadgeVariant;
  } {
    switch (estado) {
      case 'PENDIENTE':
        return { label: 'Pendiente', variant: 'warning' };
      case 'PAGADA':
        return { label: 'Pagada', variant: 'success' };
      case 'CANCELADA':
        return { label: 'Cancelada', variant: 'danger' };
    }
  }

  formatMonto(monto: number): string {
    return monto.toLocaleString('es-MX', {
      style: 'currency',
      currency: 'MXN',
      minimumFractionDigits: 2,
    });
  }

  formatFecha(fecha: string): string {
    return dayjs(fecha).format('DD/MM/YYYY HH:mm');
  }
}
