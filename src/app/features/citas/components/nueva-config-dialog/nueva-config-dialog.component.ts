import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormArray,
  FormGroup,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatChipsModule } from '@angular/material/chips';
import {
  MatAutocompleteModule,
  MatAutocompleteSelectedEvent,
} from '@angular/material/autocomplete';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { SagimDialogComponent } from '../../../../shared/components/sagim-dialog/sagim-dialog.component';
import { CitasService } from '../../services/citas.service';
import { TesoreriaService } from '../../../tesoreria/services/tesoreria.service';
import {
  AreaDisponible,
  CrearConfiguracionDto,
  DIAS_SEMANA,
  DiaSemana,
} from '../../models/citas.model';

export interface NuevaConfigDialogData {
  /* vacío — el dialog carga las áreas disponibles por sí mismo */
}

export type NuevaConfigDialogResult = CrearConfiguracionDto;

@Component({
  selector: 'app-nueva-config-dialog',
  standalone: true,
  templateUrl: './nueva-config-dialog.component.html',
  styleUrl: './nueva-config-dialog.component.scss',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    SagimDialogComponent,
    MatButtonModule,
    MatIconModule,
    MatListModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatSlideToggleModule,
    MatChipsModule,
    MatAutocompleteModule,
    MatProgressSpinnerModule,
  ],
})
export class NuevaConfigDialogComponent implements OnInit {
  private citasService = inject(CitasService);
  private tesoreriaService = inject(TesoreriaService);
  private dialogRef = inject(MatDialogRef<NuevaConfigDialogComponent>);
  private fb = inject(FormBuilder);

  readonly diasSemana = DIAS_SEMANA;
  readonly duracionOptions = [10, 15, 20, 30, 45, 60];

  paso = signal(1);
  cargando = signal(true);
  cargandoServicios = signal(false);
  error = signal<string | null>(null);
  areas = signal<AreaDisponible[]>([]);
  seleccionada = signal<AreaDisponible | null>(null);
  tramites = signal<string[]>([]);
  serviciosDisponibles = signal<string[]>([]);
  filtroTramite = signal('');

  serviciosFiltrados = computed(() => {
    const q = this.filtroTramite().toLowerCase().trim();
    const yaAgregados = new Set(this.tramites());
    return this.serviciosDisponibles().filter(
      (s) => !yaAgregados.has(s) && (!q || s.toLowerCase().includes(q)),
    );
  });

  dialogTitle = () => {
    const titles = [
      'Agregar área — Seleccionar',
      'Agregar área — Parámetros',
      'Agregar área — Horarios',
    ];
    return titles[this.paso() - 1];
  };
  submitLabel = () => (this.paso() < 3 ? 'Siguiente' : 'Crear área');
  cancelLabel = () => (this.paso() > 1 ? 'Atrás' : 'Cancelar');

  configForm = this.fb.group({
    duracionSlotMinutos: [30, [Validators.required, Validators.min(5)]],
    diasAnticipacionMinima: [0, [Validators.required, Validators.min(0)]],
    diasAnticipacionMaxima: [30, [Validators.required, Validators.min(1)]],
    instrucciones: [''],
  });

  horarioForm = this.fb.group({
    horarios: this.fb.group(this.buildHorariosGroup()),
  });

  ngOnInit(): void {
    this.citasService.getAreasDisponibles().subscribe({
      next: (areas) => {
        this.areas.set(areas);
        this.cargando.set(false);
      },
      error: () => {
        this.error.set('No se pudieron cargar las áreas disponibles.');
        this.cargando.set(false);
      },
    });
  }

  puedeAvanzar(): boolean {
    if (this.paso() === 1) return !!this.seleccionada();
    if (this.paso() === 2) return this.configForm.valid;
    return true;
  }

  onSubmit(): void {
    if (this.paso() === 1) {
      this.paso.set(2);
      this.cargarServicios();
      return;
    }
    if (this.paso() < 3) {
      this.paso.update((p) => p + 1);
      return;
    }
    this.confirmar();
  }

  onCancel(): void {
    if (this.paso() > 1) {
      this.paso.update((p) => p - 1);
      return;
    }
    this.dialogRef.close();
  }

  // ── Trámites ────────────────────────────────────────────────────────────
  addTramite(input: HTMLInputElement): void {
    const val = input.value.trim();
    if (!val) return;
    if (!this.tramites().includes(val))
      this.tramites.update((t) => [...t, val]);
    input.value = '';
    this.filtroTramite.set('');
  }

  onServicioSelected(
    event: MatAutocompleteSelectedEvent,
    input: HTMLInputElement,
  ): void {
    const val = event.option.value as string;
    if (!this.tramites().includes(val))
      this.tramites.update((t) => [...t, val]);
    input.value = '';
    this.filtroTramite.set('');
  }

  removeTramite(t: string): void {
    this.tramites.update((list) => list.filter((x) => x !== t));
  }

  // ── Servicios ─────────────────────────────────────────────────────────
  private cargarServicios(): void {
    const area = this.seleccionada();
    if (!area) return;
    this.cargandoServicios.set(true);
    this.tesoreriaService.getServicios({ categoria: area.modulo }).subscribe({
      next: (servicios) => {
        this.serviciosDisponibles.set(servicios.map((s) => s.nombre));
        this.cargandoServicios.set(false);
      },
      error: () => {
        this.cargandoServicios.set(false);
      },
    });
  }

  // ── Horarios ────────────────────────────────────────────────────────────
  private buildHorariosGroup(): Record<string, FormGroup> {
    const group: Record<string, FormGroup> = {};
    for (const dia of DIAS_SEMANA) {
      const esLaboral = !['sabado', 'domingo'].includes(dia.key);
      group[dia.key] = this.fb.group({
        activo: [esLaboral],
        bloques: this.fb.array(
          esLaboral
            ? [
                this.fb.group({
                  inicio: ['09:00', Validators.required],
                  fin: ['14:00', Validators.required],
                  capacidadPorSlot: [
                    1,
                    [Validators.required, Validators.min(1)],
                  ],
                }),
              ]
            : [],
        ),
      });
    }
    return group;
  }

  getBloquesCtrl(dia: DiaSemana): any[] {
    const arr = (this.horarioForm.get('horarios') as FormGroup)
      ?.get(dia)
      ?.get('bloques') as FormArray;
    return arr?.controls ?? [];
  }

  addBloque(dia: DiaSemana): void {
    const arr = (this.horarioForm.get('horarios') as FormGroup)
      ?.get(dia)
      ?.get('bloques') as FormArray;
    arr.push(
      this.fb.group({
        inicio: ['09:00', Validators.required],
        fin: ['14:00', Validators.required],
        capacidadPorSlot: [1, [Validators.required, Validators.min(1)]],
      }),
    );
  }

  removeBloque(dia: DiaSemana, index: number): void {
    const arr = (this.horarioForm.get('horarios') as FormGroup)
      ?.get(dia)
      ?.get('bloques') as FormArray;
    arr.removeAt(index);
  }

  private confirmar(): void {
    const cv = this.configForm.value;
    const horariosRaw = (this.horarioForm.get('horarios') as FormGroup)
      .value as Record<string, { activo: boolean; bloques: any[] }>;

    const result: NuevaConfigDialogResult = {
      area: this.seleccionada()!.area,
      modulo: this.seleccionada()!.modulo,
      duracionSlotMinutos: cv.duracionSlotMinutos!,
      diasAnticipacionMinima: cv.diasAnticipacionMinima!,
      diasAnticipacionMaxima: cv.diasAnticipacionMaxima!,
      instrucciones: cv.instrucciones ?? '',
      tramites: this.tramites(),
      horarios: DIAS_SEMANA.map((d) => ({
        dia: d.key,
        activo: horariosRaw[d.key]?.activo ?? false,
        bloques: horariosRaw[d.key]?.bloques ?? [],
      })),
    };
    this.dialogRef.close(result);
  }
}
