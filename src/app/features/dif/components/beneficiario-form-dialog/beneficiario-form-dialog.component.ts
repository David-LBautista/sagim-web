import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { CatalogosService } from '../../../../shared/services/catalogos.service';
import { NotificationService } from '../../../../shared/services/notification.service';
import { BeneficiariosService } from '../../services/beneficiarios.service';
import type { GrupoVulnerableCatalogo } from '../../../../shared/models/catalogo.model';

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
    MatIconModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatProgressSpinnerModule,
  ],
  templateUrl: './beneficiario-form-dialog.component.html',
  styleUrls: ['./beneficiario-form-dialog.component.scss'],
})
export class BeneficiarioFormDialogComponent implements OnInit {
  private fb = inject(FormBuilder);
  private dialogRef = inject(MatDialogRef<BeneficiarioFormDialogComponent>);
  private catalogosService = inject(CatalogosService);
  private beneficiariosService = inject(BeneficiariosService);
  private notificationService = inject(NotificationService);

  form: FormGroup = this.fb.group({
    nombre: ['', [Validators.required]],
    apellidoPaterno: ['', [Validators.required]],
    apellidoMaterno: ['', [Validators.required]],
    curp: ['', [Validators.required, Validators.minLength(18), Validators.maxLength(18)]],
    fechaNacimiento: [null, [Validators.required]],
    sexo: ['', [Validators.required]],
    telefono: ['', [Validators.required, Validators.pattern(/^\d{10}$/)]],
    email: ['', [Validators.required, Validators.email]],
    domicilio: ['', [Validators.required]],
    localidad: ['', [Validators.required]],
    grupoVulnerable: [[], [Validators.required]],
    observaciones: [''],
  });

  isSubmitting = false;
  gruposVulnerables: GrupoVulnerableCatalogo[] = [];

  sexoOptions = [
    { value: 'F', label: 'Femenino' },
    { value: 'M', label: 'Masculino' },
    { value: 'OTRO', label: 'Otro' },
  ];

  ngOnInit(): void {
    this.loadGruposVulnerables();
  }

  private loadGruposVulnerables(): void {
    this.catalogosService.getGruposVulnerables().subscribe({
      next: (grupos) => {
        this.gruposVulnerables = grupos.filter((g) => g.activo);
      },
      error: (error) => {
        console.error('Error al cargar grupos vulnerables:', error);
        this.notificationService.error('Error al cargar grupos vulnerables');
      },
    });
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
      fechaNacimiento: this.formatDate(value.fechaNacimiento),
    };

    this.beneficiariosService.createBeneficiario(payload).subscribe({
      next: (response) => {
        this.notificationService.success('Beneficiario creado exitosamente');
        this.dialogRef.close(response);
      },
      error: (error) => {
        console.error('Error al crear beneficiario:', error);
        this.notificationService.error('Error al crear beneficiario');
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
