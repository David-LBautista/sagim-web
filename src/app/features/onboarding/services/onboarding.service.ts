import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { ApiEndpoints } from '../../../core/enums/api-endpoints.enum';
import {
  OnboardingState,
  OnboardingDatosDto,
  OnboardingPadronDto,
} from '../models/onboarding.model';

@Injectable({ providedIn: 'root' })
export class OnboardingService {
  private http = inject(HttpClient);

  private url(endpoint: ApiEndpoints, id: string): string {
    return `${environment.apiUrl}${endpoint}`.replace(':id', id);
  }

  /** GET estado completo */
  getState(municipioId: string): Observable<OnboardingState> {
    return this.http.get<OnboardingState>(
      this.url(ApiEndpoints.ONBOARDING_GET, municipioId),
    );
  }

  /** PATCH paso 1 — datos verificados */
  avanzarDatos(municipioId: string): Observable<OnboardingState> {
    return this.http.patch<OnboardingState>(
      this.url(ApiEndpoints.ONBOARDING_DATOS, municipioId),
      {},
    );
  }

  /** PATCH paso 2 — servicios revisados */
  avanzarServicios(municipioId: string): Observable<OnboardingState> {
    return this.http.patch<OnboardingState>(
      this.url(ApiEndpoints.ONBOARDING_SERVICIOS, municipioId),
      {},
    );
  }

  /** PATCH paso 3 — equipo (≥1 operativo activo requerido) */
  avanzarEquipo(municipioId: string): Observable<OnboardingState> {
    return this.http.patch<OnboardingState>(
      this.url(ApiEndpoints.ONBOARDING_EQUIPO, municipioId),
      {},
    );
  }

  /** PATCH paso 4 — padrón (importado o saltado) */
  avanzarPadron(
    municipioId: string,
    body: OnboardingPadronDto = {},
  ): Observable<OnboardingState> {
    return this.http.patch<OnboardingState>(
      this.url(ApiEndpoints.ONBOARDING_PADRON, municipioId),
      body,
    );
  }

  /** PATCH paso final — marca onboardingCompletado = true */
  completar(municipioId: string): Observable<{ success: boolean }> {
    return this.http.patch<{ success: boolean }>(
      this.url(ApiEndpoints.ONBOARDING_COMPLETAR, municipioId),
      {},
    );
  }
}
