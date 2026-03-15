import { Routes, CanMatchFn } from '@angular/router';
import { authGuard } from './features/auth/guards/auth.guard';
import { onboardingCompleteGuard } from './features/onboarding/guards/onboarding-complete.guard';
import { MainLayoutComponent } from './core/layout/main-layout/main-layout.component';
import { PublicLayoutComponent } from './public/layout/public-layout.component';
import { environment } from '../environments/environment';

// Log inmediato al cargar el módulo — confirma qué versión está desplegada
console.log('[SAGIM-ROUTES] loaded | hostname:', window.location.hostname, '| useSubdomain:', environment.useSubdomain);

/** Detecta si el hostname actual es un subdominio de municipio */
function detectPublicSubdomain(): boolean {
  if (!environment.useSubdomain) return false;
  const parts = window.location.hostname.split('.');
  const subdomain = parts[0];
  const reserved = ['www', 'app', 'sagim', 'localhost'];

  console.log('hostname:', window.location.hostname);
  console.log('parts:', parts);
  console.log('subdomain:', subdomain);
  console.log('useSubdomain:', environment.useSubdomain);
  console.log('result:', parts.length >= 4 && !reserved.includes(subdomain));

  return parts.length >= 4 && !reserved.includes(subdomain);
}

/** Activa el portal público en la raíz solo cuando se accede via subdominio municipio */
const isPublicSubdomain: CanMatchFn = () => detectPublicSubdomain();

/** Rutas de admin/login solo disponibles en el dominio principal (no en subdominios) */
const isAdminDomain: CanMatchFn = () => !detectPublicSubdomain();

/** Rutas hijas compartidas del portal público */
const PUBLIC_PORTAL_CHILDREN: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./public/home/home.page').then((m) => m.HomePage),
  },
  {
    path: 'citas',
    loadChildren: () =>
      import('./public/citas/public-citas.routes').then(
        (m) => m.PUBLIC_CITAS_ROUTES,
      ),
  },
  {
    path: 'reportes',
    loadChildren: () =>
      import('./public/reportes/public-reportes.routes').then(
        (m) => m.PUBLIC_REPORTES_ROUTES,
      ),
  },
  {
    path: 'transparencia',
    loadComponent: () =>
      import('./public/transparencia/transparencia.page').then(
        (m) => m.TransparenciaPage,
      ),
  },
  {
    path: 'avisos',
    loadComponent: () =>
      import('./public/avisos/avisos.page').then((m) => m.AvisosPage),
  },
  {
    path: 'pagar',
    loadComponent: () =>
      import('./public/pago/buscar-pago.page').then((m) => m.BuscarPagoPage),
  },
];

export const routes: Routes = [
  // ── Portal público vía subdominio (producción) ─────────────────────────
  {
    path: '',
    canMatch: [isPublicSubdomain],
    component: PublicLayoutComponent,
    children: PUBLIC_PORTAL_CHILDREN,
  },
  {
    path: 'login',
    canMatch: [isAdminDomain],
    loadChildren: () =>
      import('./features/auth/auth.routes').then((m) => m.AUTH_ROUTES),
  },
  {
    path: '',
    canMatch: [isAdminDomain],
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
        path: 'transparencia',
        loadChildren: () =>
          import('./features/transparencia/transparencia.routes').then(
            (m) => m.TRANSPARENCIA_ROUTES,
          ),
      },
      {
        path: 'portal',
        loadChildren: () =>
          import('./features/portal/portal.routes').then(
            (m) => m.PORTAL_ROUTES,
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
    canMatch: [isAdminDomain],
    loadComponent: () =>
      import('./features/pages/no-autorizado/no-autorizado.page').then(
        (m) => m.NoAutorizadoPage,
      ),
  },
  // ── Onboarding (sin MainLayout) ─────────────────────────────────────────
  {
    path: 'onboarding',
    canMatch: [isAdminDomain],
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
  // ── Portal público ciudadano (desarrollo — slug en la URL) ──────────────
  {
    path: 'public/:slug',
    component: PublicLayoutComponent,
    children: PUBLIC_PORTAL_CHILDREN,
  },
  // Fallback: en subdominio, cualquier ruta desconocida vuelve al portal
  {
    path: '',
    canMatch: [isPublicSubdomain],
    redirectTo: '/',
    pathMatch: 'full',
  },
  {
    path: '**',
    canMatch: [isPublicSubdomain],
    redirectTo: '/',
  },
  // Fallback: en dominio admin, ir a login
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
