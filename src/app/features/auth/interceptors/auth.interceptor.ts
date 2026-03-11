import {
  HttpInterceptorFn,
  HttpRequest,
  HttpHandlerFn,
  HttpEvent,
} from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';
import {
  catchError,
  switchMap,
  throwError,
  BehaviorSubject,
  filter,
  take,
  Observable,
} from 'rxjs';
import { Router } from '@angular/router';
import { WebSocketService } from '../../../core/services/websocket.service';

// Variable para controlar si ya se está refrescando el token
let isRefreshing = false;
let refreshTokenSubject: BehaviorSubject<string | null> = new BehaviorSubject<
  string | null
>(null);

function buildRetry(
  req: HttpRequest<unknown>,
  next: HttpHandlerFn,
  token: string | null,
): Observable<HttpEvent<unknown>> {
  const retryReq = req.clone({
    setHeaders: { Authorization: `Bearer ${token}` },
  });
  return next(retryReq);
}

/**
 * Interceptor para agregar el token JWT a todas las peticiones HTTP
 * Angular 20 usa functional interceptors
 */
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const wsService = inject(WebSocketService);

  // No agregar token a las peticiones de login y refresh
  const isAuthEndpoint =
    req.url.includes('/auth/login') || req.url.includes('/auth/refresh');

  if (isAuthEndpoint) {
    return next(req);
  }

  // Obtener token de acceso y clonar la petición
  const token = authService.getAccessToken();
  if (token) {
    req = req.clone({
      setHeaders: { Authorization: `Bearer ${token}` },
    });
  }

  return next(req).pipe(
    catchError((error) => {
      if (error.status !== 401 || req.url.includes('/auth/refresh')) {
        return throwError(() => error);
      }

      // Si ya se está refrescando, esperar a que termine
      if (isRefreshing) {
        return refreshTokenSubject.pipe(
          filter((t): t is string => t !== null),
          take(1),
          switchMap((t) => buildRetry(req, next, t)),
        );
      }

      // Iniciar el proceso de refresh
      isRefreshing = true;
      refreshTokenSubject.next(null);

      return authService.refreshToken().pipe(
        switchMap(handleRefreshSuccess),
        catchError((refreshError) => {
          isRefreshing = false;
          refreshTokenSubject.next(null);
          authService.clearSession();
          router.navigate(['/login']);
          return throwError(() => refreshError);
        }),
      );

      function handleRefreshSuccess(): Observable<HttpEvent<unknown>> {
        const newToken = authService.getAccessToken();
        isRefreshing = false;
        refreshTokenSubject.next(newToken);
        if (newToken) {
          wsService.updateToken(newToken);
        }
        return buildRetry(req, next, newToken);
      }
    }),
  );
};
