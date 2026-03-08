import { Routes } from '@angular/router';
import { moduloGuard } from '../auth/guards/modulo.guard';

export const REGISTRO_CIVIL_ROUTES: Routes = [
  {
    path: '',
    canActivate: [moduloGuard('REGISTRO_CIVIL')],
    children: [
      {
        path: 'dashboard',
        loadComponent: () =>
          import('./pages/registro-civil.page').then(
            (m) => m.RegistroCivilPage,
          ),
      },
      {
        path: 'ordenes-pago',
        loadComponent: () =>
          import('./pages/ordenes-pago/ordenes-pago-rc.page').then(
            (m) => m.OrdenesPagoRcPage,
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
