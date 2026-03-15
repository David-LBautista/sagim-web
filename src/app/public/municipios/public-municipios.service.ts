import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { ApiEndpoints } from '../../core/enums/api-endpoints.enum';
import { MunicipioPublico } from '../citas/models/citas-publicas.models';
import { PortalPublicoData } from './portal-publico.models';

@Injectable({ providedIn: 'root' })
export class PublicMunicipiosService {
  private http = inject(HttpClient);

  /** Carga todo el portal en una sola llamada */
  getPortal(slug: string): Observable<PortalPublicoData> {
    const url = `${environment.apiUrl}${ApiEndpoints.PUBLIC_PORTAL.replace(':slug', slug)}`;
    return this.http.get<PortalPublicoData>(url);
  }

  /** @deprecated Usar getPortal() */
  getBySlug(slug: string): Observable<MunicipioPublico> {
    const url = `${environment.apiUrl}${ApiEndpoints.PUBLIC_MUNICIPIO_INFO.replace(':slug', slug)}`;
    return this.http
      .get<MunicipioPublico>(url)
      .pipe(catchError(() => of({ nombre: slug, slug })));
  }
}
