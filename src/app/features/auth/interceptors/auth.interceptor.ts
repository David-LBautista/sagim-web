import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';
import {
  catchError,
  switchMap,
  throwError,
  BehaviorSubject,
  filter,
  take,
} from 'rxjs';
import { Router } from '@angular/router';

// Variable para controlar si ya se está refrescando el token
let isRefreshing = false;
let refreshTokenSubject: BehaviorSubject<any> = new BehaviorSubject<any>(null);

/**
 * Interceptor para agregar el token JWT a todas las peticiones HTTP
 * Angular 20 usa functional interceptors
 */
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // No agregar token a las peticiones de login y refresh
  const isAuthEndpoint =
    req.url.includes('/auth/login') || req.url.includes('/auth/refresh');

  if (isAuthEndpoint) {
    return next(req);
  }

  // Obtener token de acceso
  const token = authService.getAccessToken();

  // Clonar la petición y agregar el header de autorización
  if (token) {
    req = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`,
      },
    });
  }

  // Manejar la respuesta
  return next(req).pipe(
    catchError((error) => {
      // Si es error 401 (No autorizado), intentar refrescar el token
      if (error.status === 401 && !req.url.includes('/auth/refresh')) {
        // Si ya se está refrescando, esperar a que termine
        if (isRefreshing) {
          return refreshTokenSubject.pipe(
            filter((token) => token !== null),
            take(1),
            switchMap((token) => {
              const retryReq = req.clone({
                setHeaders: {
                  Authorization: `Bearer ${token}`,
                },
              });
              return next(retryReq);
            }),
          );
        }

        // Iniciar el proceso de refresh
        isRefreshing = true;
        refreshTokenSubject.next(null);

        return authService.refreshToken().pipe(
          switchMap(() => {
            // Reintentar la petición original con el nuevo token
            const newToken = authService.getAccessToken();
            isRefreshing = false;
            refreshTokenSubject.next(newToken);

            const retryReq = req.clone({
              setHeaders: {
                Authorization: `Bearer ${newToken}`,
              },
            });
            return next(retryReq);
          }),
          catchError((refreshError) => {
            // Si falla el refresh, cerrar sesión y detener el loop
            isRefreshing = false;
            refreshTokenSubject.next(null);

            // Limpiar sesión localmente sin hacer petición al backend
            authService.clearSession();
            router.navigate(['/login']);

            return throwError(() => refreshError);
          }),
        );
      }

      return throwError(() => error);
    }),
  );
};
