import { Routes } from '@angular/router';
import { moduloGuard } from '../auth/guards/modulo.guard';

export const SEGURIDAD_ROUTES: Routes = [
  {
    path: '',
    canActivate: [moduloGuard('SEGURIDAD_PUBLICA')],
    children: [
      {
        path: 'dashboard',
        loadComponent: () =>
          import('./pages/seguridad.page').then((m) => m.SeguridadPage),
      },
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full',
      },
    ],
  },
];
