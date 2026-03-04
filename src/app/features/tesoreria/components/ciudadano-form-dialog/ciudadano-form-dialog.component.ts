import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { CajaService } from '../../services/caja.service';
import { NotificationService } from '../../../../shared/services/notification.service';
import { CiudadanoSearchResult } from '../../models/caja.model';
import { NotificationType } from '../../../../shared/models/notification.model';

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
    MatProgressSpinnerModule,
  ],
  template: `
    <h2 mat-dialog-title>Registrar ciudadano</h2>
    <mat-dialog-content>
      <form [formGroup]="form" class="ciudadano-form">
        <div class="form-row">
          <mat-form-field appearance="outline">
            <mat-label>Nombre(s)</mat-label>
            <input matInput formControlName="nombre" />
            @if (form.get('nombre')?.invalid && form.get('nombre')?.touched) {
              <mat-error>Requerido</mat-error>
            }
          </mat-form-field>
          <mat-form-field appearance="outline">
            <mat-label>Apellido paterno</mat-label>
            <input matInput formControlName="apellidoPaterno" />
            @if (
              form.get('apellidoPaterno')?.invalid &&
              form.get('apellidoPaterno')?.touched
            ) {
              <mat-error>Requerido</mat-error>
            }
          </mat-form-field>
        </div>
        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Apellido materno (opcional)</mat-label>
          <input matInput formControlName="apellidoMaterno" />
        </mat-form-field>
        <mat-form-field appearance="outline" class="full-width">
          <mat-label>CURP</mat-label>
          <input
            matInput
            formControlName="curp"
            maxlength="18"
            style="text-transform:uppercase"
          />
          @if (
            form.get('curp')?.hasError('required') && form.get('curp')?.touched
          ) {
            <mat-error>Requerido</mat-error>
          }
          @if (form.get('curp')?.hasError('pattern')) {
            <mat-error>CURP inválida (18 caracteres)</mat-error>
          }
        </mat-form-field>
      </form>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button [mat-dialog-close]="null" [disabled]="submitting">
        Cancelar
      </button>
      <button
        mat-flat-button
        color="primary"
        (click)="onGuardar()"
        [disabled]="submitting || form.invalid"
      >
        @if (submitting) {
          <mat-spinner
            diameter="18"
            style="display:inline-flex;margin-right:6px"
          />
        }
        Guardar y seleccionar
      </button>
    </mat-dialog-actions>
  `,
  styles: [
    `
      .ciudadano-form {
        display: flex;
        flex-direction: column;
        gap: 4px;
        min-width: 360px;
        padding-top: 8px;
      }
      .form-row {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 12px;
      }
      .full-width {
        width: 100%;
      }
    `,
  ],
})
export class CiudadanoFormDialogComponent {
  private fb = inject(FormBuilder);
  private cajaService = inject(CajaService);
  private notification = inject(NotificationService);
  public dialogRef = inject(MatDialogRef<CiudadanoFormDialogComponent>);

  submitting = false;
  form: FormGroup = this.fb.group({
    nombre: ['', Validators.required],
    apellidoPaterno: ['', Validators.required],
    apellidoMaterno: [''],
    curp: ['', [Validators.required, Validators.pattern(/^[A-Z0-9]{18}$/)]],
  });

  onGuardar(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.submitting = true;
    const dto = {
      ...this.form.value,
      curp: this.form.value.curp.toUpperCase(),
    };
    this.cajaService.crearCiudadano(dto).subscribe({
      next: (c: CiudadanoSearchResult) => {
        this.notification.show({
          message: 'Ciudadano registrado',
          type: NotificationType.SUCCESS,
        });
        this.dialogRef.close(c);
      },
      error: () => {
        this.notification.show({
          message: 'Error al registrar ciudadano',
          type: NotificationType.ERROR,
        });
        this.submitting = false;
      },
    });
  }
}
