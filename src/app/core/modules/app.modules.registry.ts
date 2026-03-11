// core/modules/app-modules.registry.ts
export type AppModulo =
  | 'PRESIDENCIA'
  | 'SECRETARIA_AYUNTAMIENTO'
  | 'REGISTRO_CIVIL'
  | 'COMUNICACION_SOCIAL'
  | 'UIPPE'
  | 'CONTRALORIA'
  | 'SEGURIDAD_PUBLICA'
  | 'SERVICIOS_PUBLICOS'
  | 'DESARROLLO_URBANO'
  | 'DESARROLLO_ECONOMICO'
  | 'DESARROLLO_SOCIAL'
  | 'TESORERIA'
  | 'DIF'
  | 'ORGANISMO_AGUA'
  | 'USUARIOS'
  | 'MUNICIPIOS'
  | 'REPORTES'
  | 'CITAS'
  | 'AUDITORIA';

export const APP_MODULES: Record<
  AppModulo,
  {
    label: string;
    route: string;
    icon: string;
    loadRoutes: () => Promise<any>;
  }
> = {
  PRESIDENCIA: {
    label: 'Presidencia',
    route: '/presidencia',
    icon: 'account_balance',
    loadRoutes: () =>
      import('../../features/presidencia/presidencia.routes').then(
        (m) => m.PRESIDENCIA_ROUTES,
      ),
  },
  SECRETARIA_AYUNTAMIENTO: {
    label: 'Secretaría',
    route: '/secretaria-ayuntamiento',
    icon: 'assignment',
    loadRoutes: () =>
      import('../../features/secretaria-ayuntamiento/secretaria.routes').then(
        (m) => m.SECRETARIA_ROUTES,
      ),
  },
  REGISTRO_CIVIL: {
    label: 'Registro Civil',
    route: '/registro-civil',
    icon: 'how_to_reg',
    loadRoutes: () =>
      import('../../features/registro-civil/registro-civil.routes').then(
        (m) => m.REGISTRO_CIVIL_ROUTES,
      ),
  },
  COMUNICACION_SOCIAL: {
    label: 'Comunicación Social',
    route: '/comunicacion-social',
    icon: 'campaign',
    loadRoutes: () =>
      import('../../features/comunicacion-social/comunicacion.routes').then(
        (m) => m.COMUNICACION_ROUTES,
      ),
  },
  UIPPE: {
    label: 'Planeación (UIPPE)',
    route: '/uippe',
    icon: 'insights',
    loadRoutes: () =>
      import('../../features/uippe/uippe.routes').then((m) => m.UIPPE_ROUTES),
  },
  CONTRALORIA: {
    label: 'Contraloría',
    route: '/contraloria',
    icon: 'gavel',
    loadRoutes: () =>
      import('../../features/contraloria/contraloria.routes').then(
        (m) => m.CONTRALORIA_ROUTES,
      ),
  },

  // Operativos
  SEGURIDAD_PUBLICA: {
    label: 'Seguridad Pública',
    route: '/seguridad-publica',
    icon: 'local_police',
    loadRoutes: () =>
      import('../../features/seguridad-publica/seguridad.routes').then(
        (m) => m.SEGURIDAD_ROUTES,
      ),
  },
  SERVICIOS_PUBLICOS: {
    label: 'Servicios Públicos',
    route: '/servicios-publicos',
    icon: 'engineering',
    loadRoutes: () =>
      import('../../features/servicios-publicos/servicios.routes').then(
        (m) => m.SERVICIOS_ROUTES,
      ),
  },
  DESARROLLO_URBANO: {
    label: 'Desarrollo Urbano',
    route: '/desarrollo-urbano',
    icon: 'location_city',
    loadRoutes: () =>
      import('../../features/desarrollo-urbano/desarrollo-urbano.routes').then(
        (m) => m.DESARROLLO_URBANO_ROUTES,
      ),
  },
  DESARROLLO_ECONOMICO: {
    label: 'Desarrollo Económico',
    route: '/desarrollo-economico',
    icon: 'storefront',
    loadRoutes: () =>
      import('../../features/desarrollo-economico/desarrollo-economico.routes').then(
        (m) => m.DESARROLLO_ECONOMICO_ROUTES,
      ),
  },
  DESARROLLO_SOCIAL: {
    label: 'Desarrollo Social',
    route: '/desarrollo-social',
    icon: 'groups',
    loadRoutes: () =>
      import('../../features/desarrollo-social/desarrollo-social.routes').then(
        (m) => m.DESARROLLO_SOCIAL_ROUTES,
      ),
  },
  TESORERIA: {
    label: 'Tesorería',
    route: '/tesoreria',
    icon: 'account_balance_wallet',
    loadRoutes: () =>
      import('../../features/tesoreria/tesoreria.routes').then(
        (m) => m.TESORERIA_ROUTES,
      ),
  },

  // Organismos
  DIF: {
    label: 'DIF',
    route: '/dif',
    icon: 'volunteer_activism',
    loadRoutes: () =>
      import('../../features/dif/dif.routes').then((m) => m.DIF_ROUTES),
  },
  ORGANISMO_AGUA: {
    label: 'Organismo de Agua',
    route: '/organismo-agua',
    icon: 'water_drop',
    loadRoutes: () =>
      import('../../features/organismo-agua/organismo-agua.routes').then(
        (m) => m.ORGANISMO_AGUA_ROUTES,
      ),
  },

  // Sistema
  USUARIOS: {
    label: 'Usuarios',
    route: '/usuarios',
    icon: 'people',
    loadRoutes: () =>
      import('../../features/usuarios/usuarios.routes').then(
        (m) => m.USUARIOS_ROUTES,
      ),
  },

  MUNICIPIOS: {
    label: 'Municipios',
    route: '/municipios',
    icon: 'location_city',
    loadRoutes: () =>
      import('../../features/municipios/municipios.routes').then(
        (m) => m.MUNICIPIOS_ROUTES,
      ),
  },

  REPORTES: {
    label: 'Reportes',
    route: '/reportes',
    icon: 'bar_chart',
    loadRoutes: () =>
      import('../../features/reportes/reportes.routes').then(
        (m) => m.REPORTES_ROUTES,
      ),
  },

  CITAS: {
    label: 'Citas',
    route: '/citas',
    icon: 'event',
    loadRoutes: () =>
      import('../../features/citas/citas.routes').then((m) => m.CITAS_ROUTES),
  },

  AUDITORIA: {
    label: 'Auditoría',
    route: '/auditoria',
    icon: 'manage_search',
    loadRoutes: () =>
      import('../../features/auditoria/auditoria.routes').then(
        (m) => m.AUDITORIA_ROUTES,
      ),
  },
};
