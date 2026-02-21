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
  MUNICIPIOS_UPDATE = '/api/v1/municipios/:id/config',
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
}
