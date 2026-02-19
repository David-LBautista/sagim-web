import { Routes } from '@angular/router';
import { moduloGuard } from '../auth/guards/modulo.guard';

export const CITAS_ROUTES: Routes = [
  {
    path: '',
    canActivate: [moduloGuard('CITAS')],
    children: [
      {
        path: 'dashboard',
        loadComponent: () =>
          import('./pages/citas.page').then((m) => m.CitasPage),
      },
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full',
      },
    ],
  },
];
