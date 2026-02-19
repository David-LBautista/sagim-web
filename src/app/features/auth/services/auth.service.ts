import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import {
  BehaviorSubject,
  Observable,
  tap,
  map,
  of,
  delay,
  catchError,
  throwError,
} from 'rxjs';
import { Router } from '@angular/router';
import { environment } from '../../../../environments/environment';
import { ApiEndpoints } from '../../../core/enums/api-endpoints.enum';
import {
  LoginRequest,
  LoginResponse,
  RefreshTokenResponse,
  User,
} from '../models/auth.model';
import {
  APP_MODULES,
  AppModulo,
} from '../../../core/modules/app.modules.registry';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);

  private readonly TOKEN_KEY = 'sagim_access_token';
  private readonly REFRESH_TOKEN_KEY = 'sagim_refresh_token';
  private readonly USER_KEY = 'sagim_user';
  private readonly MODULOS_KEY = 'sagim_modulos';
  private readonly PERMISOS_KEY = 'sagim_permisos';
  private readonly MUNICIPIO_KEY = 'sagim_municipio';

  // Estado de autenticación
  private currentUserSubject = new BehaviorSubject<User | null>(
    this.getUserFromStorage(),
  );
  public currentUser$ = this.currentUserSubject.asObservable();

  private isAuthenticatedSubject = new BehaviorSubject<boolean>(
    this.hasToken(),
  );
  public isAuthenticated$ = this.isAuthenticatedSubject.asObservable();

  constructor() {}

  /**
   * Login de usuario
   */
  login(credentials: LoginRequest): Observable<LoginResponse> {
    const url = `${environment.apiUrl}${ApiEndpoints.AUTH_LOGIN}`;

    return this.http.post<LoginResponse>(url, credentials).pipe(
      tap((response) => {
        this.setSession(response);
      }),
    );
  }

  /**
   * Obtener ruta de dashboard según el rol del usuario
   */
  getDashboardRouteByRole(rol: string): string {
    const roleLower = rol.toLowerCase();

    switch (roleLower) {
      case 'dif':
        return '/dif/dashboard';
      case 'tesoreria':
        return '/tesoreria/dashboard';
      case 'admin':
        return '/dif/dashboard'; // El admin puede ver todos, por defecto DIF
      default:
        return '/dif/dashboard'; // Ruta por defecto
    }
  }

  /**
   * Logout de usuario
   */
  logout(): Observable<any> {
    const url = `${environment.apiUrl}${ApiEndpoints.AUTH_LOGOUT}`;

    return this.http.post(url, {}).pipe(
      tap(() => {
        this.clearSession();
        this.router.navigate(['/login']);
      }),
    );
  }

  /**
   * Renovar token de acceso
   */
  refreshToken(): Observable<RefreshTokenResponse> {
    const url = `${environment.apiUrl}${ApiEndpoints.AUTH_REFRESH}`;
    const refreshToken = this.getRefreshToken();

    return this.http.post<RefreshTokenResponse>(url, { refreshToken }).pipe(
      tap((response) => {
        this.setAccessToken(response.accessToken);
        this.setRefreshToken(response.refreshToken);
      }),
    );
  }

  /**
   * Guardar sesión en localStorage
   */
  private setSession(authResult: LoginResponse): void {
    this.setAccessToken(authResult.accessToken);
    this.setRefreshToken(authResult.refreshToken);
    this.setUser(authResult.user);
    this.setModulos(authResult.modulos);
    this.setPermisos(authResult.permisos);
    if (authResult.municipio) {
      this.setMunicipio(authResult.municipio);
    }

    this.currentUserSubject.next(authResult.user);
    this.isAuthenticatedSubject.next(true);
  }

  /**
   * Limpiar sesión
   */
  clearSession(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.REFRESH_TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);
    localStorage.removeItem(this.MODULOS_KEY);
    localStorage.removeItem(this.PERMISOS_KEY);
    localStorage.removeItem(this.MUNICIPIO_KEY);

    this.currentUserSubject.next(null);
    this.isAuthenticatedSubject.next(false);
  }

  /**
   * Obtener token de acceso
   */
  getAccessToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  /**
   * Obtener refresh token
   */
  getRefreshToken(): string | null {
    return localStorage.getItem(this.REFRESH_TOKEN_KEY);
  }

  /**
   * Obtener ruta de landing según los módulos del usuario
   */
  getLandingRoute(): string {
    const modules = this.getModulos();

    if (!modules.length) {
      return '/no-autorizado';
    }

    const firstModule = modules[0] as AppModulo;
    const moduleConfig = APP_MODULES[firstModule];

    return moduleConfig ? moduleConfig.route : '/no-autorizado';
  }

  /**
   * Obtener usuario actual
   */
  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }

  /**
   * Verificar si el usuario está autenticado
   */
  isAuthenticated(): boolean {
    return this.hasToken();
  }

  /**
   * Obtener módulos habilitados del usuario
   */
  getModulos(): string[] {
    const modulosJson = localStorage.getItem(this.MODULOS_KEY);
    return modulosJson ? JSON.parse(modulosJson) : [];
  }

  /**
   * Obtener permisos del usuario agrupados por módulo
   */
  getPermisos(): Record<string, string[]> {
    const permisosJson = localStorage.getItem(this.PERMISOS_KEY);
    return permisosJson ? JSON.parse(permisosJson) : {};
  }

  /**
   * Obtener información del municipio
   */
  getMunicipioInfo(): { nombre: string; logoUrl: string } | null {
    const municipioJson = localStorage.getItem(this.MUNICIPIO_KEY);
    return municipioJson ? JSON.parse(municipioJson) : null;
  }

  /**
   * Métodos privados de almacenamiento
   */
  private setAccessToken(token: string): void {
    localStorage.setItem(this.TOKEN_KEY, token);
  }

  private setRefreshToken(token: string): void {
    localStorage.setItem(this.REFRESH_TOKEN_KEY, token);
  }

  private setUser(user: User): void {
    localStorage.setItem(this.USER_KEY, JSON.stringify(user));
  }

  private setModulos(modulos: string[]): void {
    localStorage.setItem(this.MODULOS_KEY, JSON.stringify(modulos));
  }

  private setPermisos(permisos: Record<string, string[]>): void {
    localStorage.setItem(this.PERMISOS_KEY, JSON.stringify(permisos));
  }

  private setMunicipio(municipio: { nombre: string; logoUrl: string }): void {
    localStorage.setItem(this.MUNICIPIO_KEY, JSON.stringify(municipio));
  }

  private getUserFromStorage(): User | null {
    const userJson = localStorage.getItem(this.USER_KEY);
    return userJson ? JSON.parse(userJson) : null;
  }

  private hasToken(): boolean {
    return !!this.getAccessToken();
  }
}
