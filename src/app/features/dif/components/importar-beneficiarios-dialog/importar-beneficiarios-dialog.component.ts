import { Component, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatRadioModule } from '@angular/material/radio';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { BeneficiariosService } from '../../services/beneficiarios.service';
import { NotificationService } from '../../../../shared/services/notification.service';
import type {
  AccionDuplicadosBen,
  ImportarBeneficiariosResponse,
} from '../../models/beneficiarios.model';

export interface CampoBeneficiario {
  campo: string;
  label: string;
  requerido: boolean;
  columnaArchivo: string;
}

const CAMPOS_BENEFICIARIOS_DEFAULTS: CampoBeneficiario[] = [
  { campo: 'curp', label: 'CURP', requerido: true, columnaArchivo: 'CURP' },
  {
    campo: 'nombre',
    label: 'Nombre(s)',
    requerido: true,
    columnaArchivo: 'NOMBRE',
  },
  {
    campo: 'apellidoPaterno',
    label: 'Apellido paterno',
    requerido: true,
    columnaArchivo: 'APELLIDO_PATERNO',
  },
  {
    campo: 'apellidoMaterno',
    label: 'Apellido materno',
    requerido: false,
    columnaArchivo: 'APELLIDO_MATERNO',
  },
  {
    campo: 'fechaNacimiento',
    label: 'Fecha nacimiento',
    requerido: false,
    columnaArchivo: 'FECHA_NACIMIENTO',
  },
  {
    campo: 'sexo',
    label: 'Sexo (M/F)',
    requerido: false,
    columnaArchivo: 'SEXO',
  },
  {
    campo: 'telefono',
    label: 'Teléfono',
    requerido: false,
    columnaArchivo: 'TELEFONO',
  },
  { campo: 'email', label: 'Email', requerido: false, columnaArchivo: 'EMAIL' },
  {
    campo: 'localidad',
    label: 'Localidad',
    requerido: false,
    columnaArchivo: 'LOCALIDAD',
  },
  {
    campo: 'domicilio',
    label: 'Domicilio',
    requerido: false,
    columnaArchivo: 'DOMICILIO',
  },
  {
    campo: 'grupoVulnerable',
    label: 'Grupos vulnerables',
    requerido: false,
    columnaArchivo: 'GRUPO_VULNERABLE',
  },
  {
    campo: 'observaciones',
    label: 'Observaciones',
    requerido: false,
    columnaArchivo: 'OBSERVACIONES',
  },
];

@Component({
  selector: 'app-importar-beneficiarios-dialog',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatRadioModule,
    MatProgressSpinnerModule,
    MatTooltipModule,
  ],
  templateUrl: './importar-beneficiarios-dialog.component.html',
  styleUrl: './importar-beneficiarios-dialog.component.scss',
})
export class ImportarBeneficiariosDialogComponent {
  private dialogRef = inject(
    MatDialogRef<ImportarBeneficiariosDialogComponent>,
  );
  private beneficiariosService = inject(BeneficiariosService);
  private notificationService = inject(NotificationService);

  // ---- state ----
  pasoActual = signal(0); // 0 = upload, 1 = mapping, 2 = results
  importando = signal(false);
  resultado = signal<ImportarBeneficiariosResponse | null>(null);
  mostrarErrores = signal(false);

  // ---- Step 1: file ----
  archivoSeleccionado: File | null = null;
  dragOver = false;

  // ---- Step 2: mapping ----
  campos: CampoBeneficiario[] = CAMPOS_BENEFICIARIOS_DEFAULTS.map((c) => ({
    ...c,
  }));
  accionDuplicados: AccionDuplicadosBen = 'ignorar';

  // ---- computed ----
  get curpMapeado(): boolean {
    return !!this.campos
      .find((c) => c.campo === 'curp')
      ?.columnaArchivo?.trim();
  }

  get nombreArchivo(): string {
    return this.archivoSeleccionado?.name ?? '';
  }

  // ——— Step 1 ———

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    this.dragOver = true;
  }

  onDragLeave(): void {
    this.dragOver = false;
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    this.dragOver = false;
    const file = event.dataTransfer?.files[0];
    if (file) this.seleccionarArchivo(file);
  }

  onFileInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (file) this.seleccionarArchivo(file);
  }

  private seleccionarArchivo(file: File): void {
    const ext = file.name.split('.').pop()?.toLowerCase();
    if (!['xlsx', 'xls', 'csv'].includes(ext ?? '')) {
      this.notificationService.error(
        'Formato no soportado. Usa .xlsx, .xls o .csv',
      );
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      this.notificationService.error('El archivo supera los 10 MB');
      return;
    }
    this.archivoSeleccionado = file;
  }

  irAPaso1(): void {
    if (!this.archivoSeleccionado) return;
    this.pasoActual.set(1);
  }

  // ——— Step 2 ———

  volverAPaso0(): void {
    this.pasoActual.set(0);
  }

  buildMapeo(): string {
    const mapeo: Record<string, string> = {};
    this.campos.forEach((c) => {
      if (c.columnaArchivo?.trim()) {
        mapeo[c.campo] = c.columnaArchivo.trim();
      }
    });
    return JSON.stringify(mapeo);
  }

  iniciarImportacion(): void {
    if (!this.archivoSeleccionado || !this.curpMapeado) return;
    this.importando.set(true);
    this.beneficiariosService
      .importar({
        archivo: this.archivoSeleccionado,
        mapeo: this.buildMapeo(),
        accionDuplicados: this.accionDuplicados,
      })
      .subscribe({
        next: (res) => {
          this.resultado.set(res);
          this.importando.set(false);
          this.pasoActual.set(2);
        },
        error: () => {
          this.notificationService.error('Error al importar beneficiarios');
          this.importando.set(false);
        },
      });
  }

  // ——— Step 3 ———

  descargarReporteErrores(): void {
    const res = this.resultado();
    if (!res || res.detalleErrores.length === 0) return;

    const header = 'Fila,Nombre,Error\n';
    const rows = res.detalleErrores
      .map((e) => `${e.fila},"${e.nombre}","${e.error}"`)
      .join('\n');
    const blob = new Blob([header + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'errores-importacion-beneficiarios.csv';
    a.click();
    URL.revokeObjectURL(url);
  }

  cerrar(): void {
    this.dialogRef.close(this.resultado() !== null);
  }
}
