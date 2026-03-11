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
import {
  FormBuilder,
  FormGroup,
  FormArray,
  Validators,
  ReactiveFormsModule,
  AbstractControl,
} from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDividerModule } from '@angular/material/divider';
import { MatChipsModule } from '@angular/material/chips';
import {
  MatAutocompleteModule,
  MatAutocompleteSelectedEvent,
} from '@angular/material/autocomplete';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDialog } from '@angular/material/dialog';
import { CitasService } from '../../services/citas.service';
import { TesoreriaService } from '../../../tesoreria/services/tesoreria.service';
import { NotificationService } from '../../../../shared/services/notification.service';
import {
  ConfiguracionCitasArea,
  BloqueoFecha,
  UpsertConfigDto,
  CrearBloqueoDto,
  DIAS_SEMANA,
  DiaSemana,
  HorariosConfig,
} from '../../models/citas.model';
import {
  NuevaConfigDialogComponent,
  NuevaConfigDialogResult,
} from '../../components/nueva-config-dialog/nueva-config-dialog.component';
import { ActionButtonComponent } from '../../../../shared/components/action-button/action-button.component';

@Component({
  selector: 'app-configuracion-citas',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatSlideToggleModule,
    MatProgressBarModule,
    MatExpansionModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatTooltipModule,
    MatDividerModule,
    MatChipsModule,
    MatAutocompleteModule,
    MatProgressSpinnerModule,
    ActionButtonComponent,
  ],
  templateUrl: './configuracion.page.html',
  styleUrl: './configuracion.page.scss',
})
export class ConfiguracionPage implements OnInit {
  private citasService = inject(CitasService);
  private tesoreriaService = inject(TesoreriaService);
  private notif = inject(NotificationService);
  private fb = inject(FormBuilder);
  private destroyRef = inject(DestroyRef);
  private dialog = inject(MatDialog);

  cargando = signal(false);
  guardando = signal<string | null>(null); // _id de config guardando
  togglando = signal<string | null>(null);
  configs = signal<ConfiguracionCitasArea[]>([]);
  bloqueos = signal<BloqueoFecha[]>([]);
  guardandoBloqueo = signal(false);
  eliminandoBloqueo = signal<string | null>(null);
  areaSeleccionada = signal<ConfiguracionCitasArea | null>(null);

  readonly diasSemana = DIAS_SEMANA;
  readonly duracionOptions = [10, 15, 20, 30, 45, 60];
  bloqueosFiltrados = computed(() => {
    const area = this.areaSeleccionada();
    const all = this.bloqueos();
    if (!area) return all;
    return all.filter((b) => !b.area || b.area === area._id);
  });

  editForms = new Map<string, FormGroup>();
  tramitesPorConfig = new Map<string, string[]>();
  serviciosPorConfig = new Map<string, string[]>();
  cargandoServicios = signal(false);
  filtroTramiteEdit = signal('');

  serviciosFiltradosEdit = computed(() => {
    const id = this.areaSeleccionada()?._id;
    if (!id) return [];
    const q = this.filtroTramiteEdit().toLowerCase().trim();
    const yaAgregados = new Set(this.getTramites(id));
    return (this.serviciosPorConfig.get(id) ?? []).filter(
      (s) => !yaAgregados.has(s) && (!q || s.toLowerCase().includes(q)),
    );
  });

  getTramites(id: string): string[] {
    return this.tramitesPorConfig.get(id) ?? [];
  }

  addTramite(id: string, input: HTMLInputElement): void {
    const val = input.value.trim();
    if (!val) return;
    const list = this.getTramites(id);
    if (!list.includes(val)) {
      this.tramitesPorConfig.set(id, [...list, val]);
    }
    input.value = '';
    this.filtroTramiteEdit.set('');
  }

  onServicioEditSelected(
    event: MatAutocompleteSelectedEvent,
    input: HTMLInputElement,
  ): void {
    const id = this.areaSeleccionada()!._id;
    const val = event.option.value as string;
    const list = this.getTramites(id);
    if (!list.includes(val)) this.tramitesPorConfig.set(id, [...list, val]);
    input.value = '';
    this.filtroTramiteEdit.set('');
  }

  removeTramite(id: string, tramite: string): void {
    this.tramitesPorConfig.set(
      id,
      this.getTramites(id).filter((t) => t !== tramite),
    );
  }

  bloqueoForm = this.fb.group({
    fechaInicio: [null as Date | null, Validators.required],
    fechaFin: [null as Date | null, Validators.required],
    motivo: ['', [Validators.required, Validators.minLength(3)]],
  });

  ngOnInit(): void {
    this.cargar();
  }

  cargar(): void {
    this.cargando.set(true);
    this.citasService
      .getConfiguraciones()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (configs) => {
          this.configs.set(configs);
          configs.forEach((c) => this.buildForm(c));
          this.cargando.set(false);
        },
        error: () => {
          this.notif.error('Error al cargar configuraciones');
          this.cargando.set(false);
        },
      });

    this.citasService
      .getBloqueos()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({ next: (b) => this.bloqueos.set(b) });
  }

  private buildForm(config: ConfiguracionCitasArea): void {
    const horarioGroup: Record<string, FormGroup> = {};
    for (const dia of DIAS_SEMANA) {
      const h = config.horarios.find((h) => h.dia === dia.key) ?? {
        dia: dia.key,
        activo: false,
        bloques: [],
      };
      const bloquesArray = this.fb.array(
        h.bloques.map((b) =>
          this.fb.group({
            inicio: [b.inicio, Validators.required],
            fin: [b.fin, Validators.required],
            capacidadPorSlot: [
              b.capacidadPorSlot,
              [Validators.required, Validators.min(1)],
            ],
          }),
        ),
      );
      horarioGroup[dia.key] = this.fb.group({
        activo: [h.activo],
        bloques: bloquesArray,
      });
    }

    const form = this.fb.group({
      activo: [config.activo],
      diasAnticipacionMinima: [
        config.diasAnticipacionMinima ?? 0,
        [Validators.required, Validators.min(0), Validators.max(365)],
      ],
      diasAnticipacionMaxima: [
        config.diasAnticipacionMaxima ?? 30,
        [Validators.required, Validators.min(1), Validators.max(365)],
      ],
      duracionSlotMinutos: [
        config.duracionSlotMinutos ?? 30,
        [Validators.required, Validators.min(5)],
      ],
      tramitesInput: [''],
      instrucciones: [config.instrucciones ?? ''],
      horarios: this.fb.group(horarioGroup),
    });

    this.editForms.set(config._id, form);
    this.tramitesPorConfig.set(config._id, [...(config.tramites ?? [])]);
  }

  getForm(id: string): FormGroup {
    return this.editForms.get(id) ?? this.fb.group({});
  }

  /** El backend puede devolver `area` como objeto poblado o como string (ObjectId sin populate) */
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
    if (typeof area === 'string') return area;
    return area?._id ?? '';
  }

  getDiaGroup(form: FormGroup, dia: DiaSemana): FormGroup {
    return (form.get('horarios') as FormGroup)?.get(dia) as FormGroup;
  }

  getBloquesArray(form: FormGroup, dia: DiaSemana): FormArray {
    return this.getDiaGroup(form, dia)?.get('bloques') as FormArray;
  }

  getBloques(form: FormGroup, dia: DiaSemana): AbstractControl[] {
    return this.getBloquesArray(form, dia)?.controls ?? [];
  }

  addBloque(form: FormGroup, dia: DiaSemana): void {
    this.getBloquesArray(form, dia).push(
      this.fb.group({
        inicio: ['08:00', Validators.required],
        fin: ['14:00', Validators.required],
        capacidadPorSlot: [1, [Validators.required, Validators.min(1)]],
      }),
    );
  }

  removeBloque(form: FormGroup, dia: DiaSemana, index: number): void {
    this.getBloquesArray(form, dia).removeAt(index);
  }

  guardar(config: ConfiguracionCitasArea): void {
    const form = this.getForm(config._id);
    if (form.invalid) {
      form.markAllAsTouched();
      return;
    }
    this.guardando.set(config._id);
    const v = form.value;
    const horariosRaw = v.horarios as Record<
      string,
      { activo: boolean; bloques: any[] }
    >;
    const horarios: HorariosConfig = DIAS_SEMANA.map((d) => ({
      dia: d.key,
      activo: horariosRaw[d.key]?.activo ?? false,
      bloques: horariosRaw[d.key]?.bloques ?? [],
    }));
    const dto: UpsertConfigDto = {
      activo: v.activo,
      diasAnticipacionMinima: v.diasAnticipacionMinima,
      diasAnticipacionMaxima: v.diasAnticipacionMaxima,
      duracionSlotMinutos: v.duracionSlotMinutos,
      instrucciones: v.instrucciones,
      tramites: this.tramitesPorConfig.get(config._id) ?? [],
      horarios,
    };
    this.citasService
      .upsertConfiguracion(this.getAreaId(config), dto)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (updated) => {
          this.configs.update((list) =>
            list.map((c) => (c._id === config._id ? updated : c)),
          );
          if (this.areaSeleccionada()?._id === config._id) {
            this.areaSeleccionada.set(updated);
          }
          this.guardando.set(null);
          this.notif.success('Configuración guardada');
        },
        error: () => {
          this.guardando.set(null);
          this.notif.error('Error al guardar configuración');
        },
      });
  }

  toggleActivo(config: ConfiguracionCitasArea): void {
    this.togglando.set(config._id);
    this.citasService
      .toggleConfiguracion(this.getAreaId(config))
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (updated) => {
          this.configs.update((list) =>
            list.map((c) => (c._id === config._id ? updated : c)),
          );
          this.togglando.set(null);
          this.notif.success(
            `Agenda ${updated.activo ? 'activada' : 'desactivada'}`,
          );
        },
        error: () => {
          this.togglando.set(null);
          this.notif.error('No se pudo cambiar el estado');
        },
      });
  }

  seleccionarArea(config: ConfiguracionCitasArea): void {
    this.areaSeleccionada.set(config);
    this.filtroTramiteEdit.set('');
    if (!this.serviciosPorConfig.has(config._id)) {
      this.cargandoServicios.set(true);
      const modulo = (config.area as any)?.modulo ?? config.modulo ?? '';
      this.tesoreriaService.getServicios({ categoria: modulo }).subscribe({
        next: (servicios) => {
          this.serviciosPorConfig.set(
            config._id,
            servicios.map((s) => s.nombre),
          );
          this.cargandoServicios.set(false);
        },
        error: () => this.cargandoServicios.set(false),
      });
    }
  }

  agregarArea(): void {
    const ref = this.dialog.open<
      NuevaConfigDialogComponent,
      object,
      NuevaConfigDialogResult
    >(NuevaConfigDialogComponent, {
      data: {},
      width: '640px',
      maxHeight: '90vh',
      panelClass: 'sagim-dialog-panel',
    });

    ref.afterClosed().subscribe((result) => {
      if (!result) return;
      this.citasService
        .crearConfiguracion(result)
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe({
          next: (nueva) => {
            this.configs.update((list) => [...list, nueva]);
            this.buildForm(nueva);
            this.areaSeleccionada.set(nueva);
            this.notif.success(`Área "${this.getAreaNombre(nueva)}" agregada`);
          },
          error: () => this.notif.error('No se pudo agregar el área'),
        });
    });
  }

  crearBloqueo(): void {
    if (this.bloqueoForm.invalid) {
      this.bloqueoForm.markAllAsTouched();
      return;
    }
    this.guardandoBloqueo.set(true);
    const v = this.bloqueoForm.value;
    const dto: CrearBloqueoDto = {
      fechaInicio: this.toIso(v.fechaInicio!),
      fechaFin: this.toIso(v.fechaFin!),
      motivo: v.motivo!,
      areaId: this.areaSeleccionada()?._id,
    };
    this.citasService
      .crearBloqueo(dto)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (b) => {
          this.bloqueos.update((list) => [...list, b]);
          this.bloqueoForm.reset();
          this.guardandoBloqueo.set(false);
          this.notif.success('Bloqueo creado');
        },
        error: () => {
          this.guardandoBloqueo.set(false);
          this.notif.error('Error al crear bloqueo');
        },
      });
  }

  eliminarBloqueo(id: string): void {
    this.eliminandoBloqueo.set(id);
    this.citasService
      .eliminarBloqueo(id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.bloqueos.update((list) => list.filter((b) => b._id !== id));
          this.eliminandoBloqueo.set(null);
          this.notif.success('Bloqueo eliminado');
        },
        error: () => {
          this.eliminandoBloqueo.set(null);
          this.notif.error('Error al eliminar bloqueo');
        },
      });
  }

  asFormGroup(ctrl: AbstractControl): FormGroup {
    return ctrl as FormGroup;
  }

  private toIso(d: Date): string {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  }
}
