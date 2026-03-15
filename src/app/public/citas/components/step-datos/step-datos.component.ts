import {
  Component,
  DestroyRef,
  EventEmitter,
  inject,
  Input,
  OnInit,
  Output,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
  AbstractControl,
  ValidationErrors,
} from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ActionButtonComponent } from '../../../../shared/components/action-button/action-button.component';
import {
  debounceTime,
  distinctUntilChanged,
  filter,
  switchMap,
} from 'rxjs/operators';
import { PublicCitasService } from '../../services/public-citas.service';

export interface DatosCiudadano {
  curp: string;
  nombreCompleto: string;
  telefono: string;
  correo?: string;
  notasCiudadano?: string;
}

// Validador de formato CURP
function curpValidator(control: AbstractControl): ValidationErrors | null {
  if (!control.value) return null;
  const CURP_REGEX =
    /^[A-Z]{4}\d{6}[HM][A-Z]{2}[B-DF-HJ-NP-TV-Z]{3}[A-Z0-9]\d$/;
  return CURP_REGEX.test(control.value.toUpperCase())
    ? null
    : { curpInvalida: true };
}

@Component({
  selector: 'app-step-datos',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    ActionButtonComponent,
  ],
  templateUrl: './step-datos.component.html',
  styleUrl: './step-datos.component.scss',
})
export class StepDatosComponent implements OnInit {
  private fb = inject(FormBuilder);
  private citasService = inject(PublicCitasService);
  private destroyRef = inject(DestroyRef);

  @Input({ required: true }) slug!: string;
  @Input() area: string | null = null;
  @Input() tramite: string | null = null;
  @Input() fecha: string | null = null;
  @Input() horario: string | null = null;
  @Output() confirmado = new EventEmitter<DatosCiudadano>();
  @Output() atras = new EventEmitter<void>();

  cargandoCurp = signal(false);
  enviando = signal(false);
  errorEnvio = signal<string | null>(null);

  form!: FormGroup;

  ngOnInit() {
    this.form = this.fb.group({
      curp: ['', [Validators.required, curpValidator]],
      nombreCompleto: ['', [Validators.required, Validators.minLength(5)]],
      telefono: ['', [Validators.required, Validators.pattern(/^\d{10}$/)]],
      correo: ['', [Validators.email]],
      notasCiudadano: [''],
    });

    // Auto-completar desde CURP válida
    this.form
      .get('curp')!
      .valueChanges.pipe(
        debounceTime(600),
        distinctUntilChanged(),
        filter((v) => {
          const ctrl = this.form.get('curp')!;
          return ctrl.valid && v?.length === 18;
        }),
        switchMap((curp: string) => {
          this.cargandoCurp.set(true);
          return this.citasService
            .getCiudadanoPorCurp(curp.toUpperCase())
            .pipe(takeUntilDestroyed(this.destroyRef));
        }),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: (ciudadano) => {
          this.cargandoCurp.set(false);
          if (ciudadano.nombreCompleto) {
            this.form.patchValue({
              nombreCompleto: ciudadano.nombreCompleto,
              telefono: ciudadano.telefono ?? '',
              correo: ciudadano.correo ?? '',
            });
          }
        },
        error: () => {
          // No se encontró CURP — limpiar campos para que el usuario los llene
          this.cargandoCurp.set(false);
        },
      });
  }

  onCurpBlur() {
    const ctrl = this.form.get('curp')!;
    if (ctrl.value) {
      ctrl.setValue(ctrl.value.toUpperCase(), { emitEvent: false });
    }
  }

  enviar() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const val = this.form.value;
    this.confirmado.emit({
      curp: val.curp.toUpperCase(),
      nombreCompleto: val.nombreCompleto.trim().toUpperCase(),
      telefono: val.telefono,
      correo: val.correo || undefined,
      notasCiudadano: val.notasCiudadano || undefined,
    });
  }

  getError(field: string): string {
    const ctrl = this.form.get(field);
    if (!ctrl || !ctrl.touched || ctrl.valid) return '';
    if (ctrl.hasError('required')) return 'Este campo es obligatorio';
    if (ctrl.hasError('curpInvalida'))
      return 'Formato de CURP inválido (ej: ABCD900101HVZXXX00)';
    if (ctrl.hasError('minlength')) return 'Nombre demasiado corto';
    if (ctrl.hasError('pattern')) return 'Debe ser un número de 10 dígitos';
    if (ctrl.hasError('email')) return 'Correo inválido';
    return '';
  }
}
