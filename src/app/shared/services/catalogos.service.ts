import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiEndpoints } from '../../core/enums/api-endpoints.enum';
import {
  Estado,
  MunicipioCatalogo,
  Rol,
  UnidadMedidaCatalogo,
  TipoMovimientoCatalogo,
  GrupoVulnerableCatalogo,
  TipoApoyoCatalogo,
  LocalidadCatalogo,
} from '../models/catalogo.model';

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

  /**
   * Obtener catálogo de unidades de medida
   */
  getUnidadesMedida(): Observable<UnidadMedidaCatalogo[]> {
    const url = `${environment.apiUrl}${ApiEndpoints.CATALOGOS_UNIDADES_MEDIDA}`;
    return this.http.get<UnidadMedidaCatalogo[]>(url);
  }

  /**
   * Obtener unidad de medida por clave
   */
  getUnidadMedidaPorClave(clave: string): Observable<UnidadMedidaCatalogo> {
    const url =
      `${environment.apiUrl}${ApiEndpoints.CATALOGOS_UNIDAD_MEDIDA_POR_CLAVE}`.replace(
        ':clave',
        clave,
      );
    return this.http.get<UnidadMedidaCatalogo>(url);
  }

  /**
   * Obtener catálogo de tipos de movimiento
   */
  getTiposMovimiento(): Observable<TipoMovimientoCatalogo[]> {
    const url = `${environment.apiUrl}${ApiEndpoints.CATALOGOS_TIPOS_MOVIMIENTO}`;
    return this.http.get<TipoMovimientoCatalogo[]>(url);
  }

  /**
   * Obtener tipo de movimiento por clave
   */
  getTipoMovimientoPorClave(clave: string): Observable<TipoMovimientoCatalogo> {
    const url =
      `${environment.apiUrl}${ApiEndpoints.CATALOGOS_TIPO_MOVIMIENTO_POR_CLAVE}`.replace(
        ':clave',
        clave,
      );
    return this.http.get<TipoMovimientoCatalogo>(url);
  }

  /**
   * Obtener catálogo de grupos vulnerables
   */
  getGruposVulnerables(): Observable<GrupoVulnerableCatalogo[]> {
    const url = `${environment.apiUrl}${ApiEndpoints.CATALOGOS_GRUPOS_VULNERABLES}`;
    return this.http.get<GrupoVulnerableCatalogo[]>(url);
  }

  /**
   * Obtener grupo vulnerable por clave
   */
  getGrupoVulnerablePorClave(
    clave: string,
  ): Observable<GrupoVulnerableCatalogo> {
    const url =
      `${environment.apiUrl}${ApiEndpoints.CATALOGOS_GRUPO_VULNERABLE_POR_CLAVE}`.replace(
        ':clave',
        clave,
      );
    return this.http.get<GrupoVulnerableCatalogo>(url);
  }

  /**
   * Obtener catálogo de tipos de apoyo
   */
  getTiposApoyo(): Observable<TipoApoyoCatalogo[]> {
    const url = `${environment.apiUrl}${ApiEndpoints.CATALOGOS_TIPOS_APOYO}`;
    return this.http.get<TipoApoyoCatalogo[]>(url);
  }

  /**
   * Obtener tipo de apoyo por clave
   */
  getTipoApoyoPorClave(clave: string): Observable<TipoApoyoCatalogo> {
    const url =
      `${environment.apiUrl}${ApiEndpoints.CATALOGOS_TIPO_APOYO_POR_CLAVE}`.replace(
        ':clave',
        clave,
      );
    return this.http.get<TipoApoyoCatalogo>(url);
  }

  /**
   * Obtener localidades por municipio
   */
  getLocalidadesPorMunicipio(
    municipioId: string,
  ): Observable<LocalidadCatalogo[]> {
    const url =
      `${environment.apiUrl}${ApiEndpoints.CATALOGOS_LOCALIDADES_POR_MUNICIPIO}`.replace(
        ':municipioId',
        municipioId,
      );
    return this.http.get<LocalidadCatalogo[]>(url);
  }
}
