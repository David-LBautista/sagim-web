import { Routes } from '@angular/router';

export const AUDITORIA_ROUTES: Routes = [
  {
    path: '',
    redirectTo: 'dashboard',
    pathMatch: 'full',
  },
  {
    path: 'dashboard',
    loadComponent: () =>
      import('./pages/dashboard/auditoria-dashboard.page').then(
        (m) => m.AuditoriaDashboardPage,
      ),
  },
  {
    path: 'logs',
    loadComponent: () =>
      import('./pages/logs/auditoria-logs.page').then(
        (m) => m.AuditoriaLogsPage,
      ),
  },
];
