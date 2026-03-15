/**
 * Configuración de ambiente de producción
 */
export const environment = {
  production: true,
  useSubdomain: true,
  wsUrl: 'https://api.sagim.com.mx',
  apiUrl: 'https://api.sagim.com.mx',
  frontendUrl: 'https://pago.sagim.gob.mx', // Portal de pagos en línea
  appName: 'SAGIM',
  appVersion: '1.0.0',
  stripePublishableKey: 'pk_live_XXXXXXXXXXXXXXXXXXXXXXXXXX', // Reemplazar con la clave pública de Stripe (live)
};
