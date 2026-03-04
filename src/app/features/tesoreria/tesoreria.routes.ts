import { Routes } from '@angular/router';
import { moduloGuard, roleGuard } from '../auth/guards/modulo.guard';

export const TESORERIA_ROUTES: Routes = [
  {
    path: '',
    canActivate: [moduloGuard('TESORERIA')],
    children: [
      {
        path: 'dashboard',
        loadComponent: () =>
          import('./pages/tesoreria.page').then((m) => m.TesoreriaPage),
      },
      {
        path: 'caja',
        loadComponent: () =>
          import('./pages/caja/caja.page').then((m) => m.CajaPage),
      },
      {
        path: 'ordenes-pago',
        loadComponent: () =>
          import('./pages/ordenes-pago/ordenes-pago.page').then(
            (m) => m.OrdenesPagoPage,
          ),
      },
      {
        path: 'servicios',
        canActivate: [roleGuard(['SUPER_ADMIN', 'ADMIN_MUNICIPIO'])],
        loadComponent: () =>
          import('./pages/servicios/servicios.page').then(
            (m) => m.ServiciosTesoreriaPage,
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
