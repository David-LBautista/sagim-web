/**
 * Enumeración de todos los endpoints de la API SAGIM
 */
export enum ApiEndpoints {
  // ========================================
  // AUTH ENDPOINTS
  // ========================================
  AUTH_LOGIN = '/api/v1/auth/login',
  AUTH_REFRESH = '/api/v1/auth/refresh',
  AUTH_LOGOUT = '/api/v1/auth/logout',

  // ========================================
  // MUNICIPIOS ENDPOINTS
  // ========================================
  MUNICIPIOS_LIST = '/api/v1/municipios',
  MUNICIPIOS_GET = '/api/v1/municipios/:id',
  MUNICIPIOS_CREATE = '/api/v1/municipios',
  MUNICIPIOS_UPDATE = '/api/v1/municipios/:id',
  MUNICIPIOS_DELETE = '/api/v1/municipios/:id',

  // ========================================
  // CATÁLOGOS ENDPOINTS
  // ========================================
  CATALOGOS_ESTADOS = '/api/v1/catalogos/estados',
  CATALOGOS_MUNICIPIOS_POR_ESTADO = '/api/v1/catalogos/estados/:estadoId/municipios',
  CATALOGOS_ROLES = '/api/v1/catalogos/roles',
  CATALOGOS_UNIDADES_MEDIDA = '/api/v1/catalogos/unidades-medida',
  CATALOGOS_UNIDAD_MEDIDA_POR_CLAVE = '/api/v1/catalogos/unidades-medida/:clave',
  CATALOGOS_TIPOS_MOVIMIENTO = '/api/v1/catalogos/tipos-movimiento',
  CATALOGOS_TIPO_MOVIMIENTO_POR_CLAVE = '/api/v1/catalogos/tipos-movimiento/:clave',
  CATALOGOS_GRUPOS_VULNERABLES = '/api/v1/catalogos/grupos-vulnerables',
  CATALOGOS_GRUPO_VULNERABLE_POR_CLAVE = '/api/v1/catalogos/grupos-vulnerables/:clave',
  CATALOGOS_TIPOS_APOYO = '/api/v1/catalogos/tipos-apoyo',
  CATALOGOS_TIPO_APOYO_POR_CLAVE = '/api/v1/catalogos/tipos-apoyo/:clave',
  CATALOGOS_LOCALIDADES_POR_MUNICIPIO = '/api/v1/catalogos/localidades/municipio/:municipioId',

  // ========================================
  // MÓDULOS ENDPOINTS
  // ========================================
  MODULOS_LIST = '/api/v1/modulos',

  // ========================================
  // USERS ENDPOINTS
  // ========================================
  USERS_LIST = '/api/v1/users',
  USERS_GET = '/api/v1/users/:id',
  USERS_CREATE = '/api/v1/users',
  USERS_UPDATE = '/api/v1/users/:id',
  USERS_DELETE = '/api/v1/users/:id',

  // ========================================
  // DIF INVENTARIO ENDPOINTS
  // ========================================
  DIF_INVENTARIO_ITEMS_LIST = '/api/v1/dif/inventario/items',
  DIF_INVENTARIO_ITEMS_CREATE = '/api/v1/dif/inventario/items',
  DIF_INVENTARIO_ITEMS_GET = '/api/v1/dif/inventario/items/:id',
  DIF_INVENTARIO_ITEMS_UPDATE = '/api/v1/dif/inventario/items/:id',
  DIF_INVENTARIO_ITEMS_DELETE = '/api/v1/dif/inventario/items/:id',
  DIF_INVENTARIO_DASHBOARD = '/api/v1/dif/inventario/dashboard',
  DIF_PROGRAMAS_LIST = '/api/v1/dif/programas',

  // ========================================
  // DIF BENEFICIARIOS ENDPOINTS
  // ========================================
  DIF_BENEFICIARIOS_LIST = '/api/v1/dif/beneficiarios',
  DIF_BENEFICIARIOS_CREATE = '/api/v1/dif/beneficiarios',
  DIF_BENEFICIARIOS_GET_BY_CURP = '/api/v1/dif/beneficiarios/curp/:curp',
  DIF_BENEFICIARIOS_GET = '/api/v1/dif/beneficiarios/:id',
  DIF_BENEFICIARIOS_UPDATE = '/api/v1/dif/beneficiarios/:id',

  // ========================================
  // DIF APOYOS ENDPOINTS
  // ========================================
  DIF_APOYOS_LIST = '/api/v1/dif/apoyos',
  DIF_APOYOS_CREATE = '/api/v1/dif/apoyos',
  DIF_APOYOS_GET = '/api/v1/dif/apoyos/:id',
  DIF_APOYOS_UPDATE = '/api/v1/dif/apoyos/:id',
  DIF_APOYOS_DASHBOARD = '/api/v1/dif/apoyos/dashboard',
  DIF_TIPOS_APOYO_LIST = '/api/v1/dif/tipos-apoyo',

  // ========================================
  // DIF REPORTES ENDPOINTS
  // ========================================
  DIF_REPORTES_GENERAR = '/api/v1/dif/reportes/generar',

  // ========================================
  // DASHBOARD EJECUTIVO — TESORERÍA
  // ========================================
  DASHBOARD_TESORERIA_RESUMEN = '/api/v1/dashboard/tesoreria/resumen',
  DASHBOARD_TESORERIA_INGRESOS = '/api/v1/dashboard/tesoreria/ingresos',
  DASHBOARD_TESORERIA_INGRESOS_POR_AREA = '/api/v1/dashboard/tesoreria/ingresos-por-area',
  DASHBOARD_TESORERIA_SERVICIOS_TOP = '/api/v1/dashboard/tesoreria/servicios-top',
  DASHBOARD_TESORERIA_COMPARATIVO_MENSUAL = '/api/v1/dashboard/tesoreria/comparativo-mensual',
  DASHBOARD_TESORERIA_ALERTAS = '/api/v1/dashboard/tesoreria/alertas',

  // ========================================
  // DASHBOARD EJECUTIVO — DIF
  // ========================================
  DASHBOARD_DIF_RESUMEN = '/api/v1/dashboard/dif/resumen',
  DASHBOARD_DIF_APOYOS_POR_PROGRAMA = '/api/v1/dashboard/dif/apoyos-por-programa',
  DASHBOARD_DIF_BENEFICIARIOS_POR_LOCALIDAD = '/api/v1/dashboard/dif/beneficiarios-por-localidad',
  DASHBOARD_DIF_APOYOS_POR_TIPO = '/api/v1/dashboard/dif/apoyos-por-tipo',
  DASHBOARD_DIF_COMPARATIVO_MENSUAL = '/api/v1/dashboard/dif/comparativo-mensual',
  DASHBOARD_DIF_ALERTAS = '/api/v1/dashboard/dif/alertas',
}
