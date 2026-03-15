import { Component, inject, signal, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  MatDialogRef,
  MAT_DIALOG_DATA,
  MatDialogModule,
} from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { TransparenciaService } from '../../services/transparencia.service';
import {
  TransparenciaSeccion,
  TransparenciaSubseccion,
  AgregarDocumentoDto,
  DocumentoTipo,
} from '../../models/transparencia.models';

export interface DocumentoDialogData {
  clave: string;
  subseccionClave: string | null;
}

@Component({
  selector: 'app-documento-form-dialog',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    MatInputModule,
    MatFormFieldModule,
    MatSelectModule,
    MatProgressSpinnerModule,
    MatTooltipModule,
  ],
  templateUrl: './documento-form-dialog.component.html',
  styleUrl: './documento-form-dialog.component.scss',
})
export class DocumentoFormDialogComponent implements OnInit {
  private svc = inject(TransparenciaService);
  dialogRef = inject(MatDialogRef<DocumentoFormDialogComponent>);
  data: DocumentoDialogData = inject(MAT_DIALOG_DATA);

  guardando = signal(false);
  error = signal('');
  subsecciones = signal<TransparenciaSubseccion[]>([]);

  // Form fields
  tipo: DocumentoTipo = 'pdf';
  nombre = '';
  descripcion = '';
  periodoReferencia = '';
  url = '';
  texto = '';
  archivo: File | null = null;
  archivoError = '';
  /** subseccion seleccionada en el select (sólo when subsecciones exist y no viene del data) */
  subseccionSeleccionada: string | null = this.data.subseccionClave ?? null;

  readonly tipoOpciones: {
    value: DocumentoTipo;
    label: string;
    icon: string;
  }[] = [
    { value: 'pdf', label: 'Archivo PDF', icon: 'picture_as_pdf' },
    { value: 'excel', label: 'Hoja de cálculo', icon: 'table_chart' },
    { value: 'link', label: 'Enlace (URL)', icon: 'link' },
    { value: 'texto', label: 'Texto libre', icon: 'text_snippet' },
  ];

  ngOnInit(): void {
    // Load subsecciones so the dialog can offer a selector when needed
    this.svc.getSeccion(this.data.clave).subscribe({
      next: (sec) => this.subsecciones.set(sec.subsecciones ?? []),
      error: () => {}, // non-blocking — select simply won't appear
    });
  }

  onFileChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    this.archivoError = '';

    if (!file) {
      this.archivo = null;
      return;
    }

    const esExcel =
      this.tipo === 'excel' &&
      (file.type ===
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
        file.type === 'application/vnd.ms-excel' ||
        file.type === 'text/csv' ||
        file.name.match(/\.(xlsx|xls|csv)$/i) !== null);
    const esPdf = this.tipo === 'pdf' && file.type === 'application/pdf';

    if (!esPdf && !esExcel) {
      this.archivoError =
        this.tipo === 'excel'
          ? 'Solo se aceptan archivos .xlsx, .xls o .csv.'
          : 'Solo se aceptan archivos PDF.';
      this.archivo = null;
      input.value = '';
      return;
    }
    if (file.size > 20 * 1024 * 1024) {
      this.archivoError = 'El archivo no puede superar los 20 MB.';
      this.archivo = null;
      input.value = '';
      return;
    }
    this.archivo = file;
  }

  get valid(): boolean {
    if (!this.nombre.trim()) return false;
    if ((this.tipo === 'pdf' || this.tipo === 'excel') && !this.archivo)
      return false;
    if (this.tipo === 'link' && !this.url.trim()) return false;
    if (this.tipo === 'texto' && !this.texto.trim()) return false;
    // If section has subsecciones and was opened without a specific one, require selection
    if (
      this.subsecciones().length > 0 &&
      !this.data.subseccionClave &&
      !this.subseccionSeleccionada
    )
      return false;
    return true;
  }

  guardar(): void {
    if (!this.valid || this.guardando()) return;
    this.error.set('');
    this.guardando.set(true);

    const dto: AgregarDocumentoDto = {
      nombre: this.nombre.trim(),
      tipo: this.tipo,
      descripcion: this.descripcion.trim() || undefined,
      periodoReferencia: this.periodoReferencia.trim() || undefined,
      subseccionClave: this.subseccionSeleccionada ?? undefined,
      ...((this.tipo === 'pdf' || this.tipo === 'excel') && this.archivo
        ? { archivo: this.archivo }
        : {}),
      ...(this.tipo === 'link' ? { url: this.url.trim() } : {}),
      ...(this.tipo === 'texto' ? { texto: this.texto.trim() } : {}),
    };

    this.svc.agregarDocumento(this.data.clave, dto).subscribe({
      next: (updated: TransparenciaSeccion) => {
        this.guardando.set(false);
        this.dialogRef.close(updated);
      },
      error: () => {
        this.guardando.set(false);
        this.error.set(
          'Ocurrió un error al guardar el documento. Intenta de nuevo.',
        );
      },
    });
  }

  cancelar(): void {
    this.dialogRef.close();
  }
}
