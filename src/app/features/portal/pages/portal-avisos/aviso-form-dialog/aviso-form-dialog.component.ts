import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import dayjs from 'dayjs';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { SagimDialogComponent } from '../../../../../shared/components/sagim-dialog/sagim-dialog.component';
import { ImageUploadButtonComponent } from '../../../../../shared/components/image-upload-button/image-upload-button.component';
import { PortalConfigService } from '../../../services/portal-config.service';
import {
  PortalAviso,
  AvisoTipo,
} from '../../../../../public/municipios/portal-publico.models';

@Component({
  selector: 'app-aviso-form-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatSnackBarModule,
    MatTooltipModule,
    SagimDialogComponent,
    ImageUploadButtonComponent,
  ],
  templateUrl: './aviso-form-dialog.component.html',
  styleUrl: './aviso-form-dialog.component.scss',
})
export class AvisoFormDialogComponent implements OnInit {
  private fb = inject(FormBuilder);
  private svc = inject(PortalConfigService);
  private snack = inject(MatSnackBar);
  readonly dialogRef = inject(MatDialogRef<AvisoFormDialogComponent>);
  readonly data: PortalAviso | null = inject(MAT_DIALOG_DATA);

  form!: FormGroup;
  guardando = signal(false);
  subiendoImagen = signal(false);
  imagenPreview = signal<string | null>(null);
  imagenFile: File | null = null;

  readonly esEdicion = !!this.data;

  readonly tipos: { value: AvisoTipo; label: string }[] = [
    { value: 'informativo', label: 'Informativo' },
    { value: 'alerta', label: 'Alerta' },
    { value: 'urgente', label: 'Urgente' },
  ];

  ngOnInit(): void {
    const d = this.data;
    this.form = this.fb.group({
      titulo: [
        d?.titulo ?? '',
        [Validators.required, Validators.maxLength(120)],
      ],
      cuerpo: [
        d?.cuerpo ?? '',
        [Validators.required, Validators.maxLength(500)],
      ],
      tipo: [d?.tipo ?? 'informativo', Validators.required],
      url: [d?.url ?? ''],
      urlTexto: [d?.urlTexto ?? ''],
      vigenciaInicio: [
        d ? this.toDatetimeLocal(d.vigenciaInicio) : '',
        Validators.required,
      ],
      vigenciaFin: [
        d ? this.toDatetimeLocal(d.vigenciaFin) : '',
        Validators.required,
      ],
      orden: [d?.orden ?? 1, [Validators.required, Validators.min(1)]],
    });

    if (d?.imagenUrl) this.imagenPreview.set(d.imagenUrl);
  }

  private toDatetimeLocal(iso: string): string {
    return iso ? dayjs(iso).format('YYYY-MM-DDTHH:mm') : '';
  }

  onImagenChange(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;
    if (file.size > 3 * 1024 * 1024) {
      this.snack.open('La imagen no puede superar 3 MB', 'Cerrar', {
        duration: 3000,
      });
      return;
    }
    this.imagenFile = file;
    const reader = new FileReader();
    reader.onload = (e) => this.imagenPreview.set(e.target?.result as string);
    reader.readAsDataURL(file);
  }

  guardar(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.guardando.set(true);

    const val = this.form.value;
    const payload = {
      ...val,
      vigenciaInicio: dayjs(val.vigenciaInicio).toISOString(),
      vigenciaFin: dayjs(val.vigenciaFin).toISOString(),
      orden: Number(val.orden),
    };

    const op$ = this.esEdicion
      ? this.svc.updateAviso(this.data!._id, payload)
      : this.svc.createAviso(payload);

    op$.subscribe({
      next: (aviso) => {
        if (this.imagenFile) {
          this.subiendoImagen.set(true);
          this.svc.uploadAvisoImagen(aviso._id, this.imagenFile).subscribe({
            next: () => {
              this.guardando.set(false);
              this.dialogRef.close(true);
            },
            error: () => {
              this.subiendoImagen.set(false);
              this.guardando.set(false);
              this.snack.open(
                'Aviso guardado, pero falló la imagen',
                'Cerrar',
                { duration: 4000 },
              );
              this.dialogRef.close(true);
            },
          });
        } else {
          this.guardando.set(false);
          this.dialogRef.close(true);
        }
      },
      error: () => {
        this.snack.open('Error al guardar el aviso', 'Cerrar', {
          duration: 3000,
        });
        this.guardando.set(false);
      },
    });
  }
}
