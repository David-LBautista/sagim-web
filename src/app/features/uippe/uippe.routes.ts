import { Routes } from '@angular/router';
import { moduloGuard } from '../auth/guards/modulo.guard';

export const UIPPE_ROUTES: Routes = [
  {
    path: '',
    canActivate: [moduloGuard('UIPPE')],
    children: [
      {
        path: 'dashboard',
        loadComponent: () =>
          import('./pages/uippe.page').then((m) => m.UippePage),
      },
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full',
      },
    ],
  },
];
