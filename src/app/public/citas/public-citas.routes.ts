import { Routes } from '@angular/router';

export const PUBLIC_CITAS_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/agendar/agendar.page').then((m) => m.AgendarPage),
  },
  {
    path: 'consultar',
    loadComponent: () =>
      import('./pages/consultar/consultar.page').then((m) => m.ConsultarPage),
  },
];
