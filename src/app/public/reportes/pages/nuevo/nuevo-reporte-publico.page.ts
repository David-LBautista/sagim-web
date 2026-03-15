import { Component, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDividerModule } from '@angular/material/divider';
import { ActionButtonComponent } from '../../../../shared/components/action-button/action-button.component';
import { PublicReportesService } from '../../services/public-reportes.service';
import { MunicipioContextService } from '../../../municipios/municipio-context.service';
import {
  CategoriaReportePublica,
  InfoReportesPublica,
  RespuestaReporteCreado,
} from '../../models/reportes-publicas.models';

type Vista = 'formulario' | 'confirmacion';

@Component({
  selector: 'app-nuevo-reporte-publico',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatCheckboxModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatDividerModule,
    ActionButtonComponent,
  ],
  templateUrl: './nuevo-reporte-publico.page.html',
  styleUrl: './nuevo-reporte-publico.page.scss',
})
export class NuevoReportePublicoPage implements OnInit {
  private fb = inject(FormBuilder);
  private reportesService = inject(PublicReportesService);
  private router = inject(Router);
  private municipioContext = inject(MunicipioContextService);
  private destroyRef = inject(DestroyRef);

  readonly slug = this.municipioContext.slug;

  vista = signal<Vista>('formulario');
  cargando = signal(false);
  enviando = signal(false);
  error = signal<string | null>(null);

  info = signal<InfoReportesPublica | null>(null);
  categorias = signal<CategoriaReportePublica[]>([]);
  resultado = signal<RespuestaReporteCreado | null>(null);

  evidencias: File[] = [];
  evidenciasNombres = signal<string[]>([]);

  form!: FormGroup;

  ngOnInit() {
    this.form = this.fb.group({
      categoria: ['', Validators.required],
      descripcion: ['', [Validators.required, Validators.minLength(15)]],
      calle: [''],
      colonia: [''],
      referencia: [''],
      nombre: [''],
      telefono: [''],
      correo: ['', Validators.email],
      recibirNotificaciones: [false],
    });

    this.cargando.set(true);
    this.reportesService
      .getInfo()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (info) => this.info.set(info),
        error: () => this.info.set(null),
      });

    this.reportesService
      .getCategorias()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (cats) => {
          this.categorias.set(cats);
          this.cargando.set(false);
        },
        error: () => {
          this.error.set('No se pudieron cargar las categorías.');
          this.cargando.set(false);
        },
      });
  }

  onFileChange(event: Event) {
    const input = event.target as HTMLInputElement;
    if (!input.files?.length) return;
    const nuevos = Array.from(input.files).slice(0, 5 - this.evidencias.length);
    this.evidencias = [...this.evidencias, ...nuevos].slice(0, 5);
    this.evidenciasNombres.set(this.evidencias.map((f) => f.name));
  }

  eliminarEvidencia(idx: number) {
    this.evidencias.splice(idx, 1);
    this.evidenciasNombres.set(this.evidencias.map((f) => f.name));
  }

  enviar() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.error.set(null);
    this.enviando.set(true);

    const v = this.form.value;
    const partes: string[] = [];
    if (v.calle) partes.push(v.calle.trim());
    if (v.colonia) partes.push(`Col. ${v.colonia.trim()}`);
    if (v.referencia) partes.push(`Referencia: ${v.referencia.trim()}`);
    const ubicacionDesc = partes.length ? partes.join(', ') : undefined;

    this.reportesService
      .crearReporte(
        {
          categoria: v.categoria,
          descripcion: v.descripcion,
          ubicacion: {
            descripcion: ubicacionDesc,
          },
          nombre: v.nombre || undefined,
          telefono: v.telefono || undefined,
          correo: v.correo || undefined,
          recibirNotificaciones: v.recibirNotificaciones,
        },
        this.evidencias.length ? this.evidencias : undefined,
      )
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (r) => {
          this.resultado.set(r);
          this.vista.set('confirmacion');
          this.enviando.set(false);
        },
        error: (err) => {
          this.error.set(
            err?.error?.message ??
              'Ocurrió un error al enviar el reporte. Intenta de nuevo.',
          );
          this.enviando.set(false);
        },
      });
  }

  irAConsultar() {
    this.router.navigate(['/public', this.slug(), 'reportes', 'consultar']);
  }

  nuevoReporte() {
    this.form.reset({ recibirNotificaciones: false });
    this.evidencias = [];
    this.evidenciasNombres.set([]);
    this.error.set(null);
    this.resultado.set(null);
    this.vista.set('formulario');
  }
}
