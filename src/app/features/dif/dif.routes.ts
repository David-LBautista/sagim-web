import { Routes } from '@angular/router';
import { moduloGuard } from '../auth/guards/modulo.guard';

export const DIF_ROUTES: Routes = [
  {
    path: '',
    canActivate: [moduloGuard('DIF')],
    children: [
      {
        path: 'dashboard',
        loadComponent: () => import('./pages/dif.page').then((m) => m.DifPage),
      },
      {
        path: 'inventario',
        loadComponent: () =>
          import('./pages/inventario.page').then((m) => m.InventarioPage),
      },
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full',
      },
    ],
  },
];
