import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { ApiEndpoints } from '../../../core/enums/api-endpoints.enum';
import type {
  Beneficiario,
  BeneficiarioCreateDto,
  BeneficiarioDetalle,
  BeneficiariosListResponse,
} from '../models/beneficiarios.model';

export interface BeneficiariosQueryParams {
  search?: string;
  sexo?: string;
  activo?: boolean;
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

  getBeneficiarios(
    params?: BeneficiariosQueryParams,
  ): Observable<BeneficiariosListResponse> {
    const url = `${environment.apiUrl}${ApiEndpoints.DIF_BENEFICIARIOS_LIST}`;

    let httpParams = new HttpParams();
    if (params?.search) httpParams = httpParams.set('search', params.search);
    if (params?.sexo) httpParams = httpParams.set('sexo', params.sexo);
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

  getBeneficiarioByCurp(
    curp: string,
    page = 1,
    limit = 10,
  ): Observable<BeneficiarioDetalle> {
    const url = `${environment.apiUrl}${ApiEndpoints.DIF_BENEFICIARIOS_GET_BY_CURP.replace(':curp', encodeURIComponent(curp))}`;
    const httpParams = new HttpParams()
      .set('page', String(page))
      .set('limit', String(limit));
    return this.http.get<BeneficiarioDetalle>(url, { params: httpParams });
  }
}
