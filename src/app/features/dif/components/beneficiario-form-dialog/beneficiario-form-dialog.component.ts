import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Subject, debounceTime, distinctUntilChanged, takeUntil } from 'rxjs';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import {
  MatDialogModule,
  MatDialogRef,
  MAT_DIALOG_DATA,
} from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatIconModule } from '@angular/material/icon';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { SagimDialogComponent } from '../../../../shared/components/sagim-dialog/sagim-dialog.component';
import { CatalogosService } from '../../../../shared/services/catalogos.service';
import { CiudadanosService } from '../../../municipios/services/ciudadanos.service';
import { NotificationService } from '../../../../shared/services/notification.service';
import { BeneficiariosService } from '../../services/beneficiarios.service';
import { AuthService } from '../../../auth/services/auth.service';
import type { LocalidadCatalogo } from '../../../../shared/models/catalogo.model';
import type { Beneficiario } from '../../models/beneficiarios.model';
import type { CiudadanoResumen } from '../../../municipios/models/ciudadano.model';

export interface BeneficiarioFormData {
  beneficiario?: Beneficiario;
}

const GRUPOS_FIJOS = [
  { clave: 'ADULTO_MAYOR', label: 'Adulto Mayor' },
  { clave: 'DISCAPACIDAD', label: 'Discapacidad' },
  { clave: 'MUJER', label: 'Mujer' },
  { clave: 'MENOR', label: 'Menor' },
  { clave: 'INDIGENA', label: 'Indígena' },
  { clave: 'MIGRANTE', label: 'Migrante' },
];

@Component({
  selector: 'app-beneficiario-form-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatButtonToggleModule,
    MatIconModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatProgressSpinnerModule,
    MatTooltipModule,
    MatAutocompleteModule,
    SagimDialogComponent,
  ],
  templateUrl: './beneficiario-form-dialog.component.html',
  styleUrls: ['./beneficiario-form-dialog.component.scss'],
})
export class BeneficiarioFormDialogComponent implements OnInit, OnDestroy {
  private fb = inject(FormBuilder);
  private dialogRef = inject(MatDialogRef<BeneficiarioFormDialogComponent>);
  private dialogData: BeneficiarioFormData =
    inject(MAT_DIALOG_DATA, { optional: true } as any) ?? {};
  private catalogosService = inject(CatalogosService);
  private ciudadanosService = inject(CiudadanosService);
  private beneficiariosService = inject(BeneficiariosService);
  private notificationService = inject(NotificationService);
  private authService = inject(AuthService);
  private destroy$ = new Subject<void>();

  get isEdit(): boolean {
    return !!this.dialogData?.beneficiario;
  }
  get dialogTitle(): string {
    return this.isEdit ? 'Editar Beneficiario' : 'Registrar Beneficiario';
  }

  form: FormGroup = this.fb.group({
    curp: [
      '',
      [Validators.required, Validators.minLength(18), Validators.maxLength(18)],
    ],
    nombre: ['', [Validators.required]],
    apellidoPaterno: ['', [Validators.required]],
    apellidoMaterno: [''],
    fechaNacimiento: [null],
    sexo: [''],
    telefono: ['', [Validators.pattern(/^\d{10}$/)]],
    email: ['', [Validators.email]],
    localidad: [''],
    domicilio: [''],
    grupoVulnerable: [[], [Validators.required]],
    observaciones: [''],
  });

  isSubmitting = false;
  ciudadanosSugeridos: CiudadanoResumen[] = [];
  isSearchingCiudadanos = false;
  padronStatus:
    | 'idle'
    | 'searching'
    | 'already-registered'
    | 'padron-found'
    | 'not-found' = 'idle';
  registeredName = '';
  gruposOptions = GRUPOS_FIJOS;
  localidades: LocalidadCatalogo[] = [];
  isLoadingLocalidades = false;

  get showFields(): boolean {
    return (
      this.isEdit ||
      this.padronStatus === 'padron-found' ||
      this.padronStatus === 'not-found'
    );
  }

  private readonly PADRON_FIELDS = [
    'nombre',
    'apellidoPaterno',
    'apellidoMaterno',
    'telefono',
    'email',
    'localidad',
  ] as const;

  ngOnInit(): void {
    this.loadLocalidades();
    if (this.isEdit) {
      this.prefillForm(this.dialogData.beneficiario!);
    } else {
      this.form
        .get('curp')!
        .valueChanges.pipe(
          debounceTime(600),
          distinctUntilChanged(),
          takeUntil(this.destroy$),
        )
        .subscribe((curp: string) => {
          if (typeof curp !== 'string') return; // skip object values from autocomplete
          const val = curp.toUpperCase().trim();
          if (val.length === 18) {
            this.ciudadanosSugeridos = [];
            this.searchCurpInPadron(val);
          } else if (val.length >= 2) {
            this.buscarCiudadanosSugeridos(val);
            if (this.padronStatus !== 'idle') this.resetPadronState();
          } else {
            this.ciudadanosSugeridos = [];
            this.resetPadronState();
          }
        });
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private prefillForm(b: Beneficiario): void {
    let fechaNac: Date | null = null;
    if (b.fechaNacimiento) {
      const d = new Date(b.fechaNacimiento);
      if (!isNaN(d.getTime())) fechaNac = d;
    }

    // Defer one tick so all Material components finish initializing
    setTimeout(() => {
      this.form.patchValue({
        curp: b.curp ?? '',
        nombre: b.nombre ?? '',
        apellidoPaterno: b.apellidoPaterno ?? '',
        apellidoMaterno: b.apellidoMaterno ?? '',
        fechaNacimiento: fechaNac,
        sexo: b.sexo ?? '',
        telefono: b.telefono ?? '',
        email: b.email ?? '',
        localidad: b.localidad ?? '',
        domicilio: b.domicilio ?? '',
        grupoVulnerable: Array.isArray(b.grupoVulnerable)
          ? b.grupoVulnerable
          : [],
        observaciones: b.observaciones ?? '',
      });
    }, 0);
  }

  private buscarCiudadanosSugeridos(query: string): void {
    this.isSearchingCiudadanos = true;
    this.ciudadanosService.buscarCiudadanos(query).subscribe({
      next: (res) => {
        this.ciudadanosSugeridos = res ?? [];
        this.isSearchingCiudadanos = false;
      },
      error: () => {
        this.ciudadanosSugeridos = [];
        this.isSearchingCiudadanos = false;
      },
    });
  }

  onSeleccionarCiudadano(ciudadano: CiudadanoResumen): void {
    this.ciudadanosSugeridos = [];
    this.padronStatus = 'padron-found';
    this.form.patchValue(
      {
        curp: ciudadano.curp,
        nombre: ciudadano.nombre ?? '',
        apellidoPaterno: ciudadano.apellidoPaterno ?? '',
        apellidoMaterno: ciudadano.apellidoMaterno ?? '',
        telefono: ciudadano.telefono ?? '',
        email: ciudadano.email ?? '',
      },
      { emitEvent: false },
    );
    this.PADRON_FIELDS.forEach((f) => this.form.get(f)?.disable());
    // Also check if already a DIF beneficiario
    this.beneficiariosService
      .getBeneficiarioByCurp(ciudadano.curp)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (detalle) => {
          if (detalle?._id) {
            this.padronStatus = 'already-registered';
            this.registeredName = [
              detalle.nombre,
              detalle.apellidoPaterno,
              detalle.apellidoMaterno,
            ]
              .filter(Boolean)
              .join(' ');
            this.PADRON_FIELDS.forEach((f) => this.form.get(f)?.enable());
          }
        },
      });
  }

  displayCurp = (c: CiudadanoResumen | string): string => {
    if (!c || typeof c === 'string') return c ?? '';
    return c.curp;
  };

  private resetPadronState(): void {
    this.padronStatus = 'idle';
    this.registeredName = '';
    this.ciudadanosSugeridos = [];
    this.PADRON_FIELDS.forEach((f) => this.form.get(f)?.enable());
  }

  private searchCurpInPadron(curp: string): void {
    this.padronStatus = 'searching';
    // Step 1: check if already a beneficiario in DIF
    this.beneficiariosService
      .getBeneficiarioByCurp(curp)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (detalle) => {
          if (detalle?._id) {
            this.padronStatus = 'already-registered';
            this.registeredName = [
              detalle.nombre,
              detalle.apellidoPaterno,
              detalle.apellidoMaterno,
            ]
              .filter(Boolean)
              .join(' ');
          } else {
            this.checkPadron(curp);
          }
        },
        error: () => this.checkPadron(curp),
      });
  }

  private checkPadron(curp: string): void {
    this.ciudadanosService.getCiudadanoByCurp(curp).subscribe({
      next: (ciudadano) => {
        if (ciudadano?._id) {
          this.padronStatus = 'padron-found';
          this.form.patchValue({
            nombre: ciudadano.nombre ?? '',
            apellidoPaterno: ciudadano.apellidoPaterno ?? '',
            apellidoMaterno: ciudadano.apellidoMaterno ?? '',
            telefono: ciudadano.telefono ?? '',
            email: ciudadano.email ?? '',
            localidad: ciudadano.direccion?.localidad ?? '',
          });
          this.PADRON_FIELDS.forEach((f) => this.form.get(f)?.disable());
        } else {
          this.padronStatus = 'not-found';
          this.PADRON_FIELDS.forEach((f) => this.form.get(f)?.enable());
        }
      },
      error: () => {
        this.padronStatus = 'not-found';
        this.PADRON_FIELDS.forEach((f) => this.form.get(f)?.enable());
      },
    });
  }

  private loadLocalidades(): void {
    const municipioId = this.authService.getCurrentUser()?.municipioId;
    if (!municipioId) return;
    this.isLoadingLocalidades = true;
    this.form.get('localidad')?.disable();
    this.catalogosService.getLocalidadesPorMunicipio(municipioId).subscribe({
      next: (localidades) => {
        this.localidades = localidades;
        this.isLoadingLocalidades = false;
        this.form.get('localidad')?.enable();
      },
      error: () => {
        this.isLoadingLocalidades = false;
        this.form.get('localidad')?.enable();
      },
    });
  }

  isGrupoSelected(clave: string): boolean {
    return (this.form.get('grupoVulnerable')?.value ?? []).includes(clave);
  }

  toggleGrupo(clave: string): void {
    const current: string[] = this.form.get('grupoVulnerable')?.value ?? [];
    const updated = current.includes(clave)
      ? current.filter((g) => g !== clave)
      : [...current, clave];
    this.form.get('grupoVulnerable')?.setValue(updated);
    this.form.get('grupoVulnerable')?.markAsTouched();
  }

  onSubmit(): void {
    if (this.form.invalid || this.isSubmitting) {
      this.form.markAllAsTouched();
      return;
    }
    this.isSubmitting = true;
    const value = this.form.getRawValue();
    const payload = {
      ...value,
      curp: value.curp?.toUpperCase(),
      fechaNacimiento: value.fechaNacimiento
        ? this.formatDate(value.fechaNacimiento)
        : undefined,
    };

    const beneficiario = this.dialogData.beneficiario;
    const obs$ =
      this.isEdit && beneficiario
        ? this.beneficiariosService.updateBeneficiario(
            beneficiario._id,
            payload,
          )
        : this.beneficiariosService.createBeneficiario(payload);

    obs$.subscribe({
      next: (response) => {
        this.notificationService.success(
          this.isEdit
            ? 'Beneficiario actualizado exitosamente'
            : 'Beneficiario registrado exitosamente',
        );
        this.dialogRef.close(response);
      },
      error: (err: HttpErrorResponse) => {
        if (err.status === 409) {
          this.notificationService.error(
            'Este beneficiario ya está registrado en el DIF',
          );
        } else if (err.status === 400) {
          this.notificationService.error(
            'Datos inválidos. Revisa los campos e intenta de nuevo.',
          );
        } else {
          this.notificationService.error(
            this.isEdit
              ? 'Error al actualizar beneficiario'
              : 'Error al registrar beneficiario',
          );
        }
        this.isSubmitting = false;
      },
    });
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  private formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
}
