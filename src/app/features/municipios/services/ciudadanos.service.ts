import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { ApiEndpoints } from '../../../core/enums/api-endpoints.enum';
import {
  Ciudadano,
  CiudadanoCreateDto,
  CiudadanoResumen,
  CiudadanoUpdateDto,
  CiudadanosEstadisticas,
  CiudadanosListParams,
  CiudadanosListResponse,
  DesactivarCiudadanoResponse,
  ImportarPadronParams,
  ImportarPadronResponse,
} from '../models/ciudadano.model';

@Injectable({
  providedIn: 'root',
})
export class CiudadanosService {
  private http = inject(HttpClient);

  // ----------------------------------------------------------------
  // Listado paginado
  // ----------------------------------------------------------------

  /**
   * GET /ciudadanos?page=&limit=&busqueda=&localidad=&activo=
   */
  getCiudadanos(
    params: CiudadanosListParams,
  ): Observable<CiudadanosListResponse> {
    const url = `${environment.apiUrl}${ApiEndpoints.CIUDADANOS_LIST}`;
    let httpParams = new HttpParams();

    if (params.page !== undefined)
      httpParams = httpParams.set('page', params.page);
    if (params.limit !== undefined)
      httpParams = httpParams.set('limit', params.limit);
    if (params.busqueda)
      httpParams = httpParams.set('busqueda', params.busqueda);
    if (params.localidad)
      httpParams = httpParams.set('localidad', params.localidad);
    if (params.activo !== undefined)
      httpParams = httpParams.set('activo', String(params.activo));

    return this.http.get<CiudadanosListResponse>(url, { params: httpParams });
  }

  // ----------------------------------------------------------------
  // Autocomplete (sin page/limit — máx 15 resultados)
  // ----------------------------------------------------------------

  /**
   * GET /ciudadanos?busqueda=
   */
  buscarCiudadanos(busqueda: string): Observable<CiudadanoResumen[]> {
    const url = `${environment.apiUrl}${ApiEndpoints.CIUDADANOS_LIST}`;
    const params = new HttpParams().set('busqueda', busqueda);
    return this.http.get<CiudadanoResumen[]>(url, { params });
  }

  // ----------------------------------------------------------------
  // Búsqueda por CURP
  // ----------------------------------------------------------------

  /**
   * GET /ciudadanos?curp=
   */
  getCiudadanoByCurp(curp: string): Observable<Ciudadano> {
    const url = `${environment.apiUrl}${ApiEndpoints.CIUDADANOS_LIST}`;
    const params = new HttpParams().set('curp', curp);
    return this.http.get<Ciudadano>(url, { params });
  }

  // ----------------------------------------------------------------
  // Detalle por ID
  // ----------------------------------------------------------------

  /**
   * GET /ciudadanos/:id
   */
  getCiudadanoById(id: string): Observable<Ciudadano> {
    const url = `${environment.apiUrl}${ApiEndpoints.CIUDADANOS_GET}`.replace(
      ':id',
      id,
    );
    return this.http.get<Ciudadano>(url);
  }

  // ----------------------------------------------------------------
  // Estadísticas
  // ----------------------------------------------------------------

  /**
   * GET /ciudadanos/estadisticas
   */
  getEstadisticas(): Observable<CiudadanosEstadisticas> {
    const url = `${environment.apiUrl}${ApiEndpoints.CIUDADANOS_ESTADISTICAS}`;
    return this.http.get<CiudadanosEstadisticas>(url);
  }

  // ----------------------------------------------------------------
  // Exportar (descarga de archivo)
  // ----------------------------------------------------------------

  /**
   * GET /ciudadanos/exportar?busqueda=
   * Devuelve un Blob (xlsx). El componente debe crear un ObjectURL para la descarga.
   */
  exportarPadron(busqueda?: string): Observable<Blob> {
    const url = `${environment.apiUrl}${ApiEndpoints.CIUDADANOS_EXPORTAR}`;
    let params = new HttpParams();
    if (busqueda) params = params.set('busqueda', busqueda);
    return this.http.get(url, { params, responseType: 'blob' });
  }

  // ----------------------------------------------------------------
  // Importar (multipart/form-data)
  // ----------------------------------------------------------------

  /**
   * POST /ciudadanos/importar
   */
  importarPadron(
    importParams: ImportarPadronParams,
  ): Observable<ImportarPadronResponse> {
    const url = `${environment.apiUrl}${ApiEndpoints.CIUDADANOS_IMPORTAR}`;
    const formData = new FormData();
    formData.append('archivo', importParams.archivo);
    formData.append('mapeo', importParams.mapeo);
    if (importParams.accionDuplicados) {
      formData.append('accionDuplicados', importParams.accionDuplicados);
    }
    return this.http.post<ImportarPadronResponse>(url, formData);
  }

  // ----------------------------------------------------------------
  // Crear ciudadano
  // ----------------------------------------------------------------

  /**
   * POST /ciudadanos
   */
  createCiudadano(dto: CiudadanoCreateDto): Observable<Ciudadano> {
    const url = `${environment.apiUrl}${ApiEndpoints.CIUDADANOS_CREATE}`;
    return this.http.post<Ciudadano>(url, dto);
  }

  // ----------------------------------------------------------------
  // Actualizar ciudadano
  // ----------------------------------------------------------------

  /**
   * PATCH /ciudadanos/:id
   */
  updateCiudadano(id: string, dto: CiudadanoUpdateDto): Observable<Ciudadano> {
    const url =
      `${environment.apiUrl}${ApiEndpoints.CIUDADANOS_UPDATE}`.replace(
        ':id',
        id,
      );
    return this.http.patch<Ciudadano>(url, dto);
  }

  // ----------------------------------------------------------------
  // Desactivar ciudadano (baja lógica)
  // ----------------------------------------------------------------

  /**
   * PATCH /ciudadanos/:id/desactivar
   */
  desactivarCiudadano(id: string): Observable<DesactivarCiudadanoResponse> {
    const url =
      `${environment.apiUrl}${ApiEndpoints.CIUDADANOS_DESACTIVAR}`.replace(
        ':id',
        id,
      );
    return this.http.patch<DesactivarCiudadanoResponse>(url, {});
  }
}
