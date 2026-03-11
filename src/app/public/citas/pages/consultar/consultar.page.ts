import { Component, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDividerModule } from '@angular/material/divider';
import { PublicCitasService } from '../../services/public-citas.service';
import { MunicipioContextService } from '../../../municipios/municipio-context.service';
import { ConsultaCita } from '../../models/citas-publicas.models';

type Vista = 'formulario' | 'resultado' | 'cancelada';

const ESTADO_LABELS: Record<string, string> = {
  pendiente: 'Pendiente',
  confirmada: 'Confirmada',
  atendida: 'Atendida',
  cancelada: 'Cancelada',
  no_asistio: 'No asistió',
};

@Component({
  selector: 'app-consultar',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatDividerModule,
  ],
  templateUrl: './consultar.page.html',
  styleUrl: './consultar.page.scss',
})
export class ConsultarPage implements OnInit {
  private route = inject(ActivatedRoute);
  private fb = inject(FormBuilder);
  private citasService = inject(PublicCitasService);
  private destroyRef = inject(DestroyRef);
  private municipioContext = inject(MunicipioContextService);

  readonly slug = this.municipioContext.slug;
  vista = signal<Vista>('formulario');
  cargando = signal(false);
  cancelando = signal(false);
  error = signal<string | null>(null);
  errorCancelacion = signal<string | null>(null);
  cita = signal<ConsultaCita | null>(null);
  /** Cuando viene del email, guardamos el token para usarlo en cancelar */
  private _token = signal<string | null>(null);

  readonly estadoLabels = ESTADO_LABELS;

  /** Formulario manual: folio + CURP */
  form!: FormGroup;
  motivoForm!: FormGroup;
  mostrarMotivo = signal(false);

  ngOnInit() {
    this.form = this.fb.group({
      folio: ['', [Validators.required]],
      curp: [
        '',
        [
          Validators.required,
          Validators.minLength(18),
          Validators.maxLength(18),
        ],
      ],
    });

    this.motivoForm = this.fb.group({
      motivo: [''],
    });

    // Si vienen folio + token en la URL (link del correo) → consulta automática
    const qp = this.route.snapshot.queryParams;
    if (qp['folio'] && qp['token']) {
      this._token.set(qp['token']);
      this._consultarConAuth(qp['folio'], { token: qp['token'] });
    }
  }

  consultar() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const { folio, curp } = this.form.value;
    this._consultarConAuth(folio.trim(), { curp: curp.trim().toUpperCase() });
  }

  private _consultarConAuth(
    folio: string,
    auth: { token: string } | { curp: string },
  ) {
    this.cargando.set(true);
    this.error.set(null);

    this.citasService
      .consultarCita(this.slug(), folio, auth)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (cita) => {
          this.cita.set(cita);
          this.cargando.set(false);
          this.vista.set('resultado');
        },
        error: (err) => {
          this.cargando.set(false);
          if (err.status === 404) {
            this.error.set(
              'No se encontró ninguna cita con ese folio y CURP. Verifica los datos.',
            );
          } else {
            this.error.set('Error al consultar la cita. Intenta nuevamente.');
          }
        },
      });
  }

  cancelar() {
    const folio = this.cita()!.folio;
    const token = this._token();
    const curp = this.form.value.curp as string | undefined;
    const auth: { token: string } | { curp: string } = token
      ? { token }
      : { curp: (curp ?? '').trim().toUpperCase() };
    const motivo = this.motivoForm.value.motivo || undefined;
    this.cancelando.set(true);
    this.errorCancelacion.set(null);

    this.citasService
      .cancelarCita(this.slug(), folio, auth, motivo)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.cancelando.set(false);
          this.vista.set('cancelada');
        },
        error: (err) => {
          this.cancelando.set(false);
          this.errorCancelacion.set(
            err?.error?.message ??
              'No fue posible cancelar la cita. Intenta de nuevo.',
          );
        },
      });
  }

  volver() {
    this.vista.set('formulario');
    this.cita.set(null);
    this.error.set(null);
    this.mostrarMotivo.set(false);
    this.errorCancelacion.set(null);
  }

  getEstadoLabel(estado: string): string {
    return ESTADO_LABELS[estado] ?? estado;
  }
}
