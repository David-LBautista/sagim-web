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
import { MatMenuModule } from '@angular/material/menu';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatTableModule } from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { CitasService } from '../../services/citas.service';
import { NotificationService } from '../../../../shared/services/notification.service';
import {
  CitaHoy,
  ResumenHoy,
  EstadoCita,
  ESTADO_CITA_LABELS,
  ConfiguracionCitasArea,
} from '../../models/citas.model';

@Component({
  selector: 'app-agenda-hoy',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatMenuModule,
    MatProgressBarModule,
    MatTableModule,
    MatTooltipModule,
    MatSelectModule,
    MatFormFieldModule,
  ],
  templateUrl: './agenda-hoy.page.html',
  styleUrl: './agenda-hoy.page.scss',
})
export class AgendaHoyPage implements OnInit {
  private citasService = inject(CitasService);
  private notif = inject(NotificationService);
  private destroyRef = inject(DestroyRef);

  cargando = signal(false);
  resumen = signal<ResumenHoy | null>(null);
  configs = signal<ConfiguracionCitasArea[]>([]);
  areaFiltro = signal<string>('');
  cambiandoEstado = signal<string | null>(null); // _id de cita en proceso

  readonly estadoLabels = ESTADO_CITA_LABELS;
  readonly displayedColumns = [
    'hora',
    'folio',
    'ciudadano',
    'tramite',
    'estado',
    'acciones',
  ];
  readonly estadosAccion: EstadoCita[] = [
    'confirmada',
    'atendida',
    'no_se_presento',
    'cancelada',
  ];

  citasFiltradas = computed(() => {
    const r = this.resumen();
    if (!r) return [];
    const filtro = this.areaFiltro();
    if (!filtro) return r.citas;
    return r.citas.filter((c) => c.area._id === filtro);
  });

  tasaAsistencia = computed(() => {
    const r = this.resumen();
    if (!r || r.total === 0) return 0;
    return Math.round((r.atendidas / r.total) * 100);
  });

  ngOnInit(): void {
    this.cargarConfigs();
    this.cargarAgenda();
  }

  private cargarConfigs(): void {
    this.citasService
      .getConfiguraciones()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (configs) => this.configs.set(configs),
      });
  }

  cargarAgenda(): void {
    this.cargando.set(true);
    this.citasService
      .getAgendaHoy(this.areaFiltro() || undefined)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (r) => {
          this.resumen.set(r);
          this.cargando.set(false);
        },
        error: () => {
          this.notif.error('Error al cargar la agenda de hoy');
          this.cargando.set(false);
        },
      });
  }

  onAreaChange(areaId: string): void {
    this.areaFiltro.set(areaId);
    this.cargarAgenda();
  }

  cambiarEstado(cita: CitaHoy, estado: EstadoCita): void {
    this.cambiandoEstado.set(cita._id);
    this.citasService
      .cambiarEstado(cita._id, { estado })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          // Actualiza localmente el estado sin recargar todo
          const r = this.resumen();
          if (r) {
            const citas = r.citas.map((c) =>
              c._id === cita._id ? { ...c, estado } : c,
            );
            this.resumen.set({ ...r, citas });
          }
          this.cambiandoEstado.set(null);
          this.notif.success(
            `Estado actualizado a "${ESTADO_CITA_LABELS[estado]}"`,
          );
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

  /** El backend puede devolver `area` como objeto poblado o como string (ObjectId) */
  getAreaNombre(config: ConfiguracionCitasArea): string {
    const area = config.area as any;
    const raw: string =
      typeof area === 'string'
        ? (config.modulo ?? area)
        : (area?.nombre ?? area?.name ?? config.modulo ?? '—');
    return raw.replace(/_/g, ' ');
  }

  getAreaId(config: ConfiguracionCitasArea): string {
    const area = config.area as any;
    return typeof area === 'string' ? area : (area?._id ?? '');
  }
}
