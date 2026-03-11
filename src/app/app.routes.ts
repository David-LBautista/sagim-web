import { Routes } from '@angular/router';
import { authGuard } from './features/auth/guards/auth.guard';
import { onboardingCompleteGuard } from './features/onboarding/guards/onboarding-complete.guard';
import { MainLayoutComponent } from './core/layout/main-layout/main-layout.component';
import { PublicLayoutComponent } from './public/layout/public-layout.component';

export const routes: Routes = [
  {
    path: 'login',
    loadChildren: () =>
      import('./features/auth/auth.routes').then((m) => m.AUTH_ROUTES),
  },
  {
    path: '',
    component: MainLayoutComponent,
    canActivate: [authGuard, onboardingCompleteGuard],
    children: [
      {
        path: 'presidencia',
        loadChildren: () =>
          import('./features/presidencia/presidencia.routes').then(
            (m) => m.PRESIDENCIA_ROUTES,
          ),
      },
      {
        path: 'secretaria-ayuntamiento',
        loadChildren: () =>
          import('./features/secretaria-ayuntamiento/secretaria.routes').then(
            (m) => m.SECRETARIA_ROUTES,
          ),
      },
      {
        path: 'registro-civil',
        loadChildren: () =>
          import('./features/registro-civil/registro-civil.routes').then(
            (m) => m.REGISTRO_CIVIL_ROUTES,
          ),
      },
      {
        path: 'comunicacion-social',
        loadChildren: () =>
          import('./features/comunicacion-social/comunicacion.routes').then(
            (m) => m.COMUNICACION_ROUTES,
          ),
      },
      {
        path: 'uippe',
        loadChildren: () =>
          import('./features/uippe/uippe.routes').then((m) => m.UIPPE_ROUTES),
      },
      {
        path: 'contraloria',
        loadChildren: () =>
          import('./features/contraloria/contraloria.routes').then(
            (m) => m.CONTRALORIA_ROUTES,
          ),
      },
      {
        path: 'seguridad-publica',
        loadChildren: () =>
          import('./features/seguridad-publica/seguridad.routes').then(
            (m) => m.SEGURIDAD_ROUTES,
          ),
      },
      {
        path: 'servicios-publicos',
        loadChildren: () =>
          import('./features/servicios-publicos/servicios.routes').then(
            (m) => m.SERVICIOS_ROUTES,
          ),
      },
      {
        path: 'desarrollo-urbano',
        loadChildren: () =>
          import('./features/desarrollo-urbano/desarrollo-urbano.routes').then(
            (m) => m.DESARROLLO_URBANO_ROUTES,
          ),
      },
      {
        path: 'desarrollo-economico',
        loadChildren: () =>
          import('./features/desarrollo-economico/desarrollo-economico.routes').then(
            (m) => m.DESARROLLO_ECONOMICO_ROUTES,
          ),
      },
      {
        path: 'desarrollo-social',
        loadChildren: () =>
          import('./features/desarrollo-social/desarrollo-social.routes').then(
            (m) => m.DESARROLLO_SOCIAL_ROUTES,
          ),
      },
      {
        path: 'tesoreria',
        loadChildren: () =>
          import('./features/tesoreria/tesoreria.routes').then(
            (m) => m.TESORERIA_ROUTES,
          ),
      },
      {
        path: 'dif',
        loadChildren: () =>
          import('./features/dif/dif.routes').then((m) => m.DIF_ROUTES),
      },
      {
        path: 'organismo-agua',
        loadChildren: () =>
          import('./features/organismo-agua/organismo-agua.routes').then(
            (m) => m.ORGANISMO_AGUA_ROUTES,
          ),
      },
      {
        path: 'usuarios',
        loadChildren: () =>
          import('./features/usuarios/usuarios.routes').then(
            (m) => m.USUARIOS_ROUTES,
          ),
      },
      {
        path: 'municipios',
        loadChildren: () =>
          import('./features/municipios/municipios.routes').then(
            (m) => m.MUNICIPIOS_ROUTES,
          ),
      },
      {
        path: 'reportes',
        loadChildren: () =>
          import('./features/reportes/reportes.routes').then(
            (m) => m.REPORTES_ROUTES,
          ),
      },
      {
        path: 'citas',
        loadChildren: () =>
          import('./features/citas/citas.routes').then((m) => m.CITAS_ROUTES),
      },
      {
        path: 'auditoria',
        loadChildren: () =>
          import('./features/auditoria/auditoria.routes').then(
            (m) => m.AUDITORIA_ROUTES,
          ),
      },
      {
        path: '',
        redirectTo: 'presidencia',
        pathMatch: 'full',
      },
    ],
  },
  {
    path: 'no-autorizado',
    loadComponent: () =>
      import('./features/pages/no-autorizado/no-autorizado.page').then(
        (m) => m.NoAutorizadoPage,
      ),
  },
  // ── Onboarding (sin MainLayout) ─────────────────────────────────────────
  {
    path: 'onboarding',
    loadChildren: () =>
      import('./features/onboarding/onboarding.routes').then(
        (m) => m.ONBOARDING_ROUTES,
      ),
  },
  // ── Página de pago pública (sin autenticación) ──────────────────────────
  {
    path: 'pago/:token',
    component: PublicLayoutComponent,
    children: [
      {
        path: '',
        loadComponent: () =>
          import('./public/pago/pago.page').then((m) => m.PagoPage),
      },
    ],
  },
  // ── Portal público ciudadano (sin autenticación) ─────────────────────────
  {
    path: 'public/:slug',
    component: PublicLayoutComponent,
    children: [
      {
        path: 'citas',
        loadChildren: () =>
          import('./public/citas/public-citas.routes').then(
            (m) => m.PUBLIC_CITAS_ROUTES,
          ),
      },
      {
        path: '',
        redirectTo: 'citas',
        pathMatch: 'full',
      },
    ],
  },
  {
    path: '',
    redirectTo: '/login',
    pathMatch: 'full',
  },
  {
    path: '**',
    redirectTo: '/login',
  },
];
