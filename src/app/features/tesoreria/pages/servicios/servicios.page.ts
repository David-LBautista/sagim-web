import { Component, inject, OnInit, OnDestroy, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  Subject,
  takeUntil,
  debounceTime,
  distinctUntilChanged,
  finalize,
} from 'rxjs';
import { MatTableModule } from '@angular/material/table';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDialog } from '@angular/material/dialog';
import { MatChipsModule } from '@angular/material/chips';

import { TesoreriaService } from '../../services/tesoreria.service';
import { CajaService } from '../../services/caja.service';
import { NotificationService } from '../../../../shared/services/notification.service';
import {
  ServicioCobrable,
  CategoriaServicio,
  ServiciosQueryParams,
} from '../../models/servicios.model';
import { NotificationType } from '../../../../shared/models/notification.model';
import { ServicioEditDialogComponent } from '../../components/servicio-edit-dialog/servicio-edit-dialog.component';

export const CATEGORIA_CONFIG: Record<
  CategoriaServicio,
  { color: string; bg: string }
> = {
  'Registro Civil': { color: '#1f6fae', bg: '#e3f0fa' },
  Predial: { color: '#b45309', bg: '#fef3c7' },
  'Agua y Saneamiento': { color: '#0369a1', bg: '#e0f2fe' },
  'Licencias y Permisos': { color: '#6d28d9', bg: '#ede9fe' },
  'Servicios Urbanos': { color: '#0f766e', bg: '#ccfbf1' },
  Panteón: { color: '#475569', bg: '#f1f5f9' },
  Constancias: { color: '#15803d', bg: '#dcfce7' },
};

@Component({
  selector: 'app-servicios-tesoreria',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatTableModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatSlideToggleModule,
    MatTooltipModule,
    MatProgressSpinnerModule,
    MatChipsModule,
  ],
  templateUrl: './servicios.page.html',
  styleUrls: ['./servicios.page.scss'],
})
export class ServiciosTesoreriaPage implements OnInit, OnDestroy {
  private tesoreriaService = inject(TesoreriaService);
  private cajaService = inject(CajaService);
  private notificationService = inject(NotificationService);
  private dialog = inject(MatDialog);
  private destroy$ = new Subject<void>();
  private busquedaSubject = new Subject<string>();

  readonly CATEGORIA_CONFIG = CATEGORIA_CONFIG;

  servicios = signal<ServicioCobrable[]>([]);
  categorias = signal<CategoriaServicio[]>(
    Object.keys(CATEGORIA_CONFIG) as CategoriaServicio[],
  );
  hasOverrides = signal(false);
  loading = signal(true);
  restableciendo = signal(false);
  restablecienodoClave = signal<string | null>(null);
  generandoReporteClave = signal<string | null>(null);

  busqueda = '';
  categoriaSeleccionada: CategoriaServicio | '' = '';
  soloPersonalizados = false;

  displayedColumns = [
    'nombre',
    'categoria',
    'costo',
    'variable',
    'estado',
    'personalizado',
    'reporte',
    'acciones',
  ];

  ngOnInit(): void {
    this.loadCatalogo();
    this.checkOverrides();
    this.loadServicios();

    this.busquedaSubject
      .pipe(debounceTime(300), distinctUntilChanged(), takeUntil(this.destroy$))
      .subscribe(() => this.loadServicios());
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private buildParams(): ServiciosQueryParams {
    const params: ServiciosQueryParams = {};
    if (this.busqueda.trim()) params.busqueda = this.busqueda.trim();
    if (this.categoriaSeleccionada)
      params.categoria = this.categoriaSeleccionada;
    if (this.soloPersonalizados) params.soloPersonalizados = true;
    return params;
  }

  loadServicios(): void {
    this.loading.set(true);
    this.tesoreriaService
      .getServicios(this.buildParams())
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data) => {
          this.servicios.set(data);
          this.loading.set(false);
        },
        error: () => {
          this.notificationService.show({
            message: 'Error al cargar los servicios',
            type: NotificationType.ERROR,
          });
          this.loading.set(false);
        },
      });
  }

  private loadCatalogo(): void {
    this.tesoreriaService
      .getCatalogo()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res) => {
          if (res.categorias?.length) {
            this.categorias.set(res.categorias);
          }
        },
        // Si falla el endpoint, el selector ya tiene las categorías del CATEGORIA_CONFIG
        error: () => {},
      });
  }

  private checkOverrides(): void {
    this.tesoreriaService
      .hasOverrides()
      .pipe(takeUntil(this.destroy$))
      .subscribe({ next: (res) => this.hasOverrides.set(res.hasOverrides) });
  }

  onBusquedaChange(value: string): void {
    this.busqueda = value;
    this.busquedaSubject.next(value);
  }

  onFiltroChange(): void {
    this.loadServicios();
  }

  onEditarServicio(servicio: ServicioCobrable): void {
    const ref = this.dialog.open(ServicioEditDialogComponent, {
      width: '480px',
      maxWidth: '95vw',
      disableClose: true,
      data: { servicio },
    });

    ref.afterClosed().subscribe((updated: ServicioCobrable | null) => {
      if (updated) {
        this.hasOverrides.set(true);
        this.loadServicios();
      }
    });
  }

  onRestablecerItem(servicio: ServicioCobrable, event: Event): void {
    event.stopPropagation();
    this.restablecienodoClave.set(servicio.clave);
    this.tesoreriaService.deleteOverride(servicio.clave).subscribe({
      next: () => {
        this.notificationService.show({
          message: `"${servicio.nombre}" restablecido al valor por defecto`,
          type: NotificationType.SUCCESS,
        });
        this.restablecienodoClave.set(null);
        this.loadServicios();
        this.checkOverrides();
      },
      error: () => {
        this.notificationService.show({
          message: 'Error al restablecer el servicio',
          type: NotificationType.ERROR,
        });
        this.restablecienodoClave.set(null);
      },
    });
  }

  onRestablecerTodo(): void {
    this.restableciendo.set(true);
    this.tesoreriaService.deleteAllOverrides().subscribe({
      next: (res) => {
        this.notificationService.show({
          message: `Se restablecieron ${res.eliminados} servicios al valor por defecto`,
          type: NotificationType.SUCCESS,
        });
        this.hasOverrides.set(false);
        this.restableciendo.set(false);
        this.loadServicios();
      },
      error: () => {
        this.notificationService.show({
          message: 'Error al restablecer los servicios',
          type: NotificationType.ERROR,
        });
        this.restableciendo.set(false);
      },
    });
  }

  getCategoriaStyle(categoria: CategoriaServicio): { [k: string]: string } {
    const cfg = CATEGORIA_CONFIG[categoria];
    return cfg ? { color: cfg.color, background: cfg.bg } : {};
  }

  isRestableciendo(clave: string): boolean {
    return this.restablecienodoClave() === clave;
  }

  isGenerandoReporte(id: string): boolean {
    return this.generandoReporteClave() === id;
  }

  onVerReporteServicio(servicio: ServicioCobrable, event: Event): void {
    event.stopPropagation();
    if (this.generandoReporteClave()) return;
    this.generandoReporteClave.set(servicio._id);
    this.cajaService
      .getReporteServicioPdf(servicio._id)
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => this.generandoReporteClave.set(null)),
      )
      .subscribe({
        next: ({ url }) => window.open(url, '_blank'),
        error: () =>
          this.notificationService.show({
            message: `No se pudo generar el reporte de "${servicio.nombre}".`,
            type: NotificationType.ERROR,
          }),
      });
  }
}
