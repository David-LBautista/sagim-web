import {
  Component,
  inject,
  signal,
  computed,
  DestroyRef,
  OnInit,
  OnDestroy,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatChipsModule } from '@angular/material/chips';
import { MatMenuModule } from '@angular/material/menu';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatCardModule } from '@angular/material/card';
import { MatBadgeModule } from '@angular/material/badge';
import { MatDialogModule } from '@angular/material/dialog';
import { MatDialog } from '@angular/material/dialog';
import { debounceTime, distinctUntilChanged } from 'rxjs';
import { NuevoReporteDialogComponent } from '../../components/nuevo-reporte-dialog/nuevo-reporte-dialog.component';
import { ActionButtonComponent } from '../../../../shared/components/action-button/action-button.component';
import { ReportesService } from '../../services/reportes.service';
import { WebSocketService } from '../../../../core/services/websocket.service';
import { AuthService } from '../../../auth/services/auth.service';
import { NotificationService } from '../../../../shared/services/notification.service';
import {
  Reporte,
  EstadoReporte,
  PrioridadReporte,
  CategoriaReporte,
  ModuloReporte,
  FiltrosReportes,
  ESTADO_REPORTE_LABELS,
  PRIORIDAD_REPORTE_LABELS,
  CATEGORIA_REPORTE_LABELS,
  CATEGORIA_REPORTE_ICONS,
  MODULO_REPORTE_LABELS,
} from '../../models/reportes.model';

@Component({
  selector: 'app-lista-reportes',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    ReactiveFormsModule,
    MatTableModule,
    MatPaginatorModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatProgressBarModule,
    MatTooltipModule,
    MatChipsModule,
    MatMenuModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatCardModule,
    MatBadgeModule,
    MatDialogModule,
    ActionButtonComponent,
  ],
  templateUrl: './lista-reportes.page.html',
  styleUrl: './lista-reportes.page.scss',
})
export class ListaReportesPage implements OnInit, OnDestroy {
  private reportesService = inject(ReportesService);
  private wsService = inject(WebSocketService);
  private authService = inject(AuthService);
  private notif = inject(NotificationService);
  private fb = inject(FormBuilder);
  private destroyRef = inject(DestroyRef);
  private dialog = inject(MatDialog);

  cargando = signal(false);
  reportes = signal<Reporte[]>([]);
  total = signal(0);
  page = signal(1);
  limit = signal(20);
  nuevosEnTiempoReal = signal(0);

  // KPIs
  totalPendientes = signal(0);
  totalEnProceso = signal(0);
  totalResueltos = signal(0);
  totalUrgentes = signal(0);

  readonly estadoLabels = ESTADO_REPORTE_LABELS;
  readonly prioridadLabels = PRIORIDAD_REPORTE_LABELS;
  readonly categoriaLabels = CATEGORIA_REPORTE_LABELS;
  readonly categoriaIcons = CATEGORIA_REPORTE_ICONS;
  readonly moduloLabels = MODULO_REPORTE_LABELS;

  readonly estados: EstadoReporte[] = [
    'pendiente',
    'en_proceso',
    'resuelto',
    'cancelado',
  ];
  readonly prioridades: PrioridadReporte[] = [
    'baja',
    'normal',
    'alta',
    'urgente',
  ];
  readonly categorias: CategoriaReporte[] = [
    'infraestructura_vial',
    'alumbrado_publico',
    'agua_drenaje',
    'basura_limpieza',
    'areas_verdes',
    'medio_ambiente',
    'seguridad_publica',
    'transito_vialidad',
    'proteccion_civil',
    'otro',
  ];
  readonly modulos: ModuloReporte[] = [
    'SERVICIOS_PUBLICOS',
    'DESARROLLO_URBANO',
    'SEGURIDAD_PUBLICA',
    'ORGANISMO_AGUA',
    'PRESIDENCIA',
  ];

  readonly columnas = [
    'folio',
    'categoria',
    'ciudadano',
    'modulo',
    'prioridad',
    'estado',
    'fecha',
    'acciones',
  ];

  filtros = this.fb.group({
    buscar: [''],
    categoria: [''],
    estado: [''],
    modulo: [''],
    prioridad: [''],
    fechaInicio: [null as Date | null],
    fechaFin: [null as Date | null],
  });

  totalPages = computed(() => Math.ceil(this.total() / this.limit()));

  filtrosActivos = computed(() => {
    const f = this.filtros.value;
    return [
      f.buscar,
      f.categoria,
      f.estado,
      f.modulo,
      f.prioridad,
      f.fechaInicio,
      f.fechaFin,
    ].filter((v) => v != null && v !== '').length;
  });

  ngOnInit(): void {
    this.cargarKpis();
    this.cargar();
    this.suscribirWs();
  }

  abrirNuevoReporte(): void {
    const ref = this.dialog.open(NuevoReporteDialogComponent, {
      width: '680px',
      maxWidth: '95vw',
      disableClose: true,
    });
    ref.afterClosed().subscribe((result) => {
      if (result) {
        this.cargar();
        this.cargarKpis();
      }
    });
  }

  ngOnDestroy(): void {
    const user = this.authService.getCurrentUser();
    if (user) this.wsService.leaveUsuario(user.id);
  }

  private suscribirWs(): void {
    const user = this.authService.getCurrentUser();
    if (user) this.wsService.joinUsuario(user.id);

    this.wsService.nuevoReporte$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((ev) => {
        this.nuevosEnTiempoReal.update((n) => n + 1);
        this.notif.info(`Nuevo reporte: ${ev.categoriaNombre} — ${ev.folio}`);
      });

    this.wsService.reporteActualizado$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((ev) => {
        this.reportes.update((lista) =>
          lista.map((r) =>
            r._id === ev.id ? { ...r, estado: ev.estado as EstadoReporte } : r,
          ),
        );
      });
  }

  private bindFiltros(): void {
    this.filtros.controls.buscar.valueChanges
      .pipe(
        debounceTime(400),
        distinctUntilChanged(),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe(() => this.buscar());

    this.filtros.controls.categoria.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => this.buscar());
    this.filtros.controls.estado.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => this.buscar());
    this.filtros.controls.modulo.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => this.buscar());
    this.filtros.controls.prioridad.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => this.buscar());
    this.filtros.controls.fechaInicio.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => this.buscar());
    this.filtros.controls.fechaFin.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => this.buscar());
  }

  private cargarKpis(): void {
    this.reportesService
      .getReportes({ page: 1, limit: 1, estado: 'pendiente' })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({ next: (r) => this.totalPendientes.set(r.total) });

    this.reportesService
      .getReportes({ page: 1, limit: 1, estado: 'en_proceso' })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({ next: (r) => this.totalEnProceso.set(r.total) });

    this.reportesService
      .getReportes({ page: 1, limit: 1, estado: 'resuelto' })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({ next: (r) => this.totalResueltos.set(r.total) });

    this.reportesService
      .getReportes({ page: 1, limit: 1, prioridad: 'urgente' })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({ next: (r) => this.totalUrgentes.set(r.total) });
  }

  buscar(): void {
    this.page.set(1);
    this.cargar();
  }

  cargar(): void {
    this.cargando.set(true);
    const f = this.filtros.value;
    const filtros: FiltrosReportes = { page: this.page(), limit: this.limit() };
    if (f.buscar) filtros.buscar = f.buscar;
    if (f.categoria) filtros.categoria = f.categoria as CategoriaReporte;
    if (f.estado) filtros.estado = f.estado as EstadoReporte;
    if (f.modulo) filtros.modulo = f.modulo as ModuloReporte;
    if (f.prioridad) filtros.prioridad = f.prioridad as PrioridadReporte;
    if (f.fechaInicio) filtros.fechaInicio = this.toIso(f.fechaInicio);
    if (f.fechaFin) filtros.fechaFin = this.toIsoEndOfDay(f.fechaFin);

    this.reportesService
      .getReportes(filtros)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (res) => {
          this.reportes.set(res.data);
          this.total.set(res.total);
          this.cargando.set(false);
        },
        error: () => {
          this.notif.error('Error al cargar reportes');
          this.cargando.set(false);
        },
      });
  }

  onPage(event: PageEvent): void {
    this.page.set(event.pageIndex + 1);
    this.limit.set(event.pageSize);
    this.cargar();
  }

  limpiarFiltros(): void {
    this.filtros.reset({}, { emitEvent: false });
    this.nuevosEnTiempoReal.set(0);
    this.buscar();
  }

  recargarConNuevos(): void {
    this.nuevosEnTiempoReal.set(0);
    this.buscar();
  }

  getCategoriaIcon(cat: string): string {
    return this.categoriaIcons[cat as CategoriaReporte] ?? 'report_problem';
  }

  getCategoriaLabel(cat: string): string {
    return this.categoriaLabels[cat as CategoriaReporte] ?? cat;
  }

  getModuloLabel(mod: string): string {
    return this.moduloLabels[mod as ModuloReporte] ?? mod;
  }

  getPrioridadLabel(p: string): string {
    return this.prioridadLabels[p as PrioridadReporte] ?? p;
  }

  getEstadoLabel(e: string): string {
    return this.estadoLabels[e as EstadoReporte] ?? e;
  }

  estadoClass(estado: EstadoReporte): string {
    const map: Record<EstadoReporte, string> = {
      pendiente: 'chip-warn',
      en_proceso: 'chip-info',
      resuelto: 'chip-success',
      cancelado: 'chip-neutral',
    };
    return map[estado];
  }

  prioridadClass(prioridad: PrioridadReporte): string {
    const map: Record<PrioridadReporte, string> = {
      baja: 'chip-neutral',
      normal: 'chip-info',
      alta: 'chip-warn',
      urgente: 'chip-danger',
    };
    return map[prioridad];
  }

  private toIso(d: Date): string {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  }

  private toIsoEndOfDay(d: Date): string {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}T23:59:59`;
  }
}
