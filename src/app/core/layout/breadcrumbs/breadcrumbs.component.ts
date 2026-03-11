import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, NavigationEnd, ActivatedRoute } from '@angular/router';
import { RouterModule } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { filter, distinctUntilChanged, map } from 'rxjs/operators';

interface Breadcrumb {
  label: string;
  url: string;
  isActive: boolean;
}

@Component({
  selector: 'app-breadcrumbs',
  standalone: true,
  imports: [CommonModule, RouterModule, MatIconModule],
  templateUrl: './breadcrumbs.component.html',
  styleUrls: ['./breadcrumbs.component.scss'],
})
export class BreadcrumbsComponent implements OnInit {
  private router = inject(Router);
  private activatedRoute = inject(ActivatedRoute);

  breadcrumbs: Breadcrumb[] = [];

  // Mapeo de rutas a etiquetas legibles
  private routeLabels: Record<string, string> = {
    dashboard: 'Dashboard',
    usuarios: 'Usuarios',
    municipios: 'Municipios',
    dif: 'DIF',
    inventario: 'Inventario',
    beneficiarios: 'Beneficiarios',
    apoyos: 'Apoyos',
    tesoreria: 'Tesorería',
    presidencia: 'Presidencia',
    reportes: 'Reportes',
    citas: 'Citas',
    hoy: 'Agenda de Hoy',
    calendario: 'Calendario',
    lista: 'Historial',
    metricas: 'Métricas',
    configuracion: 'Configuración',
    'seguridad-publica': 'Seguridad Pública',
    'servicios-publicos': 'Servicios Públicos',
    'desarrollo-urbano': 'Desarrollo Urbano',
    'desarrollo-economico': 'Desarrollo Económico',
    'desarrollo-social': 'Desarrollo Social',
    'secretaria-ayuntamiento': 'Secretaría del Ayuntamiento',
    'comunicacion-social': 'Comunicación Social',
    uippe: 'UIPPE',
    contraloria: 'Contraloría',
    'organismo-agua': 'Organismo de Agua',
  };

  ngOnInit(): void {
    this.router.events
      .pipe(
        filter((event) => event instanceof NavigationEnd),
        distinctUntilChanged(),
        map(() => this.buildBreadcrumbs()),
      )
      .subscribe((breadcrumbs) => {
        this.breadcrumbs = breadcrumbs;
      });

    // Generar breadcrumbs iniciales
    this.breadcrumbs = this.buildBreadcrumbs();
  }

  private buildBreadcrumbs(): Breadcrumb[] {
    const url = this.router.url;
    const urlSegments = url.split('/').filter((segment) => segment);

    if (urlSegments.length === 0) {
      return [];
    }

    const breadcrumbs: Breadcrumb[] = [
      {
        label: 'Inicio',
        url: '/',
        isActive: false,
      },
    ];

    let currentPath = '';
    urlSegments.forEach((segment, index) => {
      currentPath += `/${segment}`;
      const isLast = index === urlSegments.length - 1;

      // Obtener la etiqueta del segmento
      const label = this.getSegmentLabel(segment);

      breadcrumbs.push({
        label,
        url: currentPath,
        isActive: isLast,
      });
    });

    return breadcrumbs;
  }

  private getSegmentLabel(segment: string): string {
    // Si el segmento está en el mapeo, usar la etiqueta
    if (this.routeLabels[segment]) {
      return this.routeLabels[segment];
    }

    // Si es un GUID o ID, mostrar solo "Detalle"
    if (
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
        segment,
      ) ||
      /^[0-9a-f]{24}$/i.test(segment)
    ) {
      return 'Detalle';
    }

    // Convertir kebab-case a Title Case
    return segment
      .split('-')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }
}
