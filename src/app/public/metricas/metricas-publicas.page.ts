import { Component, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatButtonModule } from '@angular/material/button';
import { MunicipioContextService } from '../municipios/municipio-context.service';
import { PublicReportesService } from '../reportes/services/public-reportes.service';
import { MetricasReportesPublicas } from '../reportes/models/reportes-publicas.models';

@Component({
  selector: 'app-metricas-publicas',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    MatIconModule,
    MatProgressSpinnerModule,
    MatButtonModule,
  ],
  templateUrl: './metricas-publicas.page.html',
  styleUrl: './metricas-publicas.page.scss',
})
export class MetricasPublicasPage implements OnInit {
  private municipioContext = inject(MunicipioContextService);
  private reportesService = inject(PublicReportesService);
  private destroyRef = inject(DestroyRef);

  readonly slug = this.municipioContext.slug;
  readonly municipio = this.municipioContext.municipio;

  metricas = signal<MetricasReportesPublicas | null>(null);
  cargando = signal(true);
  error = signal<string | null>(null);

  ngOnInit() {
    this.reportesService
      .getMetricas()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (m) => {
          this.metricas.set(m);
          this.cargando.set(false);
        },
        error: () => {
          this.error.set('No se pudieron cargar las métricas en este momento.');
          this.cargando.set(false);
        },
      });
  }

  barWidth(valor: number, total: number): number {
    if (!total) return 0;
    return Math.round((valor / total) * 100);
  }
}
