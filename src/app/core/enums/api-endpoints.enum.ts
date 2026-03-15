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
  // ONBOARDING ENDPOINTS
  // ========================================
  ONBOARDING_GET = '/api/v1/municipios/:id/onboarding',
  ONBOARDING_DATOS = '/api/v1/municipios/:id/onboarding/datos',
  ONBOARDING_SERVICIOS = '/api/v1/municipios/:id/onboarding/servicios',
  ONBOARDING_EQUIPO = '/api/v1/municipios/:id/onboarding/equipo',
  ONBOARDING_PADRON = '/api/v1/municipios/:id/onboarding/padron',
  ONBOARDING_COMPLETAR = '/api/v1/municipios/:id/onboarding/completar',

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
  CATALOGOS_CATEGORIAS_SERVICIOS = '/api/v1/catalogos/categorias-servicios',
  CATALOGOS_CATEGORIA_SERVICIO_POR_NOMBRE = '/api/v1/catalogos/categorias-servicios/:nombre',
  CATALOGOS_AREAS_RESPONSABLES = '/api/v1/catalogos/areas-responsables',

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
  DIF_BENEFICIARIOS_DESACTIVAR = '/api/v1/dif/beneficiarios/:id/desactivar',
  DIF_BENEFICIARIOS_ESTADISTICAS = '/api/v1/dif/beneficiarios/estadisticas',
  DIF_BENEFICIARIOS_EXPORTAR = '/api/v1/dif/beneficiarios/exportar',
  DIF_BENEFICIARIOS_IMPORTAR = '/api/v1/dif/beneficiarios/importar',

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
  // TESORERÍA — SERVICIOS COBRABLES
  // ========================================
  TESORERIA_SERVICIOS_LIST = '/api/v1/tesoreria/servicios',
  TESORERIA_SERVICIOS_HAS_OVERRIDES = '/api/v1/tesoreria/servicios/has-overrides',
  TESORERIA_SERVICIOS_CATALOGO = '/api/v1/tesoreria/servicios/catalogo',
  TESORERIA_SERVICIOS_OVERRIDE_PATCH = '/api/v1/tesoreria/servicios/:clave/override',
  TESORERIA_SERVICIOS_OVERRIDE_DELETE = '/api/v1/tesoreria/servicios/:clave/override',
  TESORERIA_SERVICIOS_OVERRIDES_DELETE_ALL = '/api/v1/tesoreria/servicios/overrides',

  // ========================================
  // PAGOS PÚBLICOS (sin auth)
  // ========================================
  PAGOS_ORDEN_BY_FOLIO = '/api/v1/pagos/orden/folio/:folio',
  PAGOS_ORDEN_BY_TOKEN = '/api/v1/pagos/orden/:token',
  PAGOS_CREAR_INTENT = '/api/v1/pagos/orden/:token/crear-intent',
  PAGOS_PAGAR = '/api/v1/pagos/orden/:token/pagar',
  PAGOS_RECIBO = '/api/v1/pagos/:pagoId/recibo',

  // ========================================
  // TESORERÍA — ÓRDENES DE PAGO EN LÍNEA
  // ========================================
  TESORERIA_ORDENES_PAGO_METRICS = '/api/v1/tesoreria/ordenes-pago/metrics',
  TESORERIA_ORDENES_PAGO_LIST = '/api/v1/tesoreria/ordenes-pago',
  TESORERIA_ORDENES_PAGO_CANCELAR = '/api/v1/tesoreria/ordenes-pago/:id/cancelar',
  TESORERIA_ORDENES_PAGO_REENVIAR = '/api/v1/tesoreria/ordenes-pago/:id/reenviar-link',
  TESORERIA_GENERAR_ORDEN = '/api/v1/pagos/generar-orden',
  TESORERIA_PAGO_RECIBO = '/api/v1/pagos/:pagoId/recibo',

  // ========================================
  // TESORERÍA — CAJA
  // ========================================
  TESORERIA_PAGOS_CAJA = '/api/v1/tesoreria/pagos/caja',
  TESORERIA_PAGOS_CAJA_RECIBO = '/api/v1/tesoreria/pagos/caja/:id/recibo',
  TESORERIA_REPORTE_DIARIO = '/api/v1/tesoreria/reportes/diario',
  TESORERIA_CORTE_DIA_PDF = '/api/v1/tesoreria/reportes/diario/pdf',
  TESORERIA_REPORTE_MENSUAL = '/api/v1/tesoreria/reportes/mensual',
  TESORERIA_REPORTE_MENSUAL_PDF = '/api/v1/tesoreria/reportes/mensual/pdf',
  TESORERIA_REPORTE_SERVICIO = '/api/v1/tesoreria/reportes/servicio/:servicioId',
  TESORERIA_REPORTE_SERVICIO_PDF = '/api/v1/tesoreria/reportes/servicio/:servicioId/pdf',

  // ========================================
  // CIUDADANOS
  // ========================================
  CIUDADANOS_LIST = '/api/v1/ciudadanos',
  CIUDADANOS_CREATE = '/api/v1/ciudadanos',
  CIUDADANOS_ESTADISTICAS = '/api/v1/ciudadanos/estadisticas',
  CIUDADANOS_EXPORTAR = '/api/v1/ciudadanos/exportar',
  CIUDADANOS_IMPORTAR = '/api/v1/ciudadanos/importar',
  CIUDADANOS_GET = '/api/v1/ciudadanos/:id',
  CIUDADANOS_UPDATE = '/api/v1/ciudadanos/:id',
  CIUDADANOS_DESACTIVAR = '/api/v1/ciudadanos/:id/desactivar',

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
  // TESORERÍA — ÓRDENES INTERNAS (departamentos)
  // ========================================
  TESORERIA_ORDENES_INTERNAS_LIST = '/api/v1/tesoreria/ordenes-internas',
  TESORERIA_ORDENES_INTERNAS_CREATE = '/api/v1/tesoreria/ordenes-internas',
  TESORERIA_ORDENES_INTERNAS_CANCELAR = '/api/v1/tesoreria/ordenes-internas/:id/cancelar',
  TESORERIA_ORDENES_INTERNAS_COBRAR = '/api/v1/tesoreria/ordenes-internas/:id/cobrar',

  // ========================================
  // DASHBOARD EJECUTIVO — DIF
  // ========================================
  DASHBOARD_DIF_RESUMEN = '/api/v1/dashboard/dif/resumen',
  DASHBOARD_DIF_APOYOS_POR_PROGRAMA = '/api/v1/dashboard/dif/apoyos-por-programa',
  DASHBOARD_DIF_BENEFICIARIOS_POR_LOCALIDAD = '/api/v1/dashboard/dif/beneficiarios-por-localidad',
  DASHBOARD_DIF_APOYOS_POR_TIPO = '/api/v1/dashboard/dif/apoyos-por-tipo',
  DASHBOARD_DIF_COMPARATIVO_MENSUAL = '/api/v1/dashboard/dif/comparativo-mensual',
  DASHBOARD_DIF_ALERTAS = '/api/v1/dashboard/dif/alertas',

  // ========================================
  // AUDITORÍA
  // ========================================
  AUDITORIA_LOGS_LIST = '/api/v1/auditoria/logs',
  AUDITORIA_LOGS_CREATE = '/api/v1/auditoria/logs',
  AUDITORIA_HISTORIAL = '/api/v1/auditoria/historial/:entidad/:entidadId',
  AUDITORIA_USUARIO = '/api/v1/auditoria/usuario/:usuarioId',

  // ========================================
  // DASHBOARD — AUDITORÍA
  // ========================================
  DASHBOARD_AUDITORIA_RESUMEN = '/api/v1/dashboard/auditoria/resumen',
  DASHBOARD_AUDITORIA_ACTIVIDAD_MODULO = '/api/v1/dashboard/auditoria/actividad-por-modulo',
  DASHBOARD_AUDITORIA_ACCIONES_CRITICAS = '/api/v1/dashboard/auditoria/acciones-criticas',
  DASHBOARD_AUDITORIA_ACCESOS = '/api/v1/dashboard/auditoria/accesos',

  // ========================================
  // PORTAL PÚBLICO — CONFIGURACIÓN COMPLETA
  // ========================================
  PUBLIC_PORTAL = '/api/v1/public/portal',

  // ========================================
  // PANEL INTERNO — CONFIGURACIÓN PORTAL (Admin)
  // ========================================
  PORTAL_CONFIG_GET = '/api/v1/portal/configuracion',
  PORTAL_CONFIG_GENERAL = '/api/v1/portal/configuracion/general',
  PORTAL_CONFIG_APARIENCIA = '/api/v1/portal/configuracion/apariencia',
  PORTAL_CONFIG_REDES_SOCIALES = '/api/v1/portal/configuracion/redes-sociales',
  PORTAL_CONFIG_FOOTER = '/api/v1/portal/configuracion/footer',
  PORTAL_CONFIG_BANNER = '/api/v1/portal/configuracion/banner',

  // ========================================
  // PANEL INTERNO — AVISOS (Admin)
  // ========================================
  PORTAL_AVISOS_LIST = '/api/v1/portal/configuracion/avisos',
  PORTAL_AVISOS_CREATE = '/api/v1/portal/configuracion/avisos',
  PORTAL_AVISOS_UPDATE = '/api/v1/portal/configuracion/avisos/:id',
  PORTAL_AVISOS_DELETE = '/api/v1/portal/configuracion/avisos/:id',
  PORTAL_AVISOS_IMAGEN = '/api/v1/portal/configuracion/avisos/:id/imagen',

  // ========================================
  // PORTAL PÚBLICO — MUNICIPIO INFO
  // ========================================
  PUBLIC_MUNICIPIO_INFO = '/api/v1/public/info',

  // ========================================
  // PORTAL PÚBLICO — CITAS CIUDADANO
  // ========================================
  PUBLIC_CITAS_AREAS = '/api/v1/public/citas/areas',
  PUBLIC_CITAS_DISPONIBILIDAD = '/api/v1/public/citas/disponibilidad',
  PUBLIC_CITAS_CREAR = '/api/v1/public/citas',
  PUBLIC_CITAS_CONSULTAR = '/api/v1/public/citas/consultar',
  PUBLIC_CITAS_CANCELAR = '/api/v1/public/citas/cancelar',
  PUBLIC_CITAS_CIUDADANO_CURP = '/api/v1/public/citas/ciudadano/:curp',

  // ========================================
  // PORTAL PÚBLICO — REPORTES CIUDADANO
  // ========================================
  PUBLIC_REPORTES_INFO = '/api/v1/public/reportes/info',
  PUBLIC_REPORTES_CATEGORIAS = '/api/v1/public/reportes/categorias',
  PUBLIC_REPORTES_CREAR = '/api/v1/public/reportes',
  PUBLIC_REPORTES_CONSULTAR = '/api/v1/public/reportes/consultar',
  PUBLIC_REPORTES_METRICAS = '/api/v1/public/reportes/metricas',
  PUBLIC_REPORTES_MAPA = '/api/v1/public/reportes/mapa',

  // ========================================
  // TRANSPARENCIA — INTERNO (autenticado)
  // ========================================
  TRANSPARENCIA_LIST = '/api/v1/transparencia',
  TRANSPARENCIA_CUMPLIMIENTO = '/api/v1/transparencia/cumplimiento',
  TRANSPARENCIA_SECCION = '/api/v1/transparencia/:clave',
  TRANSPARENCIA_DOCUMENTOS_ADD = '/api/v1/transparencia/:clave/documentos',
  TRANSPARENCIA_DOCUMENTOS_DELETE = '/api/v1/transparencia/:clave/documentos',
  TRANSPARENCIA_CORRIENTE = '/api/v1/transparencia/:clave/corriente',
  TRANSPARENCIA_NOTA = '/api/v1/transparencia/:clave/nota',

  // ========================================
  // TRANSPARENCIA — PÚBLICO (sin auth)
  // ========================================
  PUBLIC_TRANSPARENCIA = '/api/v1/public/transparencia',
  PUBLIC_TRANSPARENCIA_SECCION = '/api/v1/public/transparencia/:clave',

  // ========================================
  // PANEL INTERNO — CITAS (autenticado)
  // ========================================
  CITAS_LIST = '/api/v1/citas',
  CITAS_HOY = '/api/v1/citas/hoy',
  CITAS_METRICAS = '/api/v1/citas/metricas',
  CITAS_DETAIL = '/api/v1/citas/:id',
  CITAS_CREAR = '/api/v1/citas',
  CITAS_CAMBIAR_ESTADO = '/api/v1/citas/:id/estado',
  CITAS_REAGENDAR = '/api/v1/citas/:id/reagendar',

  // Configuración de citas
  CITAS_CONFIG_LIST = '/api/v1/citas/configuracion',
  CITAS_CONFIG_CREAR = '/api/v1/citas/configuracion',
  CITAS_CONFIG_AREAS_DISPONIBLES = '/api/v1/citas/configuracion/areas-disponibles',
  CITAS_CONFIG_UPSERT = '/api/v1/citas/configuracion/:areaId',
  CITAS_CONFIG_TOGGLE = '/api/v1/citas/configuracion/:areaId/toggle',
  CITAS_CONFIG_BLOQUEOS_LIST = '/api/v1/citas/configuracion/bloqueos',
  CITAS_CONFIG_BLOQUEOS_CREAR = '/api/v1/citas/configuracion/bloqueos',
  CITAS_CONFIG_BLOQUEOS_ELIMINAR = '/api/v1/citas/configuracion/bloqueos/:id',

  // ========================================
  // REPORTES CIUDADANOS
  // ========================================
  REPORTES_LIST = '/api/v1/reportes',
  REPORTES_MIS_REPORTES = '/api/v1/reportes/mis-reportes',
  REPORTES_METRICAS = '/api/v1/reportes/metricas',
  REPORTES_CONFIG_GET = '/api/v1/reportes/configuracion',
  REPORTES_CONFIG_CATALOGO = '/api/v1/reportes/configuracion/catalogo',
  REPORTES_GET = '/api/v1/reportes/:id',
  REPORTES_CREATE = '/api/v1/reportes',
  REPORTES_CAMBIAR_ESTADO = '/api/v1/reportes/:id/estado',
  REPORTES_ASIGNAR = '/api/v1/reportes/:id/asignar',
  REPORTES_PRIORIDAD = '/api/v1/reportes/:id/prioridad',
  REPORTES_VISIBILIDAD = '/api/v1/reportes/:id/visibilidad',
  REPORTES_CONFIG_UPDATE = '/api/v1/reportes/configuracion',
  REPORTES_UPLOAD_IMAGES = '/api/v1/reportes/upload-images',
}
