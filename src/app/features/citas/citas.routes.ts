import { Routes } from '@angular/router';
import { moduloGuard } from '../auth/guards/modulo.guard';

export const CITAS_ROUTES: Routes = [
  {
    path: '',
    canActivate: [moduloGuard('CITAS')],
    children: [
      {
        path: 'hoy',
        loadComponent: () =>
          import('./pages/agenda-hoy/agenda-hoy.page').then(
            (m) => m.AgendaHoyPage,
          ),
      },
      {
        path: 'lista',
        loadComponent: () =>
          import('./pages/lista/lista-citas.page').then(
            (m) => m.ListaCitasPage,
          ),
      },
      {
        path: 'metricas',
        loadComponent: () =>
          import('./pages/metricas/metricas.page').then((m) => m.MetricasPage),
      },
      {
        path: 'configuracion',
        loadComponent: () =>
          import('./pages/configuracion/configuracion.page').then(
            (m) => m.ConfiguracionPage,
          ),
      },
      {
        path: 'calendario',
        loadComponent: () =>
          import('./pages/calendario/calendario.page').then(
            (m) => m.CalendarioPage,
          ),
      },
      {
        path: '',
        redirectTo: 'hoy',
        pathMatch: 'full',
      },
    ],
  },
];
