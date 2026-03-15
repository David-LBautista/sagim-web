import { Component, inject, signal, DestroyRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { SagimDialogComponent } from '../../../../shared/components/sagim-dialog/sagim-dialog.component';
import { ReportesService } from '../../services/reportes.service';
import { NotificationService } from '../../../../shared/services/notification.service';
import {
  CategoriaReporte,
  PrioridadReporte,
  CrearReporteInternoDto,
  CATEGORIA_REPORTE_LABELS,
  CATEGORIA_REPORTE_ICONS,
  PRIORIDAD_REPORTE_LABELS,
} from '../../models/reportes.model';

@Component({
  selector: 'app-nuevo-reporte-dialog',
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
    MatDividerModule,
    SagimDialogComponent,
  ],
  templateUrl: './nuevo-reporte-dialog.component.html',
  styleUrl: './nuevo-reporte-dialog.component.scss',
})
export class NuevoReporteDialogComponent {
  private reportesService = inject(ReportesService);
  private notif = inject(NotificationService);
  private dialogRef = inject(MatDialogRef<NuevoReporteDialogComponent>);
  private fb = inject(FormBuilder);
  private destroyRef = inject(DestroyRef);

  guardando = signal(false);
  archivosSeleccionados: File[] = [];

  readonly categoriaLabels = CATEGORIA_REPORTE_LABELS;
  readonly categoriaIcons = CATEGORIA_REPORTE_ICONS;
  readonly prioridadLabels = PRIORIDAD_REPORTE_LABELS;

  readonly categorias: CategoriaReporte[] = [
    'infraestructura_vial',
    'alumbrado_publico',
    'agua_drenaje',
    'basura_limpieza',
    'areas_verdes',
    'medio_ambiente',
    'seguridad_publica',
    'transito_vialidad',
    'proteccion_civil',
    'otro',
  ];
  readonly prioridades: PrioridadReporte[] = [
    'baja',
    'normal',
    'alta',
    'urgente',
  ];
  readonly origenes = [
    { value: 'interno', label: 'Interno' },
    { value: 'telefono', label: 'Teléfono' },
  ];

  form = this.fb.group({
    categoria: ['' as CategoriaReporte | '', Validators.required],
    descripcion: ['', [Validators.required, Validators.minLength(10)]],
    ubicacionDescripcion: ['', Validators.required],
    ubicacionColonia: [''],
    ubicacionReferencia: [''],
    nombre: [''],
    telefono: [''],
    prioridad: ['' as PrioridadReporte | ''],
    origen: ['' as 'interno' | 'telefono' | ''],
  });

  onFileChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files) {
      this.archivosSeleccionados = Array.from(input.files).slice(0, 5);
    }
  }

  removeFile(index: number): void {
    this.archivosSeleccionados = this.archivosSeleccionados.filter(
      (_, i) => i !== index,
    );
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.guardando.set(true);
    const v = this.form.value;
    const dto: CrearReporteInternoDto = {
      categoria: v.categoria as CategoriaReporte,
      descripcion: v.descripcion!,
      ubicacion: {
        descripcion: v.ubicacionDescripcion!,
        colonia: v.ubicacionColonia || undefined,
        referencia: v.ubicacionReferencia || undefined,
      },
      nombre: v.nombre || undefined,
      telefono: v.telefono || undefined,
      prioridad: (v.prioridad as PrioridadReporte) || undefined,
      origen: (v.origen as 'interno' | 'telefono') || undefined,
    };

    if (this.archivosSeleccionados.length > 0) {
      this.reportesService
        .subirImagenes(this.archivosSeleccionados)
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe({
          next: (res) => this.crearConEvidencias(dto, res.urls),
          error: () => {
            this.notif.error('Error al subir imágenes');
            this.guardando.set(false);
          },
        });
    } else {
      this.crearConEvidencias(dto, []);
    }
  }

  private crearConEvidencias(
    dto: CrearReporteInternoDto,
    _evidencia: string[],
  ): void {
    this.reportesService
      .crearReporte({ ...dto } as CrearReporteInternoDto)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (r) => {
          this.notif.success(`Reporte ${r.folio} creado`);
          this.dialogRef.close(r);
        },
        error: () => {
          this.notif.error('Error al crear el reporte');
          this.guardando.set(false);
        },
      });
  }

  onCancel(): void {
    this.dialogRef.close();
  }
}
