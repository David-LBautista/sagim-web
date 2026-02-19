import { Routes } from '@angular/router';
import { moduloGuard } from '../auth/guards/modulo.guard';

export const ORGANISMO_AGUA_ROUTES: Routes = [
  {
    path: '',
    canActivate: [moduloGuard('ORGANISMO_AGUA')],
    children: [
      {
        path: 'dashboard',
        loadComponent: () =>
          import('./pages/organismo-agua.page').then(
            (m) => m.OrganismoAguaPage,
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
