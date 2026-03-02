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
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';
import { ReportesDifService } from '../../services/reportes-dif.service';
import { NotificationService } from '../../../../shared/services/notification.service';
import type { TipoReporteDif } from '../../models/reportes-dif.model';

export interface GenerarReporteDialogData {
  tipo: TipoReporteDif;
}

const TITULO_MAP: Record<TipoReporteDif, string> = {
  apoyos: 'Reporte de Apoyos',
  beneficiarios: 'Reporte de Beneficiarios',
  inventario: 'Reporte de Inventario',
  fondos: 'Reporte de Fondos',
};

@Component({
  selector: 'app-generar-reporte-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatProgressSpinnerModule,
    MatIconModule,
  ],
  templateUrl: './generar-reporte-dialog.component.html',
  styleUrls: ['./generar-reporte-dialog.component.scss'],
})
export class GenerarReporteDialogComponent {
  private fb = inject(FormBuilder);
  private reportesService = inject(ReportesDifService);
  private notificationService = inject(NotificationService);
  public dialogRef = inject(MatDialogRef<GenerarReporteDialogComponent>);

  generando = false;
  maxDate = new Date();

  form: FormGroup;

  get titulo(): string {
    return TITULO_MAP[this.data.tipo] ?? 'Generar reporte';
  }

  constructor(@Inject(MAT_DIALOG_DATA) public data: GenerarReporteDialogData) {
    const now = new Date();
    const firstOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    this.form = this.fb.group({
      fechaInicio: [firstOfMonth, Validators.required],
      fechaFin: [now, Validators.required],
    });
  }

  onCancelar(): void {
    this.dialogRef.close();
  }

  onGenerar(): void {
    if (this.form.invalid || this.generando) return;

    this.generando = true;

    const { fechaInicio, fechaFin } = this.form.value;

    this.reportesService
      .generar({
        tipo: this.data.tipo,
        fechaInicio: this.formatDate(fechaInicio),
        fechaFin: this.formatDate(fechaFin),
      })
      .subscribe({
        next: (res) => {
          this.generando = false;
          window.open(res.url, '_blank');
          this.notificationService.success(
            'Reporte generado. Se abrirá en una nueva pestaña.',
          );
          this.dialogRef.close(true);
        },
        error: () => {
          this.generando = false;
          this.notificationService.error(
            'Error al generar el reporte. Intenta de nuevo.',
          );
        },
      });
  }

  private formatDate(date: Date): string {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }
}
