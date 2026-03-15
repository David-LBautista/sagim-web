import { Component, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDividerModule } from '@angular/material/divider';
import { PublicReportesService } from '../../services/public-reportes.service';
import { MunicipioContextService } from '../../../municipios/municipio-context.service';
import { ReportePublico } from '../../models/reportes-publicas.models';
import { ActionButtonComponent } from '../../../../shared/components/action-button/action-button.component';

type Vista = 'formulario' | 'resultado';

const ESTADO_LABELS: Record<string, string> = {
  pendiente: 'Pendiente',
  en_proceso: 'En proceso',
  resuelto: 'Resuelto',
  cerrado: 'Cerrado',
  rechazado: 'Rechazado',
};

@Component({
  selector: 'app-consultar-reporte',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatDividerModule,
    ActionButtonComponent,
  ],
  templateUrl: './consultar-reporte.page.html',
  styleUrl: './consultar-reporte.page.scss',
})
export class ConsultarReportePage implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private fb = inject(FormBuilder);
  private reportesService = inject(PublicReportesService);
  private municipioContext = inject(MunicipioContextService);
  private destroyRef = inject(DestroyRef);

  readonly slug = this.municipioContext.slug;
  readonly estadoLabels = ESTADO_LABELS;

  vista = signal<Vista>('formulario');
  cargando = signal(false);
  error = signal<string | null>(null);
  reporte = signal<ReportePublico | null>(null);

  form!: FormGroup;

  ngOnInit() {
    this.form = this.fb.group({
      folio: ['', Validators.required],
      token: ['', Validators.required],
    });

    // Pre-fill from query params (email deep link)
    const qp = this.route.snapshot.queryParamMap;
    const folioParam = qp.get('folio');
    const tokenParam = qp.get('token');
    if (folioParam && tokenParam) {
      this.form.patchValue({ folio: folioParam, token: tokenParam });
      this.consultar();
    }
  }

  consultar() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.error.set(null);
    this.cargando.set(true);

    const { folio, token } = this.form.value;
    this.reportesService
      .consultarReporte(folio, token)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (r) => {
          this.reporte.set(r);
          this.vista.set('resultado');
          this.cargando.set(false);
        },
        error: (err) => {
          const status = err?.status;
          this.error.set(
            status === 404
              ? 'No se encontró el reporte con ese folio y token. Verifica los datos.'
              : (err?.error?.message ??
                  'Ocurrió un error al consultar. Intenta de nuevo.'),
          );
          this.cargando.set(false);
        },
      });
  }

  volver() {
    this.vista.set('formulario');
    this.reporte.set(null);
    this.error.set(null);
  }

  nuevoReporte() {
    this.router.navigate(['/public', this.slug(), 'reportes']);
  }

  getEstadoLabel(estado: string): string {
    return this.estadoLabels[estado] ?? estado;
  }
}
