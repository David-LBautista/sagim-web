import { Component, OnInit, inject } from '@angular/core';
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
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { CiudadanosService } from '../../services/ciudadanos.service';
import { NotificationService } from '../../../../shared/services/notification.service';
import type { Ciudadano } from '../../models/ciudadano.model';

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
    MatButtonModule,
    MatIconModule,
    MatTooltipModule,
    MatProgressSpinnerModule,
  ],
  templateUrl: './ciudadano-form-dialog.component.html',
  styleUrl: './ciudadano-form-dialog.component.scss',
})
export class CiudadanoFormDialogComponent implements OnInit {
  private fb = inject(FormBuilder);
  private dialogRef = inject(MatDialogRef<CiudadanoFormDialogComponent>);
  data: CiudadanoFormDialogData = inject(MAT_DIALOG_DATA);
  private ciudadanosService = inject(CiudadanosService);
  private notificationService = inject(NotificationService);

  guardando = false;

  get esEdicion(): boolean {
    return !!this.data?.ciudadano;
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
    }
  }

  onGuardar(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
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
