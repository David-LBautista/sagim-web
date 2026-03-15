import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { CommonModule, DecimalPipe, DatePipe } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatRippleModule } from '@angular/material/core';
import { MatTableModule } from '@angular/material/table';
import { TransparenciaService } from '../../services/transparencia.service';
import {
  TransparenciaSeccion,
  ResumenCumplimiento,
  EstadoFiltro,
  TipoFiltro,
  Semaforo,
  totalDocumentos,
} from '../../models/transparencia.models';

type FiltroActivo = EstadoFiltro | TipoFiltro;

@Component({
  selector: 'app-transparencia-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatCardModule,
    MatIconModule,
    MatProgressBarModule,
    MatProgressSpinnerModule,
    MatTooltipModule,
    MatRippleModule,
    MatTableModule,
    DecimalPipe,
    DatePipe,
  ],
  templateUrl: './transparencia-dashboard.page.html',
  styleUrl: './transparencia-dashboard.page.scss',
})
export class TransparenciaDashboardPage implements OnInit {
  private svc = inject(TransparenciaService);

  cargando = signal(true);
  secciones = signal<TransparenciaSeccion[]>([]);
  resumen = signal<ResumenCumplimiento | null>(null);
  filtroActivo = signal<FiltroActivo>('todas');

  readonly seccionesFiltradas = computed(() => {
    const filtro = this.filtroActivo();
    const all = this.secciones();
    switch (filtro) {
      case 'al_corriente':
        return all.filter((s) => s.alCorriente);
      case 'en_riesgo':
        return all.filter((s) => totalDocumentos(s) > 0 && !s.alCorriente);
      case 'sin_documentos':
        return all.filter((s) => totalDocumentos(s) === 0);
      case 'comun':
        return all.filter((s) => !s.esEspecificaMunicipio);
      case 'municipal':
        return all.filter((s) => s.esEspecificaMunicipio);
      default:
        return all;
    }
  });

  readonly riesgoColumns = [
    'clave',
    'titulo',
    'articulo',
    'periodicidad',
    'ultimaActualizacion',
    'accion',
  ];
  readonly seccionesColumns = [
    'semaforo',
    'info',
    'area',
    'periodo',
    'tipo',
    'docs',
    'accion',
  ];

  readonly tabs: { id: FiltroActivo; label: string }[] = [
    { id: 'todas', label: 'Todas' },
    { id: 'comun', label: 'Comunes (Art. 50)' },
    { id: 'municipal', label: 'Municipales (Art. 51)' },
    { id: 'al_corriente', label: 'Al corriente' },
    { id: 'en_riesgo', label: 'En riesgo' },
    { id: 'sin_documentos', label: 'Sin documentos' },
  ];

  ngOnInit(): void {
    this.svc.listar().subscribe({
      next: ({ secciones, resumen }) => {
        this.secciones.set(secciones);
        this.resumen.set(resumen);
        this.cargando.set(false);
      },
      error: () => this.cargando.set(false),
    });
  }

  totalDocs(s: TransparenciaSeccion): number {
    return totalDocumentos(s);
  }

  semaforo(s: TransparenciaSeccion): Semaforo {
    if (totalDocumentos(s) === 0) return 'rojo';
    if (!s.alCorriente) return 'amarillo';
    return 'verde';
  }

  semaforoIcon(s: TransparenciaSeccion): string {
    const sem = this.semaforo(s);
    if (sem === 'verde') return 'check_circle';
    if (sem === 'amarillo') return 'warning';
    return 'cancel';
  }
}
