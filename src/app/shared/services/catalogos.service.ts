import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiEndpoints } from '../../core/enums/api-endpoints.enum';
import { Estado, MunicipioCatalogo, Rol } from '../models/catalogo.model';

@Injectable({
  providedIn: 'root',
})
export class CatalogosService {
  private http = inject(HttpClient);

  /**
   * Obtener todos los estados
   */
  getEstados(): Observable<Estado[]> {
    const url = `${environment.apiUrl}${ApiEndpoints.CATALOGOS_ESTADOS}`;
    return this.http.get<Estado[]>(url);
  }

  /**
   * Obtener municipios por estado
   */
  getMunicipiosPorEstado(estadoId: string): Observable<MunicipioCatalogo[]> {
    const url =
      `${environment.apiUrl}${ApiEndpoints.CATALOGOS_MUNICIPIOS_POR_ESTADO}`.replace(
        ':estadoId',
        estadoId,
      );
    return this.http.get<MunicipioCatalogo[]>(url);
  }

  /**
   * Obtener todos los roles disponibles
   */
  getRoles(): Observable<Rol[]> {
    const url = `${environment.apiUrl}${ApiEndpoints.CATALOGOS_ROLES}`;
    return this.http.get<Rol[]>(url);
  }

  /**
   * Obtener todos los módulos disponibles
   */
  getModulos(): Observable<Array<{ _id: string; nombre: string }>> {
    const url = `${environment.apiUrl}${ApiEndpoints.MODULOS_LIST}`;
    return this.http.get<Array<{ _id: string; nombre: string }>>(url);
  }
}
