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
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatChipsModule } from '@angular/material/chips';
import { MatMenuModule } from '@angular/material/menu';
import { CitasService } from '../../services/citas.service';
import { NotificationService } from '../../../../shared/services/notification.service';
import { WebSocketService } from '../../../../core/services/websocket.service';
import {
  Cita,
  EstadoCita,
  ESTADO_CITA_LABELS,
  ConfiguracionCitasArea,
} from '../../models/citas.model';
import { ActionButtonComponent } from '../../../../shared/components/action-button/action-button.component';

export interface DiaCalendario {
  fecha: Date;
  esDelMes: boolean;
  esHoy: boolean;
  citas: Cita[];
}

@Component({
  selector: 'app-calendario-citas',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatProgressBarModule,
    MatTooltipModule,
    MatSelectModule,
    MatFormFieldModule,
    MatChipsModule,
    MatMenuModule,
    ActionButtonComponent,
  ],
  templateUrl: './calendario.page.html',
  styleUrl: './calendario.page.scss',
})
export class CalendarioPage implements OnInit, OnDestroy {
  private citasService = inject(CitasService);
  private notif = inject(NotificationService);
  private destroyRef = inject(DestroyRef);
  private ws = inject(WebSocketService);

  cargando = signal(false);
  citas = signal<Cita[]>([]);
  configs = signal<ConfiguracionCitasArea[]>([]);
  areaFiltro = signal<string>('');
  fechaVista = signal(new Date());
  diaSeleccionado = signal<Date | null>(null);

  readonly diasSemana = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];
  readonly estadoLabels = ESTADO_CITA_LABELS;
  readonly estadosAccion: EstadoCita[] = [
    'confirmada',
    'atendida',
    'no_se_presento',
    'cancelada',
  ];
  cambiandoEstado = signal<string | null>(null);

  mesLabel = computed(() => {
    const f = this.fechaVista();
    return f.toLocaleDateString('es-MX', { month: 'long', year: 'numeric' });
  });

  calendarioDias = computed<DiaCalendario[]>(() => {
    const fecha = this.fechaVista();
    const anio = fecha.getFullYear();
    const mes = fecha.getMonth();
    const hoy = new Date();
    const citasDelMes = this.citas();

    const primerDia = new Date(anio, mes, 1);
    // lunes=0 ... domingo=6
    let offset = primerDia.getDay() - 1;
    if (offset < 0) offset = 6;

    const diasMes = new Date(anio, mes + 1, 0).getDate();
    const dias: DiaCalendario[] = [];

    // Días del mes anterior para rellenar la primera semana
    for (let i = offset - 1; i >= 0; i--) {
      const d = new Date(anio, mes, -i);
      dias.push({ fecha: d, esDelMes: false, esHoy: false, citas: [] });
    }

    // Días del mes actual
    for (let d = 1; d <= diasMes; d++) {
      const fecha = new Date(anio, mes, d);
      const isoFecha = this.toIso(fecha);
      const citasDia = citasDelMes.filter((c) => c.fecha === isoFecha);
      const esHoy =
        fecha.getFullYear() === hoy.getFullYear() &&
        fecha.getMonth() === hoy.getMonth() &&
        fecha.getDate() === hoy.getDate();
      dias.push({ fecha, esDelMes: true, esHoy, citas: citasDia });
    }

    // Completar hasta múltiplo de 7
    while (dias.length % 7 !== 0) {
      const last = dias[dias.length - 1].fecha;
      const next = new Date(last);
      next.setDate(next.getDate() + 1);
      dias.push({ fecha: next, esDelMes: false, esHoy: false, citas: [] });
    }

    return dias;
  });

  citasDiaSeleccionado = computed<Cita[]>(() => {
    const dia = this.diaSeleccionado();
    if (!dia) return [];
    const iso = this.toIso(dia);
    return this.citas()
      .filter((c) => c.fecha === iso)
      .sort((a, b) => a.hora.localeCompare(b.hora));
  });

  ngOnInit(): void {
    this.cargarConfigs();
    this.cargar();
    this._suscribirSocket();
  }

  ngOnDestroy(): void {
    // Salir del room del área si había uno activo
    const area = this.areaFiltro();
    if (area) this.ws.leaveArea(area);
  }

  private _suscribirSocket(): void {
    // Unirse al room del área actual (vacío = todas las áreas del municipio)
    const area = this.areaFiltro();
    if (area) this.ws.joinArea(area);

    this.ws.nuevaCitaAgendada$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((evento) => {
        const f = this.fechaVista();
        const mesActual = `${f.getFullYear()}-${String(f.getMonth() + 1).padStart(2, '0')}`;
        const esMismoMes = evento.fechaCita?.startsWith(mesActual);
        const filtroArea = this.areaFiltro();
        const esAreaFiltrada = !filtroArea || evento.area === filtroArea;
        if (esMismoMes && esAreaFiltrada) {
          // Añadir si no existe ya
          this.citas.update((arr) =>
            arr.some((c) => c._id === evento._id)
              ? arr
              : [...arr, this._mapSocketCita(evento)],
          );
        }
      });

    this.ws.citaCancelada$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((evento) => {
        this.citas.update((arr) =>
          arr.map((c) =>
            c._id === evento._id
              ? { ...c, estado: 'cancelada' as EstadoCita }
              : c,
          ),
        );
      });
  }

  /** Convierte el payload del socket al modelo Cita del frontend */
  private _mapSocketCita(
    e: ReturnType<typeof this.ws.nuevaCitaAgendada$.pipe> extends never
      ? never
      : any,
  ): Cita {
    return {
      _id: e._id,
      area: { _id: e.area, nombre: e.area },
      tramite: e.tramite,
      fecha: (e.fechaCita ?? '').substring(0, 10),
      hora: e.horario ?? '',
      estado: e.estado ?? 'pendiente',
      ciudadano: {
        _id: '',
        nombre: e.ciudadano?.nombreCompleto ?? '',
        curp: e.ciudadano?.curp ?? '',
      },
    } as unknown as Cita;
  }

  private cargarConfigs(): void {
    this.citasService
      .getConfiguraciones()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({ next: (c) => this.configs.set(c) });
  }

  cargar(): void {
    this.cargando.set(true);
    const f = this.fechaVista();
    this.citasService
      .getCitasMes(
        f.getFullYear(),
        f.getMonth() + 1,
        this.areaFiltro() || undefined,
      )
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (r) => {
          this.citas.set(r.data);
          this.cargando.set(false);
        },
        error: () => {
          this.notif.error('Error al cargar el calendario');
          this.cargando.set(false);
        },
      });
  }

  mesAnterior(): void {
    const f = this.fechaVista();
    this.fechaVista.set(new Date(f.getFullYear(), f.getMonth() - 1, 1));
    this.diaSeleccionado.set(null);
    this.cargar();
  }

  mesSiguiente(): void {
    const f = this.fechaVista();
    this.fechaVista.set(new Date(f.getFullYear(), f.getMonth() + 1, 1));
    this.diaSeleccionado.set(null);
    this.cargar();
  }

  irHoy(): void {
    this.fechaVista.set(new Date());
    this.diaSeleccionado.set(new Date());
    this.cargar();
  }

  seleccionarDia(dia: DiaCalendario): void {
    if (!dia.esDelMes) return;
    this.diaSeleccionado.set(dia.fecha);
  }

  esDiaSeleccionado(dia: DiaCalendario): boolean {
    const sel = this.diaSeleccionado();
    if (!sel || !dia.esDelMes) return false;
    return this.toIso(dia.fecha) === this.toIso(sel);
  }

  onAreaChange(areaId: string): void {
    this.areaFiltro.set(areaId);
    this.cargar();
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  abrirDetalle(_cita: Cita): void {
    // Detail panel shown inline — no dialog needed
  }

  cambiarEstado(cita: Cita, estado: EstadoCita): void {
    this.cambiandoEstado.set(cita._id);
    this.citasService
      .cambiarEstado(cita._id, { estado })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (actualizada) => {
          this.citas.update((arr) =>
            arr.map((c) => (c._id === actualizada._id ? actualizada : c)),
          );
          this.cambiandoEstado.set(null);
          this.notif.success('Estado actualizado');
        },
        error: () => {
          this.notif.error('Error al cambiar estado');
          this.cambiandoEstado.set(null);
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
    return map[estado] ?? '';
  }

  diaLabel(fecha: Date): string {
    return fecha.toLocaleDateString('es-MX', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
    });
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

  private toIso(d: Date): string {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  }
}
