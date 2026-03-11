import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { ApiEndpoints } from '../../../core/enums/api-endpoints.enum';
import type {
  Beneficiario,
  BeneficiarioCreateDto,
  BeneficiarioDetalle,
  BeneficiariosEstadisticas,
  BeneficiariosListResponse,
  ImportarBeneficiariosParams,
  ImportarBeneficiariosResponse,
  ProgramaDIF,
} from '../models/beneficiarios.model';

export interface BeneficiariosQueryParams {
  search?: string;
  sexo?: string;
  activo?: boolean;
  grupoVulnerable?: string;
  fechaInicio?: string;
  fechaFin?: string;
  edadMin?: number;
  edadMax?: number;
  programaId?: string;
  page?: number;
  limit?: number;
}

@Injectable({
  providedIn: 'root',
})
export class BeneficiariosService {
  private http = inject(HttpClient);

  createBeneficiario(data: BeneficiarioCreateDto): Observable<Beneficiario> {
    const url = `${environment.apiUrl}${ApiEndpoints.DIF_BENEFICIARIOS_CREATE}`;
    return this.http.post<Beneficiario>(url, data);
  }

  updateBeneficiario(
    id: string,
    data: Partial<BeneficiarioCreateDto>,
  ): Observable<Beneficiario> {
    const url =
      `${environment.apiUrl}${ApiEndpoints.DIF_BENEFICIARIOS_UPDATE}`.replace(
        ':id',
        id,
      );
    return this.http.patch<Beneficiario>(url, data);
  }

  getBeneficiarios(
    params?: BeneficiariosQueryParams,
  ): Observable<BeneficiariosListResponse> {
    const url = `${environment.apiUrl}${ApiEndpoints.DIF_BENEFICIARIOS_LIST}`;

    let httpParams = new HttpParams();
    if (params?.search) httpParams = httpParams.set('search', params.search);
    if (params?.sexo) httpParams = httpParams.set('sexo', params.sexo);
    if (params?.grupoVulnerable)
      httpParams = httpParams.set('grupoVulnerable', params.grupoVulnerable);
    if (params?.activo !== undefined)
      httpParams = httpParams.set('activo', String(params.activo));
    if (params?.fechaInicio)
      httpParams = httpParams.set('fechaInicio', params.fechaInicio);
    if (params?.fechaFin)
      httpParams = httpParams.set('fechaFin', params.fechaFin);
    if (params?.edadMin != null)
      httpParams = httpParams.set('edadMin', String(params.edadMin));
    if (params?.edadMax != null)
      httpParams = httpParams.set('edadMax', String(params.edadMax));
    if (params?.programaId)
      httpParams = httpParams.set('programaId', params.programaId);
    if (params?.page) httpParams = httpParams.set('page', String(params.page));
    if (params?.limit)
      httpParams = httpParams.set('limit', String(params.limit));

    return this.http.get<BeneficiariosListResponse>(url, {
      params: httpParams,
    });
  }

  getBeneficiarioById(id: string): Observable<Beneficiario> {
    const url =
      `${environment.apiUrl}${ApiEndpoints.DIF_BENEFICIARIOS_GET}`.replace(
        ':id',
        id,
      );
    return this.http.get<Beneficiario>(url);
  }

  getBeneficiarioByCurp(
    curp: string,
    page = 1,
    limit = 3,
  ): Observable<BeneficiarioDetalle> {
    const url = `${environment.apiUrl}${ApiEndpoints.DIF_BENEFICIARIOS_GET_BY_CURP.replace(':curp', encodeURIComponent(curp))}`;
    const httpParams = new HttpParams()
      .set('page', String(page))
      .set('limit', String(limit));
    return this.http.get<BeneficiarioDetalle>(url, { params: httpParams });
  }

  getEstadisticas(): Observable<BeneficiariosEstadisticas> {
    const url = `${environment.apiUrl}${ApiEndpoints.DIF_BENEFICIARIOS_ESTADISTICAS}`;
    return this.http.get<BeneficiariosEstadisticas>(url);
  }

  exportar(params?: BeneficiariosQueryParams): Observable<Blob> {
    const url = `${environment.apiUrl}${ApiEndpoints.DIF_BENEFICIARIOS_EXPORTAR}`;
    let httpParams = new HttpParams();
    if (params?.search) httpParams = httpParams.set('search', params.search);
    if (params?.grupoVulnerable)
      httpParams = httpParams.set('grupoVulnerable', params.grupoVulnerable);
    if (params?.sexo) httpParams = httpParams.set('sexo', params.sexo);
    if (params?.activo !== undefined)
      httpParams = httpParams.set('activo', String(params.activo));
    if (params?.programaId)
      httpParams = httpParams.set('programaId', params.programaId);
    if (params?.edadMin != null)
      httpParams = httpParams.set('edadMin', String(params.edadMin));
    if (params?.edadMax != null)
      httpParams = httpParams.set('edadMax', String(params.edadMax));
    return this.http.get(url, { params: httpParams, responseType: 'blob' });
  }

  importar(
    data: ImportarBeneficiariosParams,
  ): Observable<ImportarBeneficiariosResponse> {
    const url = `${environment.apiUrl}${ApiEndpoints.DIF_BENEFICIARIOS_IMPORTAR}`;
    const formData = new FormData();
    formData.append('archivo', data.archivo);
    formData.append('mapeo', data.mapeo);
    formData.append('accionDuplicados', data.accionDuplicados);
    return this.http.post<ImportarBeneficiariosResponse>(url, formData);
  }

  desactivar(id: string): Observable<{ message: string }> {
    const url =
      `${environment.apiUrl}${ApiEndpoints.DIF_BENEFICIARIOS_DESACTIVAR}`.replace(
        ':id',
        id,
      );
    return this.http.patch<{ message: string }>(url, {});
  }

  getProgramas(): Observable<ProgramaDIF[]> {
    const url = `${environment.apiUrl}${ApiEndpoints.DIF_PROGRAMAS_LIST}`;
    return this.http.get<ProgramaDIF[]>(url);
  }
}
