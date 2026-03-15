import {
  Component,
  computed,
  DestroyRef,
  effect,
  inject,
  OnInit,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MunicipioContextService } from '../municipios/municipio-context.service';
import { PublicReportesService } from '../reportes/services/public-reportes.service';
import {
  MetricasReportesPublicas,
  ReporteResueltoPuntos,
} from '../reportes/models/reportes-publicas.models';
import type { PortalAviso } from '../municipios/portal-publico.models';

interface AccesoRapidoCard {
  icon: string;
  label: string;
  descripcion: string;
  ruta: string[];
  color: string;
}

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    MatIconModule,
    MatButtonModule,
    MatProgressSpinnerModule,
  ],
  templateUrl: './home.page.html',
  styleUrl: './home.page.scss',
})
export class HomePage implements OnInit {
  private municipioContext = inject(MunicipioContextService);
  private reportesService = inject(PublicReportesService);
  private destroyRef = inject(DestroyRef);

  readonly slug = this.municipioContext.slug;
  readonly municipio = this.municipioContext.municipio;
  readonly subtitulo = this.municipioContext.subtitulo;
  readonly mensajeBienvenida = this.municipioContext.mensajeBienvenida;
  readonly mostrarCitas = this.municipioContext.mostrarCitas;
  readonly mostrarReportes = this.municipioContext.mostrarReportes;
  readonly mostrarTransparencia = this.municipioContext.mostrarTransparencia;
  readonly avisos = this.municipioContext.avisos;
  readonly hayAvisos = this.municipioContext.hayAvisos;

  metricas = signal<MetricasReportesPublicas | null>(null);
  ultimos = signal<ReporteResueltoPuntos[]>([]);
  avisoSeleccionado = signal<PortalAviso | null>(null);

  abrirAviso(aviso: PortalAviso): void {
    this.avisoSeleccionado.set(aviso);
    document.body.style.overflow = 'hidden';
  }

  cerrarAviso(): void {
    this.avisoSeleccionado.set(null);
    document.body.style.overflow = '';
  }
  logoError = signal(false);

  readonly logoSrc = computed(
    () => this.municipio()?.logoUrl ?? '/assets/logo/escudo_sagim.svg',
  );

  readonly bannerStyle = computed(() => {
    const url = this.municipio()?.bannerUrl;
    if (!url) return {};
    return { 'background-image': `url('${url}')` };
  });

  readonly hasBanner = computed(() => !!this.municipio()?.bannerUrl);

  constructor() {
    effect(() => {
      this.municipio();
      this.logoError.set(false);
    });
  }

  readonly cards: AccesoRapidoCard[] = [
    {
      icon: 'event',
      label: 'Agendar Cita',
      descripcion:
        'Programa una cita con cualquier área del municipio de forma rápida y sencilla.',
      ruta: [],
      color: 'secondary',
    },
    {
      icon: 'campaign',
      label: 'Reportar Problema',
      descripcion:
        'Notifica baches, alumbrado, basura u otra incidencia en tu colonia.',
      ruta: [],
      color: 'warning',
    },
    {
      icon: 'folder_open',
      label: 'Transparencia',
      descripcion:
        'Consulta documentos oficiales, directorio de funcionarios y más.',
      ruta: [],
      color: 'success',
    },
    {
      icon: 'bar_chart',
      label: 'Métricas',
      descripcion:
        'Conoce el desempeño del municipio: reportes resueltos, tiempos de respuesta.',
      ruta: [],
      color: 'primary',
    },
  ];

  ngOnInit() {
    this.reportesService
      .getMetricas()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (m) => {
          this.metricas.set(m);
          this.ultimos.set(m.ultimos5Resueltos ?? []);
        },
        error: () => {
          /* metricas opcionales, sin bloquear */
        },
      });
  }
}
