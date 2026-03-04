/**
 * Configuración de ambiente de producción
 */
export const environment = {
  production: true,
  apiUrl: 'https://api.sagim.gob.mx', // Cambiar por la URL de producción
  frontendUrl: 'https://pago.sagim.gob.mx', // Portal de pagos en línea
  appName: 'SAGIM',
  appVersion: '1.0.0',
  stripePublishableKey: 'pk_live_XXXXXXXXXXXXXXXXXXXXXXXXXX', // Reemplazar con la clave pública de Stripe (live)
};
