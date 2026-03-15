import { Routes } from '@angular/router';

export const PUBLIC_REPORTES_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/nuevo/nuevo-reporte-publico.page').then(
        (m) => m.NuevoReportePublicoPage,
      ),
  },
  {
    path: 'consultar',
    loadComponent: () =>
      import('./pages/consultar/consultar-reporte.page').then(
        (m) => m.ConsultarReportePage,
      ),
  },
];
