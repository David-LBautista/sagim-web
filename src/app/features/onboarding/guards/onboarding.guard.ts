import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../../auth/services/auth.service';

/**
 * Guard para la ruta /onboarding.
 * Solo permite el acceso si el usuario está autenticado.
 * Si no está autenticado redirige a /login.
 */
export const onboardingGuard: CanActivateFn = (_route, _state) => {
  const auth = inject(AuthService);
  const router = inject(Router);

  if (!auth.isAuthenticated()) {
    router.navigate(['/login']);
    return false;
  }

  return true;
};
