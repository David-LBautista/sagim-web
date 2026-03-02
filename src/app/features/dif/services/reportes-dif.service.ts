import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { ApiEndpoints } from '../../../core/enums/api-endpoints.enum';
import type {
  GenerarReporteDto,
  GenerarReporteResponse,
} from '../models/reportes-dif.model';

@Injectable({ providedIn: 'root' })
export class ReportesDifService {
  private http = inject(HttpClient);

  generar(dto: GenerarReporteDto): Observable<GenerarReporteResponse> {
    return this.http.post<GenerarReporteResponse>(
      `${environment.apiUrl}${ApiEndpoints.DIF_REPORTES_GENERAR}`,
      dto,
    );
  }
}
