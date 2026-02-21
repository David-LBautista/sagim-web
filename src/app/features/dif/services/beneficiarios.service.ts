import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { ApiEndpoints } from '../../../core/enums/api-endpoints.enum';
import type {
  Beneficiario,
  BeneficiarioCreateDto,
  BeneficiariosListResponse,
} from '../models/beneficiarios.model';

export interface BeneficiariosQueryParams {
  curp?: string;
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
    if (params?.curp) {
      httpParams = httpParams.set('curp', params.curp);
    }
    if (params?.page) {
      httpParams = httpParams.set('page', params.page.toString());
    }
    if (params?.limit) {
      httpParams = httpParams.set('limit', params.limit.toString());
    }

    return this.http.get<BeneficiariosListResponse>(url, {
      params: httpParams,
    });
  }
}
