import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import {
  MAT_DIALOG_DATA,
  MatDialogModule,
  MatDialogRef,
} from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { Subject, debounceTime, distinctUntilChanged, takeUntil } from 'rxjs';
import { CiudadanosService } from '../../services/ciudadanos.service';
import { NotificationService } from '../../../../shared/services/notification.service';
import { SagimDialogComponent } from '../../../../shared/components/sagim-dialog/sagim-dialog.component';
import { CatalogosService } from '../../../../shared/services/catalogos.service';
import { AuthService } from '../../../auth/services/auth.service';
import type { Ciudadano } from '../../models/ciudadano.model';
import type { LocalidadCatalogo } from '../../../../shared/models/catalogo.model';

export interface CiudadanoFormDialogData {
  ciudadano?: Ciudadano;
}

@Component({
  selector: 'app-ciudadano-form-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatTooltipModule,
    MatProgressSpinnerModule,
    SagimDialogComponent,
  ],
  templateUrl: './ciudadano-form-dialog.component.html',
  styleUrl: './ciudadano-form-dialog.component.scss',
})
export class CiudadanoFormDialogComponent implements OnInit, OnDestroy {
  private fb = inject(FormBuilder);
  private dialogRef = inject(MatDialogRef<CiudadanoFormDialogComponent>);
  data: CiudadanoFormDialogData = inject(MAT_DIALOG_DATA);
  private ciudadanosService = inject(CiudadanosService);
  private notificationService = inject(NotificationService);
  private catalogosService = inject(CatalogosService);
  private authService = inject(AuthService);
  private destroy$ = new Subject<void>();

  guardando = false;
  curpStatus: 'idle' | 'searching' | 'found' | 'not-found' = 'idle';
  registeredName = '';
  localidades: LocalidadCatalogo[] = [];
  isLoadingLocalidades = false;

  get esEdicion(): boolean {
    return !!this.data?.ciudadano;
  }

  get showFields(): boolean {
    return this.esEdicion || this.curpStatus === 'not-found';
  }

  form: FormGroup = this.fb.group({
    curp: [
      '',
      [
        Validators.required,
        Validators.minLength(18),
        Validators.maxLength(18),
        Validators.pattern(/^[A-Z0-9]{18}$/),
      ],
    ],
    nombre: ['', [Validators.required]],
    apellidoPaterno: ['', [Validators.required]],
    apellidoMaterno: ['', [Validators.required]],
    fechaNacimiento: ['', [Validators.required]],
    telefono: [''],
    email: ['', [Validators.email]],
    // Dirección
    localidad: ['', [Validators.required]],
    colonia: ['', [Validators.required]],
    calle: ['', [Validators.required]],
    numero: ['', [Validators.required]],
    codigoPostal: [''],
    referencias: [''],
  });

  ngOnInit(): void {
    this.loadLocalidades();
    if (this.esEdicion) {
      const c = this.data.ciudadano!;
      this.form.patchValue({
        curp: c.curp,
        nombre: c.nombre,
        apellidoPaterno: c.apellidoPaterno,
        apellidoMaterno: c.apellidoMaterno,
        fechaNacimiento: c.fechaNacimiento,
        telefono: c.telefono ?? '',
        email: c.email ?? '',
        localidad: c.direccion?.localidad ?? '',
        colonia: c.direccion?.colonia ?? '',
        calle: c.direccion?.calle ?? '',
        numero: c.direccion?.numero ?? '',
        codigoPostal: c.direccion?.codigoPostal ?? '',
        referencias: c.direccion?.referencias ?? '',
      });
      // CURP no es editable
      this.form.get('curp')!.disable();
    } else {
      this.form
        .get('curp')!
        .valueChanges.pipe(
          debounceTime(600),
          distinctUntilChanged(),
          takeUntil(this.destroy$),
        )
        .subscribe((val: string) => {
          if (typeof val !== 'string') return;
          const curp = val.toUpperCase().trim();
          if (curp.length === 18) {
            this.checkCurpExists(curp);
          } else {
            this.curpStatus = 'idle';
            this.registeredName = '';
          }
        });
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadLocalidades(): void {
    const municipioId = this.authService.getCurrentUser()?.municipioId;
    if (!municipioId) return;
    this.isLoadingLocalidades = true;
    this.form.get('localidad')?.disable();
    this.catalogosService.getLocalidadesPorMunicipio(municipioId).subscribe({
      next: (data) => {
        this.localidades = data;
        this.isLoadingLocalidades = false;
        this.form.get('localidad')?.enable();
      },
      error: () => {
        this.isLoadingLocalidades = false;
        this.form.get('localidad')?.enable();
      },
    });
  }

  private checkCurpExists(curp: string): void {
    this.curpStatus = 'searching';
    this.ciudadanosService.getCiudadanoByCurp(curp).subscribe({
      next: (ciudadano) => {
        if (ciudadano?._id) {
          this.curpStatus = 'found';
          this.registeredName = [
            ciudadano.nombre,
            ciudadano.apellidoPaterno,
            ciudadano.apellidoMaterno,
          ]
            .filter(Boolean)
            .join(' ');
        } else {
          this.curpStatus = 'not-found';
        }
      },
      error: () => {
        this.curpStatus = 'not-found';
      },
    });
  }

  onGuardar(): void {
    if (this.form.invalid || this.guardando) {
      this.form.markAllAsTouched();
      return;
    }
    if (
      !this.esEdicion &&
      (this.curpStatus === 'idle' ||
        this.curpStatus === 'searching' ||
        this.curpStatus === 'found')
    ) {
      return;
    }

    this.guardando = true;
    const v = this.form.getRawValue();

    const direccion = {
      localidad: v.localidad,
      colonia: v.colonia,
      calle: v.calle,
      numero: v.numero,
      codigoPostal: v.codigoPostal,
      referencias: v.referencias,
    };

    if (this.esEdicion) {
      this.ciudadanosService
        .updateCiudadano(this.data.ciudadano!._id, {
          nombre: v.nombre,
          apellidoPaterno: v.apellidoPaterno,
          apellidoMaterno: v.apellidoMaterno,
          fechaNacimiento: v.fechaNacimiento,
          telefono: v.telefono,
          email: v.email,
          direccion,
        })
        .subscribe({
          next: (res) => {
            this.notificationService.success(
              'Ciudadano actualizado correctamente',
            );
            this.dialogRef.close(res);
          },
          error: () => {
            this.notificationService.error('Error al actualizar ciudadano');
            this.guardando = false;
          },
        });
    } else {
      this.ciudadanosService
        .createCiudadano({
          curp: v.curp,
          nombre: v.nombre,
          apellidoPaterno: v.apellidoPaterno,
          apellidoMaterno: v.apellidoMaterno,
          fechaNacimiento: v.fechaNacimiento,
          telefono: v.telefono,
          email: v.email,
          direccion,
        })
        .subscribe({
          next: (res) => {
            this.notificationService.success(
              'Ciudadano registrado correctamente',
            );
            this.dialogRef.close(res);
          },
          error: (err) => {
            if (err?.status === 409) {
              this.notificationService.error(
                'La CURP ya está registrada en este municipio',
              );
              this.form.get('curp')!.setErrors({ duplicado: true });
            } else {
              this.notificationService.error('Error al registrar ciudadano');
            }
            this.guardando = false;
          },
        });
    }
  }

  onCancelar(): void {
    this.dialogRef.close(null);
  }
}
