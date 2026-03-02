import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { ApiEndpoints } from '../../../core/enums/api-endpoints.enum';
import type {
  Apoyo,
  ApoyoCreateDto,
  ApoyosListResponse,
  ApoyosDashboard,
  Programa,
  TipoApoyo,
} from '../models/apoyos.model';

export interface ApoyosQueryParams {
  search?: string;
  programaId?: string;
  tipoApoyoId?: string;
  estatus?: string;
  fechaInicio?: string;
  fechaFin?: string;
  montoMin?: number;
  montoMax?: number;
  creadoPor?: string;
  page?: number;
  limit?: number;
}

@Injectable({
  providedIn: 'root',
})
export class ApoyosService {
  private http = inject(HttpClient);

  getApoyos(params?: ApoyosQueryParams): Observable<ApoyosListResponse> {
    const url = `${environment.apiUrl}${ApiEndpoints.DIF_APOYOS_LIST}`;
    let httpParams = new HttpParams();
    if (params?.search) httpParams = httpParams.set('search', params.search);
    if (params?.programaId)
      httpParams = httpParams.set('programaId', params.programaId);
    if (params?.tipoApoyoId)
      httpParams = httpParams.set('tipoApoyoId', params.tipoApoyoId);
    if (params?.estatus) httpParams = httpParams.set('estatus', params.estatus);
    if (params?.fechaInicio)
      httpParams = httpParams.set('fechaInicio', params.fechaInicio);
    if (params?.fechaFin)
      httpParams = httpParams.set('fechaFin', params.fechaFin);
    if (params?.montoMin != null)
      httpParams = httpParams.set('montoMin', String(params.montoMin));
    if (params?.montoMax != null)
      httpParams = httpParams.set('montoMax', String(params.montoMax));
    if (params?.creadoPor)
      httpParams = httpParams.set('creadoPor', params.creadoPor);
    if (params?.page) httpParams = httpParams.set('page', String(params.page));
    if (params?.limit)
      httpParams = httpParams.set('limit', String(params.limit));
    return this.http.get<ApoyosListResponse>(url, { params: httpParams });
  }

  createApoyo(data: ApoyoCreateDto): Observable<Apoyo> {
    const url = `${environment.apiUrl}${ApiEndpoints.DIF_APOYOS_CREATE}`;
    return this.http.post<Apoyo>(url, data);
  }

  getApoyoById(id: string): Observable<Apoyo> {
    const url = `${environment.apiUrl}${ApiEndpoints.DIF_APOYOS_GET}`.replace(
      ':id',
      id,
    );
    return this.http.get<Apoyo>(url);
  }

  updateApoyo(id: string, data: Partial<ApoyoCreateDto>): Observable<Apoyo> {
    const url =
      `${environment.apiUrl}${ApiEndpoints.DIF_APOYOS_UPDATE}`.replace(
        ':id',
        id,
      );
    return this.http.patch<Apoyo>(url, data);
  }

  getDashboard(): Observable<ApoyosDashboard> {
    const url = `${environment.apiUrl}${ApiEndpoints.DIF_APOYOS_DASHBOARD}`;
    return this.http.get<ApoyosDashboard>(url);
  }

  getProgramas(): Observable<Programa[]> {
    const url = `${environment.apiUrl}${ApiEndpoints.DIF_PROGRAMAS_LIST}`;
    return this.http.get<Programa[]>(url);
  }

  getTiposApoyo(): Observable<TipoApoyo[]> {
    const url = `${environment.apiUrl}${ApiEndpoints.DIF_TIPOS_APOYO_LIST}`;
    return this.http.get<TipoApoyo[]>(url);
  }
}
