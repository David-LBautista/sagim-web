import { Routes } from '@angular/router';
import { moduloGuard } from '../auth/guards/modulo.guard';

export const DIF_ROUTES: Routes = [
  {
    path: '',
    canActivate: [moduloGuard('DIF')],
    children: [
      {
        path: 'dashboard',
        redirectTo: 'beneficiarios',
        pathMatch: 'full',
      },
      {
        path: 'inventario',
        loadComponent: () =>
          import('./pages/inventario.page').then((m) => m.InventarioPage),
      },
      {
        path: 'beneficiarios',
        loadComponent: () =>
          import('./pages/beneficiarios.page').then((m) => m.BeneficiariosPage),
      },
      {
        path: 'beneficiarios/:curp',
        loadComponent: () =>
          import('./pages/beneficiario-detalle.page').then(
            (m) => m.BeneficiarioDetallePage,
          ),
      },
      {
        path: 'apoyos',
        loadComponent: () =>
          import('./pages/apoyos.page').then((m) => m.ApoyosPage),
      },
      {
        path: '',
        redirectTo: 'beneficiarios',
        pathMatch: 'full',
      },
    ],
  },
];
