import { Routes } from '@angular/router';
import { moduloGuard } from '../auth/guards/modulo.guard';

export const DESARROLLO_URBANO_ROUTES: Routes = [
  {
    path: '',
    canActivate: [moduloGuard('DESARROLLO_URBANO')],
    children: [
      {
        path: 'dashboard',
        loadComponent: () =>
          import('./pages/desarrollo-urbano.page').then(
            (m) => m.DesarrolloUrbanoPage,
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
