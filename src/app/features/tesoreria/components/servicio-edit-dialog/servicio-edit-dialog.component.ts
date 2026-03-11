import { Component, inject, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import {
  MatDialogModule,
  MatDialogRef,
  MAT_DIALOG_DATA,
} from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDividerModule } from '@angular/material/divider';
import { SagimDialogComponent } from '../../../../shared/components/sagim-dialog/sagim-dialog.component';
import { TesoreriaService } from '../../services/tesoreria.service';
import { NotificationService } from '../../../../shared/services/notification.service';
import { ServicioCobrable } from '../../models/servicios.model';
import { NotificationType } from '../../../../shared/models/notification.model';

export interface ServicioEditDialogData {
  servicio: ServicioCobrable;
}

@Component({
  selector: 'app-servicio-edit-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSlideToggleModule,
    MatProgressSpinnerModule,
    MatDividerModule,
    SagimDialogComponent,
  ],
  templateUrl: './servicio-edit-dialog.component.html',
  styleUrls: ['./servicio-edit-dialog.component.scss'],
})
export class ServicioEditDialogComponent {
  private fb = inject(FormBuilder);
  private tesoreriaService = inject(TesoreriaService);
  private notificationService = inject(NotificationService);
  public dialogRef = inject(MatDialogRef<ServicioEditDialogComponent>);

  isSubmitting = false;
  form: FormGroup;

  constructor(@Inject(MAT_DIALOG_DATA) public data: ServicioEditDialogData) {
    this.form = this.fb.group({
      nombre: [
        data.servicio.nombre,
        [Validators.required, Validators.maxLength(120)],
      ],
      costo: [data.servicio.costo, [Validators.required, Validators.min(0)]],
      montoVariable: [data.servicio.montoVariable],
      activo: [data.servicio.activo],
    });
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.isSubmitting = true;
    this.tesoreriaService
      .patchOverride(this.data.servicio.clave, this.form.value)
      .subscribe({
        next: (updated) => {
          this.notificationService.show({
            message: 'Servicio actualizado correctamente',
            type: NotificationType.SUCCESS,
          });
          this.dialogRef.close(updated);
        },
        error: () => {
          this.notificationService.show({
            message: 'Error al actualizar el servicio',
            type: NotificationType.ERROR,
          });
          this.isSubmitting = false;
        },
      });
  }

  onCancel(): void {
    this.dialogRef.close(null);
  }
}
