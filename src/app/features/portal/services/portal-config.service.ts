import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { ApiEndpoints } from '../../../core/enums/api-endpoints.enum';
import {
  PortalPublicoData,
  PortalGeneral,
  PortalApariencia,
  PortalRedesSociales,
  PortalFooter,
  PortalAviso,
} from '../../../public/municipios/portal-publico.models';

@Injectable({ providedIn: 'root' })
export class PortalConfigService {
  private http = inject(HttpClient);

  private url(endpoint: ApiEndpoints): string {
    return `${environment.apiUrl}${endpoint}`;
  }

  getConfiguracion(): Observable<PortalPublicoData> {
    return this.http.get<PortalPublicoData>(
      this.url(ApiEndpoints.PORTAL_CONFIG_GET),
    );
  }

  patchGeneral(data: Partial<PortalGeneral>): Observable<PortalGeneral> {
    return this.http.patch<PortalGeneral>(
      this.url(ApiEndpoints.PORTAL_CONFIG_GENERAL),
      data,
    );
  }

  patchApariencia(
    data: Partial<PortalApariencia>,
  ): Observable<PortalApariencia> {
    return this.http.patch<PortalApariencia>(
      this.url(ApiEndpoints.PORTAL_CONFIG_APARIENCIA),
      data,
    );
  }

  uploadBanner(file: File): Observable<{ bannerUrl: string }> {
    const form = new FormData();
    form.append('banner', file);
    return this.http.post<{ bannerUrl: string }>(
      this.url(ApiEndpoints.PORTAL_CONFIG_BANNER),
      form,
    );
  }

  patchRedesSociales(
    data: Partial<PortalRedesSociales>,
  ): Observable<PortalRedesSociales> {
    return this.http.patch<PortalRedesSociales>(
      this.url(ApiEndpoints.PORTAL_CONFIG_REDES_SOCIALES),
      data,
    );
  }

  patchFooter(data: Partial<PortalFooter>): Observable<PortalFooter> {
    return this.http.patch<PortalFooter>(
      this.url(ApiEndpoints.PORTAL_CONFIG_FOOTER),
      data,
    );
  }

  // ── Avisos ──────────────────────────────────────────────────────────────

  getAvisos(): Observable<PortalAviso[]> {
    return this.http.get<PortalAviso[]>(
      this.url(ApiEndpoints.PORTAL_AVISOS_LIST),
    );
  }

  createAviso(data: Omit<PortalAviso, '_id'>): Observable<PortalAviso> {
    return this.http.post<PortalAviso>(
      this.url(ApiEndpoints.PORTAL_AVISOS_CREATE),
      data,
    );
  }

  updateAviso(id: string, data: Partial<PortalAviso>): Observable<PortalAviso> {
    return this.http.patch<PortalAviso>(
      this.url(ApiEndpoints.PORTAL_AVISOS_UPDATE).replace(':id', id),
      data,
    );
  }

  deleteAviso(id: string): Observable<void> {
    return this.http.delete<void>(
      this.url(ApiEndpoints.PORTAL_AVISOS_DELETE).replace(':id', id),
    );
  }

  uploadAvisoImagen(id: string, file: File): Observable<{ imagenUrl: string }> {
    const form = new FormData();
    form.append('imagen', file);
    return this.http.post<{ imagenUrl: string }>(
      this.url(ApiEndpoints.PORTAL_AVISOS_IMAGEN).replace(':id', id),
      form,
    );
  }
}
