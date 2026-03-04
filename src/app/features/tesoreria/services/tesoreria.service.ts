import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  ServicioCobrable,
  HasOverridesResponse,
  CatalogoServiciosResponse,
  ServiciosQueryParams,
  OverrideDto,
  DeleteOverridesResponse,
} from '../models/servicios.model';
import { environment } from '../../../../environments/environment';
import { ApiEndpoints } from '../../../core/enums/api-endpoints.enum';

@Injectable({
  providedIn: 'root',
})
export class TesoreriaService {
  private http = inject(HttpClient);

  /** Verifica si hay overrides activos en el municipio actual */
  hasOverrides(): Observable<HasOverridesResponse> {
    const url = `${environment.apiUrl}${ApiEndpoints.TESORERIA_SERVICIOS_HAS_OVERRIDES}`;
    return this.http.get<HasOverridesResponse>(url);
  }

  /** Lista servicios con filtros opcionales */
  getServicios(
    params: ServiciosQueryParams = {},
  ): Observable<ServicioCobrable[]> {
    const url = `${environment.apiUrl}${ApiEndpoints.TESORERIA_SERVICIOS_LIST}`;
    let httpParams = new HttpParams();
    if (params.busqueda)
      httpParams = httpParams.set('busqueda', params.busqueda);
    if (params.categoria)
      httpParams = httpParams.set('categoria', params.categoria);
    if (params.soloPersonalizados)
      httpParams = httpParams.set('soloPersonalizados', 'true');
    return this.http.get<ServicioCobrable[]>(url, { params: httpParams });
  }

  /** Catálogo de categorías disponibles */
  getCatalogo(): Observable<CatalogoServiciosResponse> {
    const url = `${environment.apiUrl}${ApiEndpoints.TESORERIA_SERVICIOS_CATALOGO}`;
    return this.http.get<CatalogoServiciosResponse>(url);
  }

  /** Crea o actualiza un override para una clave */
  patchOverride(clave: string, dto: OverrideDto): Observable<ServicioCobrable> {
    const url =
      `${environment.apiUrl}${ApiEndpoints.TESORERIA_SERVICIOS_OVERRIDE_PATCH}`.replace(
        ':clave',
        clave,
      );
    return this.http.patch<ServicioCobrable>(url, dto);
  }

  /** Elimina el override de una clave (restaura valores por defecto) */
  deleteOverride(clave: string): Observable<void> {
    const url =
      `${environment.apiUrl}${ApiEndpoints.TESORERIA_SERVICIOS_OVERRIDE_DELETE}`.replace(
        ':clave',
        clave,
      );
    return this.http.delete<void>(url);
  }

  /** Elimina todos los overrides del municipio actual */
  deleteAllOverrides(): Observable<DeleteOverridesResponse> {
    const url = `${environment.apiUrl}${ApiEndpoints.TESORERIA_SERVICIOS_OVERRIDES_DELETE_ALL}`;
    return this.http.delete<DeleteOverridesResponse>(url);
  }
}
