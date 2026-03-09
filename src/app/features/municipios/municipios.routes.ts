import { Routes } from '@angular/router';
import { moduloGuard, roleGuard } from '../auth/guards/modulo.guard';

export const MUNICIPIOS_ROUTES: Routes = [
  {
    path: '',
    canActivate: [moduloGuard('MUNICIPIOS')],
    children: [
      {
        path: 'dashboard',
        loadComponent: () =>
          import('./pages/municipios.page').then((m) => m.MunicipiosPage),
      },
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full',
      },
    ],
  },
  {
    path: 'padron',
    canActivate: [roleGuard(['SUPER_ADMIN', 'ADMIN', 'ADMIN_MUNICIPIO'])],
    loadComponent: () =>
      import('./pages/padron/padron.page').then((m) => m.PadronPage),
  },
];
