import {
  Component,
  OnInit,
  OnDestroy,
  ViewChild,
  inject,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import {
  MatPaginatorModule,
  MatPaginator,
  PageEvent,
} from '@angular/material/paginator';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatDividerModule } from '@angular/material/divider';
import { MatDialog } from '@angular/material/dialog';
import { Subject, debounceTime, distinctUntilChanged, takeUntil } from 'rxjs';
import dayjs from 'dayjs';

import { CiudadanosService } from '../../services/ciudadanos.service';
import { NotificationService } from '../../../../shared/services/notification.service';
import { KpiCardComponent } from '../../../../shared/components/kpi-card/kpi-card.component';
import { ActionButtonComponent } from '../../../../shared/components/action-button/action-button.component';
import { StatusBadgeComponent } from '../../../../shared/components/status-badge/status-badge.component';
import { CiudadanoFormDialogComponent } from '../../components/ciudadano-form-dialog/ciudadano-form-dialog.component';
import { ImportarPadronDialogComponent } from '../../components/importar-padron-dialog/importar-padron-dialog.component';
import type {
  Ciudadano,
  CiudadanosEstadisticas,
} from '../../models/ciudadano.model';

@Component({
  selector: 'app-padron',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatTableModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatTooltipModule,
    MatProgressSpinnerModule,
    MatSlideToggleModule,
    MatDividerModule,
    MatPaginatorModule,
    KpiCardComponent,
    ActionButtonComponent,
    StatusBadgeComponent,
  ],
  templateUrl: './padron.page.html',
  styleUrl: './padron.page.scss',
})
export class PadronPage implements OnInit, OnDestroy {
  private ciudadanosService = inject(CiudadanosService);
  private notificationService = inject(NotificationService);
  private dialog = inject(MatDialog);

  @ViewChild(MatPaginator) paginator!: MatPaginator;

  private destroy$ = new Subject<void>();
  private searchSubject = new Subject<string>();

  // ---- loading ----
  loading = signal(false);
  loadingStats = signal(false);
  exportando = signal(false);

  // ---- estadísticas ----
  estadisticas = signal<CiudadanosEstadisticas | null>(null);

  // ---- tabla ----
  dataSource = new MatTableDataSource<Ciudadano>([]);
  total = 0;
  page = 1;
  limit = 20;

  readonly displayedColumns = [
    'nombre',
    'curp',
    'localidad',
    'telefono',
    'email',
    'registrado',
    'estatus',
    'acciones',
  ];

  // ---- filtros ----
  busqueda = '';
  localidadFiltro = '';
  soloActivos = true;

  // ---- drawer detalle ----
  drawerOpen = signal(false);
  ciudadanoDetalle = signal<Ciudadano | null>(null);
  loadingDetalle = signal(false);

  // ============================================================

  ngOnInit(): void {
    this.loadStats();
    this.loadCiudadanos();

    this.searchSubject
      .pipe(debounceTime(400), distinctUntilChanged(), takeUntil(this.destroy$))
      .subscribe(() => {
        this.page = 1;
        if (this.paginator) this.paginator.pageIndex = 0;
        this.loadCiudadanos();
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // ---- carga de datos ----

  loadStats(): void {
    this.loadingStats.set(true);
    this.ciudadanosService.getEstadisticas().subscribe({
      next: (stats) => {
        this.estadisticas.set(stats);
        this.loadingStats.set(false);
      },
      error: () => this.loadingStats.set(false),
    });
  }

  loadCiudadanos(): void {
    this.loading.set(true);
    this.ciudadanosService
      .getCiudadanos({
        page: this.page,
        limit: this.limit,
        busqueda: this.busqueda || undefined,
        localidad: this.localidadFiltro || undefined,
        activo: this.soloActivos ? true : undefined,
      })
      .subscribe({
        next: (res) => {
          this.dataSource.data = res.data;
          this.total = res.total;
          this.page = res.page;
          this.limit = res.limit;
          this.loading.set(false);
        },
        error: () => {
          this.notificationService.error('Error al cargar ciudadanos');
          this.loading.set(false);
        },
      });
  }

  // ---- filtros ----

  onSearchChange(): void {
    this.searchSubject.next(this.busqueda);
  }

  onFiltroChange(): void {
    this.page = 1;
    if (this.paginator) this.paginator.pageIndex = 0;
    this.loadCiudadanos();
  }

  // ---- paginación ----

  onPageChange(event: PageEvent): void {
    this.page = event.pageIndex + 1;
    this.limit = event.pageSize;
    this.loadCiudadanos();
  }

  // ---- drawer detalle ----

  verDetalle(ciudadano: Ciudadano): void {
    this.ciudadanoDetalle.set(ciudadano);
    this.drawerOpen.set(true);
    this.loadingDetalle.set(true);
    this.ciudadanosService.getCiudadanoById(ciudadano._id).subscribe({
      next: (full) => {
        this.ciudadanoDetalle.set(full);
        this.loadingDetalle.set(false);
      },
      error: () => this.loadingDetalle.set(false),
    });
  }

  cerrarDetalle(): void {
    this.drawerOpen.set(false);
    this.ciudadanoDetalle.set(null);
  }

  // ---- acciones ----

  agregarCiudadano(): void {
    const dialogRef = this.dialog.open(CiudadanoFormDialogComponent, {
      width: '680px',
      maxWidth: '95vw',
      disableClose: true,
      data: {},
    });
    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.page = 1;
        if (this.paginator) this.paginator.pageIndex = 0;
        this.loadCiudadanos();
        this.loadStats();
      }
    });
  }

  editarCiudadano(ciudadano: Ciudadano): void {
    const dialogRef = this.dialog.open(CiudadanoFormDialogComponent, {
      width: '680px',
      maxWidth: '95vw',
      disableClose: true,
      data: { ciudadano },
    });
    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.loadCiudadanos();
        if (this.ciudadanoDetalle()?._id === ciudadano._id) {
          this.ciudadanoDetalle.set(result);
        }
      }
    });
  }

  desactivar(ciudadano: Ciudadano): void {
    const nombre = `${ciudadano.nombre} ${ciudadano.apellidoPaterno}`;
    if (
      !confirm(
        `¿Desactivar a ${nombre}? El historial de pagos y apoyos DIF quedará intacto.`,
      )
    )
      return;

    this.ciudadanosService.desactivarCiudadano(ciudadano._id).subscribe({
      next: () => {
        this.notificationService.success('Ciudadano desactivado correctamente');
        this.loadCiudadanos();
        if (
          this.drawerOpen() &&
          this.ciudadanoDetalle()?._id === ciudadano._id
        ) {
          this.cerrarDetalle();
        }
      },
      error: () =>
        this.notificationService.error('Error al desactivar ciudadano'),
    });
  }

  exportar(): void {
    this.exportando.set(true);
    this.ciudadanosService
      .exportarPadron(this.busqueda || undefined)
      .subscribe({
        next: (blob) => {
          const fecha = dayjs().format('YYYY-MM-DD');
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `padron-ciudadanos-${fecha}.xlsx`;
          a.click();
          URL.revokeObjectURL(url);
          this.exportando.set(false);
        },
        error: () => {
          this.notificationService.error('Error al exportar padrón');
          this.exportando.set(false);
        },
      });
  }

  importar(): void {
    const dialogRef = this.dialog.open(ImportarPadronDialogComponent, {
      width: '680px',
      maxWidth: '95vw',
      disableClose: true,
    });
    dialogRef.afterClosed().subscribe((huboImportacion) => {
      if (huboImportacion) {
        this.page = 1;
        if (this.paginator) this.paginator.pageIndex = 0;
        this.loadCiudadanos();
        this.loadStats();
      }
    });
  }

  // ---- utilidades ----

  nombreCompleto(c: Ciudadano): string {
    return [c.apellidoPaterno, c.apellidoMaterno, c.nombre]
      .filter(Boolean)
      .join(' ');
  }

  formatFecha(fecha: string): string {
    return dayjs(fecha).format('DD/MMM/YY');
  }

  formatFechaLarga(fecha: string): string {
    return dayjs(fecha).format('DD/MM/YYYY');
  }
}
