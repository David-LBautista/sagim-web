import { Routes } from '@angular/router';
import { moduloGuard } from '../auth/guards/modulo.guard';

export const REPORTES_ROUTES: Routes = [
  {
    path: '',
    canActivate: [moduloGuard('REPORTES')],
    children: [
      {
        path: '',
        loadComponent: () =>
          import('./pages/lista/lista-reportes.page').then(
            (m) => m.ListaReportesPage,
          ),
      },
      {
        path: 'metricas',
        loadComponent: () =>
          import('./pages/metricas/metricas-reportes.page').then(
            (m) => m.MetricasReportesPage,
          ),
      },
      {
        path: 'configuracion',
        loadComponent: () =>
          import('./pages/configuracion/config-reportes.page').then(
            (m) => m.ConfigReportesPage,
          ),
      },
      {
        path: ':id',
        loadComponent: () =>
          import('./pages/detalle/detalle-reporte.page').then(
            (m) => m.DetalleReportePage,
          ),
      },
    ],
  },
];
