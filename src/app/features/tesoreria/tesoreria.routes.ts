import { Routes } from '@angular/router';
import { moduloGuard } from '../auth/guards/modulo.guard';

export const TESORERIA_ROUTES: Routes = [
  {
    path: '',
    canActivate: [moduloGuard('TESORERIA')],
    children: [
      {
        path: 'dashboard',
        loadComponent: () =>
          import('./pages/tesoreria.page').then((m) => m.TesoreriaPage),
      },
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full',
      },
    ],
  },
];
