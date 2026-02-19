import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { ApiEndpoints } from '../../../core/enums/api-endpoints.enum';
import {
  Municipio,
  MunicipioCreateDto,
  MunicipioUpdateDto,
} from '../models/municipio.model';

@Injectable({
  providedIn: 'root',
})
export class MunicipiosService {
  private http = inject(HttpClient);

  /**
   * Obtener todos los municipios
   */
  getMunicipios(): Observable<Municipio[]> {
    const url = `${environment.apiUrl}${ApiEndpoints.MUNICIPIOS_LIST}`;
    return this.http.get<Municipio[]>(url);
  }

  /**
   * Obtener un municipio por ID
   */
  getMunicipioById(id: string): Observable<Municipio> {
    const url = `${environment.apiUrl}${ApiEndpoints.MUNICIPIOS_GET}`.replace(
      ':id',
      id,
    );
    return this.http.get<Municipio>(url);
  }

  /**
   * Crear un nuevo municipio
   */
  createMunicipio(municipio: MunicipioCreateDto): Observable<Municipio> {
    const url = `${environment.apiUrl}${ApiEndpoints.MUNICIPIOS_CREATE}`;
    return this.http.post<Municipio>(url, municipio);
  }

  /**
   * Crear un nuevo municipio con FormData (para subir logo)
   */
  createMunicipioWithFormData(formData: FormData): Observable<Municipio> {
    const url = `${environment.apiUrl}${ApiEndpoints.MUNICIPIOS_CREATE}`;
    return this.http.post<Municipio>(url, formData);
  }

  /**
   * Actualizar un municipio
   */
  updateMunicipio(
    id: string,
    municipio: MunicipioUpdateDto,
  ): Observable<Municipio> {
    const url =
      `${environment.apiUrl}${ApiEndpoints.MUNICIPIOS_UPDATE}`.replace(
        ':id',
        id,
      );
    return this.http.patch<Municipio>(url, municipio);
  }

  /**
   * Eliminar un municipio
   */
  deleteMunicipio(id: string): Observable<void> {
    const url =
      `${environment.apiUrl}${ApiEndpoints.MUNICIPIOS_DELETE}`.replace(
        ':id',
        id,
      );
    return this.http.delete<void>(url);
  }
}
