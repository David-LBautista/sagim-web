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
  ReporteMapa,
  ReporteResueltoPuntos,
} from '../reportes/models/reportes-publicas.models';
import { MapaReportesPublicosComponent } from '../reportes/components/mapa-reportes-publicos/mapa-reportes-publicos.component';
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
    MapaReportesPublicosComponent,
  ],
  templateUrl: './home.page.html',
  styleUrl: './home.page.scss',
})
export class HomePage implements OnInit {
  private municipioContext = inject(MunicipioContextService);
  private reportesService = inject(PublicReportesService);
  private destroyRef = inject(DestroyRef);

  readonly slug = this.municipioContext.slug;
  readonly basePath = this.municipioContext.basePath;
  readonly coordenadas = this.municipioContext.coordenadasMunicipio;
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

  readonly mapaReportes = computed(() =>
    this.ultimos()
      .filter((r) => r.lat != null && r.lng != null)
      .map((r) => ({
        folio: r.folio,
        categoria: '',
        categoriaNombre: r.categoriaNombre,
        descripcion: '',
        lat: r.lat!,
        lng: r.lng!,
        direccion: r.ubicacion,
        colonia: r.colonia,
        fechaResolucion: r.fechaResolucion,
      })),
  );

  // Contadores animados
  animatedTotal = signal(0);
  animatedTasa = signal(0);
  animatedTiempo = signal<number | null>(null);

  private animateCounter(
    to: number,
    duration: number,
    setter: (v: number) => void,
  ): void {
    const start = performance.now();
    const step = (now: number) => {
      const t = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - t, 3);
      setter(Math.round(to * eased));
      if (t < 1) requestAnimationFrame(step);
      else setter(to);
    };
    requestAnimationFrame(step);
  }

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
          this.animateCounter(m.totalMes, 1200, (v) =>
            this.animatedTotal.set(v),
          );
          this.animateCounter(Math.round(m.tasaResolucion), 1500, (v) =>
            this.animatedTasa.set(v),
          );
          if (m.tiempoPromedioResolucion != null) {
            this.animateCounter(m.tiempoPromedioResolucion, 1000, (v) =>
              this.animatedTiempo.set(v),
            );
          }
        },
        error: () => {
          /* metricas opcionales, sin bloquear */
        },
      });
  }
}
