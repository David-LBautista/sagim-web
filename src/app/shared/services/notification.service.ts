import { Injectable, inject } from '@angular/core';
import {
  MatSnackBar,
  MatSnackBarHorizontalPosition,
  MatSnackBarVerticalPosition,
} from '@angular/material/snack-bar';
import {
  NotificationConfig,
  NotificationPosition,
  NotificationType,
  NOTIFICATION_DURATION,
} from '../models/notification.model';

/**
 * Servicio centralizado de notificaciones para SAGIM
 * Utiliza Angular Material Snackbar con estilos personalizados
 */
@Injectable({
  providedIn: 'root',
})
export class NotificationService {
  private snackBar = inject(MatSnackBar);

  /**
   * Muestra una notificación con configuración personalizada
   */
  show(config: NotificationConfig): void {
    const {
      message,
      type = NotificationType.INFO,
      duration = NOTIFICATION_DURATION.MEDIUM,
      position = NotificationPosition.TOP_RIGHT,
      action = 'Cerrar',
      dismissible = true,
    } = config;

    const positionConfig = this.getPositionConfig(position);
    const panelClass = this.getPanelClass(type);

    this.snackBar.open(message, dismissible ? action : undefined, {
      duration,
      horizontalPosition: positionConfig.horizontal,
      verticalPosition: positionConfig.vertical,
      panelClass,
    });
  }

  /**
   * Muestra una notificación de éxito
   */
  success(message: string, duration?: number): void {
    this.show({
      message,
      type: NotificationType.SUCCESS,
      duration: duration || NOTIFICATION_DURATION.MEDIUM,
    });
  }

  /**
   * Muestra una notificación de error
   */
  error(message: string, duration?: number): void {
    this.show({
      message,
      type: NotificationType.ERROR,
      duration: duration || NOTIFICATION_DURATION.LONG,
    });
  }

  /**
   * Muestra una notificación de advertencia
   */
  warning(message: string, duration?: number): void {
    this.show({
      message,
      type: NotificationType.WARNING,
      duration: duration || NOTIFICATION_DURATION.MEDIUM,
    });
  }

  /**
   * Muestra una notificación informativa
   */
  info(message: string, duration?: number): void {
    this.show({
      message,
      type: NotificationType.INFO,
      duration: duration || NOTIFICATION_DURATION.MEDIUM,
    });
  }

  /**
   * Cierra todas las notificaciones activas
   */
  dismissAll(): void {
    this.snackBar.dismiss();
  }

  /**
   * Convierte la posición personalizada a formato de Material
   */
  private getPositionConfig(position: NotificationPosition): {
    horizontal: MatSnackBarHorizontalPosition;
    vertical: MatSnackBarVerticalPosition;
  } {
    const positionMap: Record<
      NotificationPosition,
      {
        horizontal: MatSnackBarHorizontalPosition;
        vertical: MatSnackBarVerticalPosition;
      }
    > = {
      [NotificationPosition.TOP_RIGHT]: { horizontal: 'end', vertical: 'top' },
      [NotificationPosition.TOP_LEFT]: { horizontal: 'start', vertical: 'top' },
      [NotificationPosition.TOP_CENTER]: {
        horizontal: 'center',
        vertical: 'top',
      },
      [NotificationPosition.BOTTOM_RIGHT]: {
        horizontal: 'end',
        vertical: 'bottom',
      },
      [NotificationPosition.BOTTOM_LEFT]: {
        horizontal: 'start',
        vertical: 'bottom',
      },
      [NotificationPosition.BOTTOM_CENTER]: {
        horizontal: 'center',
        vertical: 'bottom',
      },
    };

    return positionMap[position];
  }

  /**
   * Obtiene la clase CSS según el tipo de notificación
   */
  private getPanelClass(type: NotificationType): string[] {
    const baseClass = 'sagim-notification';
    return [baseClass, `${baseClass}--${type}`];
  }
}
