import { Routes } from '@angular/router';
import { moduloGuard } from '../auth/guards/modulo.guard';

export const SECRETARIA_ROUTES: Routes = [
  {
    path: '',
    canActivate: [moduloGuard('SECRETARIA_AYUNTAMIENTO')],
    children: [
      {
        path: 'dashboard',
        loadComponent: () =>
          import('./pages/secretaria.page').then((m) => m.SecretariaPage),
      },
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full',
      },
    ],
  },
];
