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
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { debounceTime, distinctUntilChanged } from 'rxjs';
import { CitasService } from '../../services/citas.service';
import { NotificationService } from '../../../../shared/services/notification.service';
import {
  Cita,
  EstadoCita,
  ESTADO_CITA_LABELS,
  FiltrosCitas,
  ConfiguracionCitasArea,
  CambiarEstadoDto,
} from '../../models/citas.model';

@Component({
  selector: 'app-lista-citas',
  standalone: true,
  imports: [
    CommonModule,
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
    MatDialogModule,
  ],
  templateUrl: './lista-citas.page.html',
  styleUrl: './lista-citas.page.scss',
})
export class ListaCitasPage implements OnInit {
  private citasService = inject(CitasService);
  private notif = inject(NotificationService);
  private fb = inject(FormBuilder);
  private destroyRef = inject(DestroyRef);

  cargando = signal(false);
  citas = signal<Cita[]>([]);
  total = signal(0);
  page = signal(1);
  limit = signal(20);
  configs = signal<ConfiguracionCitasArea[]>([]);
  cambiandoEstado = signal<string | null>(null);
  citaExpandida = signal<string | null>(null);

  readonly estadoLabels = ESTADO_CITA_LABELS;
  readonly estados: EstadoCita[] = [
    'pendiente',
    'confirmada',
    'atendida',
    'no_se_presento',
    'cancelada',
  ];
  readonly origenes = [
    { value: 'ciudadano', label: 'Ciudadano' },
    { value: 'recepcion', label: 'Recepción' },
  ];

  readonly columnas = [
    'hora',
    'folio',
    'ciudadano',
    'tramite',
    'area',
    'estado',
    'origen',
    'acciones',
  ];

  filtros = this.fb.group({
    curp: [''],
    tramite: [''],
    area: [''],
    estado: [''],
    origen: [''],
    fechaInicio: [null as Date | null],
    fechaFin: [null as Date | null],
  });

  totalPages = computed(() => Math.ceil(this.total() / this.limit()));

  ngOnInit(): void {
    this.cargarConfigs();
    this.cargar();

    // Re-buscar al cambiar filtros con debounce para CURP/trámite
    this.filtros.controls.curp.valueChanges
      .pipe(
        debounceTime(400),
        distinctUntilChanged(),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe(() => this.buscar());

    this.filtros.controls.tramite.valueChanges
      .pipe(
        debounceTime(400),
        distinctUntilChanged(),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe(() => this.buscar());

    // Filtros de select: buscar inmediatamente
    this.filtros.controls.area.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => this.buscar());
    this.filtros.controls.estado.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => this.buscar());
    this.filtros.controls.origen.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => this.buscar());
    this.filtros.controls.fechaInicio.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => this.buscar());
    this.filtros.controls.fechaFin.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => this.buscar());
  }

  private cargarConfigs(): void {
    this.citasService
      .getConfiguraciones()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({ next: (c) => this.configs.set(c) });
  }

  buscar(): void {
    this.page.set(1);
    this.cargar();
  }

  cargar(): void {
    this.cargando.set(true);
    const f = this.filtros.value;
    const filtros: FiltrosCitas = {
      page: this.page(),
      limit: this.limit(),
    };
    if (f.curp) filtros.curp = f.curp;
    if (f.tramite) filtros.tramite = f.tramite;
    if (f.area) filtros.area = f.area;
    if (f.estado) filtros.estado = f.estado as EstadoCita;
    if (f.origen) filtros.origen = f.origen as 'ciudadano' | 'recepcion';
    if (f.fechaInicio) filtros.fechaInicio = this.toIso(f.fechaInicio);
    if (f.fechaFin) filtros.fechaFin = this.toIso(f.fechaFin);

    this.citasService
      .getCitas(filtros)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (res) => {
          this.citas.set(res.data);
          this.total.set(res.total);
          this.cargando.set(false);
        },
        error: () => {
          this.notif.error('Error al cargar citas');
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
    this.filtros.reset();
  }

  toggleDetalle(id: string): void {
    this.citaExpandida.set(this.citaExpandida() === id ? null : id);
  }

  cambiarEstado(cita: Cita, estado: EstadoCita): void {
    this.cambiandoEstado.set(cita._id);
    const dto: CambiarEstadoDto = { estado };
    this.citasService
      .cambiarEstado(cita._id, dto)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (actualizada) => {
          this.citas.update((lista) =>
            lista.map((c) => (c._id === cita._id ? actualizada : c)),
          );
          this.cambiandoEstado.set(null);
          this.notif.success('Estado actualizado');
        },
        error: () => {
          this.cambiandoEstado.set(null);
          this.notif.error('No se pudo cambiar el estado');
        },
      });
  }

  estadoColor(estado: EstadoCita): string {
    const map: Record<EstadoCita, string> = {
      pendiente: 'warn-chip',
      confirmada: 'info-chip',
      atendida: 'success-chip',
      no_se_presento: 'neutral-chip',
      cancelada: 'danger-chip',
    };
    return map[estado];
  }

  getEstadoLabel(estado: string): string {
    return ESTADO_CITA_LABELS[estado as EstadoCita] ?? estado;
  }

  private toIso(d: Date): string {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  }
}
