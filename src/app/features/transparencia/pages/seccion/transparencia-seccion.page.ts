import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { CommonModule, DatePipe, NgTemplateOutlet } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { TransparenciaService } from '../../services/transparencia.service';
import {
  TransparenciaSeccion,
  TransparenciaDocumento,
} from '../../models/transparencia.models';
import { DocumentoFormDialogComponent } from '../../components/documento-form-dialog/documento-form-dialog.component';
import { ActionButtonComponent } from '../../../../shared/components/action-button/action-button.component';

@Component({
  selector: 'app-transparencia-seccion',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    MatChipsModule,
    MatProgressBarModule,
    MatProgressSpinnerModule,
    MatTooltipModule,
    MatSlideToggleModule,
    MatSnackBarModule,
    MatDialogModule,
    DatePipe,
    NgTemplateOutlet,
    ActionButtonComponent,
  ],
  templateUrl: './transparencia-seccion.page.html',
  styleUrl: './transparencia-seccion.page.scss',
})
export class TransparenciaSeccionPage implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private svc = inject(TransparenciaService);
  private snack = inject(MatSnackBar);
  private dialog = inject(MatDialog);

  cargando = signal(true);
  guardandoNota = signal(false);
  seccion = signal<TransparenciaSeccion | null>(null);
  notaEditada = signal('');
  notaDirty = computed(
    () => this.notaEditada() !== (this.seccion()?.notaInterna ?? ''),
  );

  readonly tieneSubsecciones = computed(
    () => (this.seccion()?.subsecciones?.length ?? 0) > 0,
  );

  ngOnInit(): void {
    const clave = this.route.snapshot.paramMap.get('clave')!;
    this.svc.getSeccion(clave).subscribe({
      next: (sec) => {
        this.seccion.set(sec);
        this.notaEditada.set(sec.notaInterna ?? '');
        this.cargando.set(false);
      },
      error: () => {
        this.cargando.set(false);
        this.snack.open('No se pudo cargar la sección', 'Cerrar', {
          duration: 3000,
        });
      },
    });
  }

  volver(): void {
    this.router.navigate(['../'], { relativeTo: this.route });
  }

  toggleCorriente(valor: boolean): void {
    const sec = this.seccion();
    if (!sec) return;
    this.svc.marcarCorriente(sec.clave, valor).subscribe({
      next: (updated) => {
        this.seccion.set(updated);
        this.snack.open(
          valor ? 'Marcada como al corriente' : 'Marcada como en riesgo',
          'OK',
          { duration: 2500 },
        );
      },
      error: () =>
        this.snack.open('Error al actualizar estado', 'Cerrar', {
          duration: 3000,
        }),
    });
  }

  guardarNota(): void {
    const sec = this.seccion();
    if (!sec) return;
    this.guardandoNota.set(true);
    this.svc.guardarNota(sec.clave, this.notaEditada()).subscribe({
      next: (updated) => {
        this.seccion.set(updated);
        this.notaEditada.set(updated.notaInterna ?? '');
        this.guardandoNota.set(false);
        this.snack.open('Nota guardada', 'OK', { duration: 2000 });
      },
      error: () => {
        this.guardandoNota.set(false);
        this.snack.open('Error al guardar nota', 'Cerrar', { duration: 3000 });
      },
    });
  }

  abrirModal(subseccionClave: string | null): void {
    const sec = this.seccion();
    if (!sec) return;
    const ref = this.dialog.open(DocumentoFormDialogComponent, {
      width: '560px',
      data: { clave: sec.clave, subseccionClave },
    });
    ref.afterClosed().subscribe((updated: TransparenciaSeccion | undefined) => {
      if (updated) {
        this.seccion.set(updated);
        this.snack.open('Documento agregado', 'OK', { duration: 2500 });
      }
    });
  }

  eliminarDocumento(idx: number, subseccionClave?: string): void {
    const sec = this.seccion();
    if (!sec) return;
    if (!confirm('¿Eliminar este documento? Esta acción no se puede deshacer.'))
      return;

    const op$ = this.svc.eliminarDocumento(sec.clave, idx, subseccionClave);

    op$.subscribe({
      next: (updated) => {
        this.seccion.set(updated);
        this.snack.open('Documento eliminado', 'OK', { duration: 2500 });
      },
      error: () =>
        this.snack.open('Error al eliminar documento', 'Cerrar', {
          duration: 3000,
        }),
    });
  }

  docIcon(doc: TransparenciaDocumento): string {
    if (doc.tipo === 'pdf') return 'picture_as_pdf';
    if (doc.tipo === 'excel') return 'table_chart';
    if (doc.tipo === 'link') return 'link';
    return 'text_snippet';
  }

  docUrl(doc: TransparenciaDocumento): string | null {
    if ((doc.tipo === 'pdf' || doc.tipo === 'excel') && doc.archivoUrl)
      return doc.archivoUrl;
    if (doc.tipo === 'link' && doc.url) return doc.url;
    return null;
  }
}
