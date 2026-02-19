import { Routes } from '@angular/router';
import { moduloGuard } from '../auth/guards/modulo.guard';

export const REPORTES_ROUTES: Routes = [
  {
    path: '',
    canActivate: [moduloGuard('REPORTES')],
    children: [
      {
        path: 'dashboard',
        loadComponent: () =>
          import('./pages/reportes.page').then((m) => m.ReportesPage),
      },
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full',
      },
    ],
  },
];
