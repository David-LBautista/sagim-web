import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { ApiEndpoints } from '../../core/enums/api-endpoints.enum';
import { MunicipioPublico } from '../citas/models/citas-publicas.models';

@Injectable({ providedIn: 'root' })
export class PublicMunicipiosService {
  private http = inject(HttpClient);

  getBySlug(slug: string): Observable<MunicipioPublico> {
    const url = `${environment.apiUrl}${ApiEndpoints.PUBLIC_MUNICIPIO_INFO.replace(':slug', slug)}`;
    return this.http
      .get<MunicipioPublico>(url)
      .pipe(catchError(() => of({ nombre: slug, slug })));
  }
}
