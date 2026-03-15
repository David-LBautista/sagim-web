import { Routes } from '@angular/router';

export const PORTAL_ROUTES: Routes = [
  {
    path: '',
    redirectTo: 'configuracion',
    pathMatch: 'full',
  },
  {
    path: 'configuracion',
    loadComponent: () =>
      import('./pages/portal-config/portal-config.page').then(
        (m) => m.PortalConfigPage,
      ),
  },
  {
    path: 'avisos',
    loadComponent: () =>
      import('./pages/portal-avisos/portal-avisos.page').then(
        (m) => m.PortalAvisosPage,
      ),
  },
];
