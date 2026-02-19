import { Routes } from '@angular/router';
import { moduloGuard } from '../auth/guards/modulo.guard';

export const SERVICIOS_ROUTES: Routes = [
  {
    path: '',
    canActivate: [moduloGuard('SERVICIOS_PUBLICOS')],
    children: [
      {
        path: 'dashboard',
        loadComponent: () =>
          import('./pages/servicios.page').then((m) => m.ServiciosPage),
      },
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full',
      },
    ],
  },
];
