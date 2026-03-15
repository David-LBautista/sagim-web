import { Component, inject, signal, DestroyRef, OnInit } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatDividerModule } from '@angular/material/divider';
import { ReportesService } from '../../services/reportes.service';
import { NotificationService } from '../../../../shared/services/notification.service';
import {
  ConfiguracionReportes,
  CatalogoCategoriaReporte,
  ActualizarConfigReportesDto,
  CategoriaReporte,
  CATEGORIA_REPORTE_LABELS,
  CATEGORIA_REPORTE_ICONS,
} from '../../models/reportes.model';

@Component({
  selector: 'app-config-reportes',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatSlideToggleModule,
    MatCheckboxModule,
    MatProgressBarModule,
    MatDividerModule,
  ],
  templateUrl: './config-reportes.page.html',
  styleUrl: './config-reportes.page.scss',
})
export class ConfigReportesPage implements OnInit {
  private reportesService = inject(ReportesService);
  private notif = inject(NotificationService);
  private fb = inject(FormBuilder);
  private destroyRef = inject(DestroyRef);

  cargando = signal(true);
  guardando = signal(false);
  config = signal<ConfiguracionReportes | null>(null);
  catalogo = signal<CatalogoCategoriaReporte[]>([]);
  categoriasActivas = signal<Set<CategoriaReporte>>(new Set());

  readonly categoriaLabels = CATEGORIA_REPORTE_LABELS;
  readonly categoriaIcons = CATEGORIA_REPORTE_ICONS;

  form = this.fb.group({
    activo: [true],
    mensajeBienvenida: ['', Validators.required],
    tiempoRespuestaEstimado: [''],
  });

  ngOnInit(): void {
    this.cargar();
  }

  private cargar(): void {
    this.cargando.set(true);
    this.reportesService
      .getConfiguracion()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (c) => {
          this.config.set(c);
          this.form.patchValue({
            activo: c.activo,
            mensajeBienvenida: c.mensajeBienvenida,
            tiempoRespuestaEstimado: c.tiempoRespuestaEstimado,
          });
          this.categoriasActivas.set(new Set(c.categoriasActivas));
          this.cargando.set(false);
        },
        error: () => {
          this.notif.error('Error al cargar configuración');
          this.cargando.set(false);
        },
      });

    this.reportesService
      .getCatalogo()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({ next: (cat) => this.catalogo.set(cat) });
  }

  isCategoriaActiva(cat: CategoriaReporte): boolean {
    return this.categoriasActivas().has(cat);
  }

  toggleCategoria(cat: CategoriaReporte): void {
    const set = new Set(this.categoriasActivas());
    if (set.has(cat)) set.delete(cat);
    else set.add(cat);
    this.categoriasActivas.set(set);
  }

  guardar(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.guardando.set(true);
    const v = this.form.value;
    const dto: ActualizarConfigReportesDto = {
      activo: v.activo ?? true,
      mensajeBienvenida: v.mensajeBienvenida!,
      tiempoRespuestaEstimado: v.tiempoRespuestaEstimado || undefined,
      categoriasActivas: Array.from(this.categoriasActivas()),
    };
    this.reportesService
      .actualizarConfiguracion(dto)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (c) => {
          this.config.set(c);
          this.guardando.set(false);
          this.notif.success('Configuración guardada');
        },
        error: () => {
          this.guardando.set(false);
          this.notif.error('Error al guardar configuración');
        },
      });
  }
}
