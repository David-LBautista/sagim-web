import { Routes } from '@angular/router';
import { moduloGuard } from '../auth/guards/modulo.guard';

export const DESARROLLO_ECONOMICO_ROUTES: Routes = [
  {
    path: '',
    canActivate: [moduloGuard('DESARROLLO_ECONOMICO')],
    children: [
      {
        path: 'dashboard',
        loadComponent: () =>
          import('./pages/desarrollo-economico.page').then(
            (m) => m.DesarrolloEconomicoPage,
          ),
      },
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full',
      },
    ],
  },
];
