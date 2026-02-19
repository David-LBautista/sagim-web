import { Routes } from '@angular/router';
import { moduloGuard } from '../auth/guards/modulo.guard';

export const CONTRALORIA_ROUTES: Routes = [
  {
    path: '',
    canActivate: [moduloGuard('CONTRALORIA')],
    children: [
      {
        path: 'dashboard',
        loadComponent: () =>
          import('./pages/contraloria.page').then((m) => m.ContraloriaPage),
      },
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full',
      },
    ],
  },
];
