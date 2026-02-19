import { Routes } from '@angular/router';
import { moduloGuard } from '../auth/guards/modulo.guard';

export const COMUNICACION_ROUTES: Routes = [
  {
    path: '',
    canActivate: [moduloGuard('COMUNICACION_SOCIAL')],
    children: [
      {
        path: 'dashboard',
        loadComponent: () =>
          import('./pages/comunicacion.page').then((m) => m.ComunicacionPage),
      },
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full',
      },
    ],
  },
];
