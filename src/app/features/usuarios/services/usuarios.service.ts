import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  Usuario,
  UsuarioCreateDto,
  UsuarioUpdateDto,
  UsuariosMetrics,
} from '../models/usuario.model';
import { environment } from '../../../../environments/environment';
import { ApiEndpoints } from '../../../core/enums/api-endpoints.enum';

@Injectable({
  providedIn: 'root',
})
export class UsuariosService {
  private http = inject(HttpClient);

  /**
   * Obtener lista de usuarios con filtros opcionales
   */
  getUsuarios(params?: {
    search?: string;
    rol?: string;
    activo?: boolean;
    municipioId?: number;
  }): Observable<Usuario[]> {
    const url = `${environment.apiUrl}${ApiEndpoints.USERS_LIST}`;
    let httpParams = new HttpParams();

    if (params?.search) {
      httpParams = httpParams.set('search', params.search);
    }
    if (params?.rol) {
      httpParams = httpParams.set('rol', params.rol);
    }
    if (params?.activo !== undefined) {
      httpParams = httpParams.set('activo', params.activo.toString());
    }
    if (params?.municipioId) {
      httpParams = httpParams.set('municipioId', params.municipioId.toString());
    }

    return this.http.get<Usuario[]>(url, { params: httpParams });
  }

  /**
   * Obtener un usuario por ID
   */
  getUsuario(id: string): Observable<Usuario> {
    const url = `${environment.apiUrl}${ApiEndpoints.USERS_GET}`.replace(
      ':id',
      id,
    );
    return this.http.get<Usuario>(url);
  }

  /**
   * Crear un nuevo usuario
   */
  createUsuario(usuario: UsuarioCreateDto): Observable<Usuario> {
    const url = `${environment.apiUrl}${ApiEndpoints.USERS_CREATE}`;
    return this.http.post<Usuario>(url, usuario);
  }

  /**
   * Actualizar un usuario existente
   */
  updateUsuario(id: string, usuario: UsuarioUpdateDto): Observable<Usuario> {
    const url = `${environment.apiUrl}${ApiEndpoints.USERS_UPDATE}`.replace(
      ':id',
      id,
    );
    return this.http.patch<Usuario>(url, usuario);
  }

  /**
   * Eliminar un usuario
   */
  deleteUsuario(id: string): Observable<void> {
    const url = `${environment.apiUrl}${ApiEndpoints.USERS_DELETE}`.replace(
      ':id',
      id,
    );
    return this.http.delete<void>(url);
  }
}
