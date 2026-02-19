/**
 * Tipos e interfaces para el sistema de notificaciones SAGIM
 */

/**
 * Tipos de notificación disponibles
 */
export enum NotificationType {
  SUCCESS = 'success',
  ERROR = 'error',
  WARNING = 'warning',
  INFO = 'info',
}

/**
 * Posiciones disponibles para las notificaciones
 */
export enum NotificationPosition {
  TOP_RIGHT = 'top-right',
  TOP_LEFT = 'top-left',
  TOP_CENTER = 'top-center',
  BOTTOM_RIGHT = 'bottom-right',
  BOTTOM_LEFT = 'bottom-left',
  BOTTOM_CENTER = 'bottom-center',
}

/**
 * Configuración de una notificación
 */
export interface NotificationConfig {
  message: string;
  type?: NotificationType;
  duration?: number; // en milisegundos
  position?: NotificationPosition;
  action?: string; // Texto del botón de acción
  dismissible?: boolean; // Si se puede cerrar manualmente
}

/**
 * Iconos para cada tipo de notificación
 */
export const NOTIFICATION_ICONS: Record<NotificationType, string> = {
  [NotificationType.SUCCESS]: 'check_circle',
  [NotificationType.ERROR]: 'error',
  [NotificationType.WARNING]: 'warning',
  [NotificationType.INFO]: 'info',
};

/**
 * Duraciones por defecto (en ms)
 */
export const NOTIFICATION_DURATION = {
  SHORT: 2000,
  MEDIUM: 4000,
  LONG: 6000,
  INDEFINITE: 0,
};
