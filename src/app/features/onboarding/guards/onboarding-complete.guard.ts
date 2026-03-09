import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { catchError, map, of } from 'rxjs';
import { AuthService } from '../../auth/services/auth.service';
import { UserRole } from '../../auth/models/auth.model';
import { OnboardingService } from '../services/onboarding.service';

/**
 * Guard global para el MainLayout.
 * Si el usuario es ADMIN o ADMIN_MUNICIPIO y el onboarding no está completado,
 * redirige a /onboarding antes de permitir el acceso a cualquier ruta protegida.
 */
export const onboardingCompleteGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const onboardingService = inject(OnboardingService);
  const router = inject(Router);

  const user = auth.getCurrentUser();

  // Solo aplica a admins con municipio asignado
  const esAdmin =
    user?.rol === UserRole.ADMIN || user?.rol === UserRole.ADMIN_MUNICIPIO;

  if (!esAdmin || !user?.municipioId) {
    return true;
  }

  return onboardingService.getState(user.municipioId).pipe(
    map((state) => {
      if (!state.onboardingCompletado) {
        return router.createUrlTree(['/onboarding']);
      }
      return true;
    }),
    catchError(() => {
      // Si el endpoint falla no bloqueamos el acceso
      return of(true);
    }),
  );
};
