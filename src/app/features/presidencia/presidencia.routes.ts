import { Routes } from '@angular/router';
import { moduloGuard } from '../auth/guards/modulo.guard';

export const PRESIDENCIA_ROUTES: Routes = [
  {
    path: '',
    canActivate: [moduloGuard('PRESIDENCIA')],
    children: [
      {
        path: 'dashboard',
        loadComponent: () =>
          import('./pages/presidencia.page').then((m) => m.PresidenciaPage),
      },
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full',
      },
    ],
  },
];
