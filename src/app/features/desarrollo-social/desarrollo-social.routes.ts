import { Routes } from '@angular/router';
import { moduloGuard } from '../auth/guards/modulo.guard';

export const DESARROLLO_SOCIAL_ROUTES: Routes = [
  {
    path: '',
    canActivate: [moduloGuard('DESARROLLO_SOCIAL')],
    children: [
      {
        path: 'dashboard',
        loadComponent: () =>
          import('./pages/desarrollo-social.page').then(
            (m) => m.DesarrolloSocialPage,
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
