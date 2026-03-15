import { Routes } from '@angular/router';

export const TRANSPARENCIA_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/dashboard/transparencia-dashboard.page').then(
        (m) => m.TransparenciaDashboardPage,
      ),
  },
  {
    path: ':clave',
    loadComponent: () =>
      import('./pages/seccion/transparencia-seccion.page').then(
        (m) => m.TransparenciaSeccionPage,
      ),
  },
];
