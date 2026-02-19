import { Routes } from '@angular/router';
import { moduloGuard } from '../auth/guards/modulo.guard';

export const USUARIOS_ROUTES: Routes = [
  {
    path: '',
    canActivate: [moduloGuard('USUARIOS')],
    children: [
      {
        path: 'dashboard',
        loadComponent: () =>
          import('./pages/users-dashboard.page').then(
            (m) => m.UsersDashboardPage,
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
