import {
  Component,
  DestroyRef,
  inject,
  signal,
  ViewChild,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CommonModule } from '@angular/common';
import { MatStepperModule, MatStepper } from '@angular/material/stepper';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { PublicCitasService } from '../../services/public-citas.service';
import { MunicipioContextService } from '../../../municipios/municipio-context.service';
import {
  AreaCitas,
  RespuestaCitaCreada,
} from '../../models/citas-publicas.models';

import {
  StepAreaComponent,
  SeleccionArea,
} from '../../components/step-area/step-area.component';
import {
  StepCalendarioComponent,
  SeleccionFechaHorario,
} from '../../components/step-calendario/step-calendario.component';
import {
  StepDatosComponent,
  DatosCiudadano,
} from '../../components/step-datos/step-datos.component';
import { StepConfirmacionComponent } from '../../components/step-confirmacion/step-confirmacion.component';

@Component({
  selector: 'app-agendar',
  standalone: true,
  imports: [
    CommonModule,
    MatStepperModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    StepAreaComponent,
    StepCalendarioComponent,
    StepDatosComponent,
    StepConfirmacionComponent,
  ],
  templateUrl: './agendar.page.html',
  styleUrl: './agendar.page.scss',
})
export class AgendarPage {
  private citasService = inject(PublicCitasService);
  private destroyRef = inject(DestroyRef);
  private municipioContext = inject(MunicipioContextService);

  @ViewChild('stepper') stepper!: MatStepper;

  readonly slug = this.municipioContext.slug;

  // Seleciones acumuladas por paso
  areaSeleccionada = signal<AreaCitas | null>(null);
  tramiteSeleccionado = signal<string | null>(null);
  fechaSeleccionada = signal<string | null>(null);
  horarioSeleccionado = signal<string | null>(null);
  datosCiudadano = signal<DatosCiudadano | null>(null);

  // Paso 4 — resultado exitoso
  citaCreada = signal<RespuestaCitaCreada | null>(null);

  // Estado de envío
  enviando = signal(false);
  errorEnvio = signal<string | null>(null);

  // ── Paso 1 → 2 ──────────────────────────────────────────────────────────
  onAreaSeleccionada({ area, tramite }: SeleccionArea) {
    this.areaSeleccionada.set(area);
    this.tramiteSeleccionado.set(tramite);
    this.stepper.steps.get(0)!.completed = true;
    this.stepper.next();
  }

  // ── Paso 2 → 3 ──────────────────────────────────────────────────────────
  onFechaHorarioSeleccionado({ fecha, horario }: SeleccionFechaHorario) {
    this.fechaSeleccionada.set(fecha);
    this.horarioSeleccionado.set(horario);
    this.stepper.steps.get(1)!.completed = true;
    this.stepper.next();
  }

  // ── Paso 3 → confirmar → 4 ──────────────────────────────────────────────
  onDatosConfirmados(datos: DatosCiudadano) {
    // Guard: si ya se creó la cita (el usuario volvió al paso 3), no reenviar
    if (this.citaCreada()) {
      this.stepper.next();
      return;
    }
    this.datosCiudadano.set(datos);
    this.enviarCita(datos);
  }

  private enviarCita(datos: DatosCiudadano) {
    const area = this.areaSeleccionada();
    const tramite = this.tramiteSeleccionado();
    const fecha = this.fechaSeleccionada();
    const horario = this.horarioSeleccionado();

    if (!area || !tramite || !fecha || !horario) return;

    this.enviando.set(true);
    this.errorEnvio.set(null);

    this.citasService
      .crearCita({
        area: area.area,
        tramite,
        fechaCita: fecha,
        horario,
        curp: datos.curp,
        nombreCompleto: datos.nombreCompleto,
        telefono: datos.telefono,
        correo: datos.correo,
        notasCiudadano: datos.notasCiudadano,
      })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (cita) => {
          this.enviando.set(false);
          this.citaCreada.set(cita);
          this.stepper.steps.get(2)!.completed = true;
          this.stepper.next();
        },
        error: (err) => {
          this.enviando.set(false);
          const msg = err?.error?.message;
          if (err.status === 409) {
            this.errorEnvio.set(
              msg ??
                'El horario ya no está disponible o ya tienes una cita activa en esta área.',
            );
          } else if (err.status === 400) {
            this.errorEnvio.set(
              msg ?? 'La fecha está fuera del rango permitido.',
            );
          } else {
            this.errorEnvio.set(
              'Ocurrió un error al agendar tu cita. Intenta nuevamente.',
            );
          }
        },
      });
  }

  // ── Reiniciar para nueva cita ────────────────────────────────────────────
  reiniciar() {
    this.areaSeleccionada.set(null);
    this.tramiteSeleccionado.set(null);
    this.fechaSeleccionada.set(null);
    this.horarioSeleccionado.set(null);
    this.datosCiudadano.set(null);
    this.citaCreada.set(null);
    this.errorEnvio.set(null);
    this.stepper.reset();
  }
}
