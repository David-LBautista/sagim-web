import { inject } from '@angular/core';
import { Router, type CanActivateFn } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { AppModulo } from '../../../core/modules/app.modules.registry';

/**
 * Guard factory para verificar si el usuario tiene acceso a un módulo específico
 */
export const moduloGuard = (modulo: AppModulo): CanActivateFn => {
  return (route, state) => {
    const authService = inject(AuthService);
    const router = inject(Router);

    // Verificar primero que esté autenticado
    if (!authService.isAuthenticated()) {
      router.navigate(['/login']);
      return false;
    }

    // Obtener módulos habilitados del usuario
    const modulosUsuario = authService.getModulos();

    // Verificar si el usuario tiene acceso al módulo
    const tieneAcceso = modulosUsuario.includes(modulo);

    if (!tieneAcceso) {
      router.navigate(['/no-autorizado']);
      return false;
    }

    return true;
  };
};

/**
 * Guard factory para verificar que el usuario tenga alguno de los roles requeridos
 */
export const roleGuard = (roles: string[]): CanActivateFn => {
  return () => {
    const authService = inject(AuthService);
    const router = inject(Router);

    if (!authService.isAuthenticated()) {
      router.navigate(['/login']);
      return false;
    }

    if (!authService.hasRole(roles)) {
      router.navigate(['/no-autorizado']);
      return false;
    }

    return true;
  };
};

/**
 * Guard legacy para verificar módulo desde route.data
 * @deprecated Usa moduloGuard(modulo) en su lugar
 */
export const moduloGuardLegacy: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (!authService.isAuthenticated()) {
    router.navigate(['/login']);
    return false;
  }

  const moduloRequerido = route.data['modulo'] as string;

  if (!moduloRequerido) {
    return true;
  }

  const modulosUsuario = authService.getModulos();
  const tieneAcceso = modulosUsuario.includes(moduloRequerido);

  if (!tieneAcceso) {
    router.navigate(['/no-autorizado']);
    return false;
  }

  return true;
};
