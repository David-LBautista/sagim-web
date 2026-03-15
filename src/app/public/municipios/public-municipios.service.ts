import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiEndpoints } from '../../core/enums/api-endpoints.enum';
import { PortalPublicoData } from './portal-publico.models';

@Injectable({ providedIn: 'root' })
export class PublicMunicipiosService {
  private http = inject(HttpClient);

  getPortal(): Observable<PortalPublicoData> {
    const url = `${environment.apiUrl}${ApiEndpoints.PUBLIC_PORTAL}`;
    return this.http.get<PortalPublicoData>(url);
  }
}
