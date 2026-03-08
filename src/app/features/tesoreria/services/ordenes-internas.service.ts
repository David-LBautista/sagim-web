import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import {
  OrdenInterna,
  CrearOrdenInternaDto,
  CrearOrdenInternaResponse,
  ListarOrdenInternaResponse,
  FiltrosOrdenInterna,
  CobrarOrdenDto,
} from '../models/ordenes-internas.model';
import { environment } from '../../../../environments/environment';
import { ApiEndpoints } from '../../../core/enums/api-endpoints.enum';

@Injectable({ providedIn: 'root' })
export class OrdenesInternasService {
  private http = inject(HttpClient);

  /** Lista órdenes internas con filtros opcionales */
  getOrdenes(filtros: FiltrosOrdenInterna = {}): Observable<OrdenInterna[]> {
    const url = `${environment.apiUrl}${ApiEndpoints.TESORERIA_ORDENES_INTERNAS_LIST}`;
    let params = new HttpParams();
    if (filtros.estado) params = params.set('estado', filtros.estado);
    if (filtros.areaResponsable)
      params = params.set('areaResponsable', filtros.areaResponsable);
    if (filtros.ciudadanoId)
      params = params.set('ciudadanoId', filtros.ciudadanoId);
    if (filtros.busqueda?.trim())
      params = params.set('busqueda', filtros.busqueda.trim());
    if (filtros.fechaDesde)
      params = params.set('fechaDesde', filtros.fechaDesde);
    if (filtros.fechaHasta)
      params = params.set('fechaHasta', filtros.fechaHasta);
    return this.http
      .get<ListarOrdenInternaResponse>(url, { params })
      .pipe(map((r) => (Array.isArray(r) ? r : (r?.data ?? []))));
  }

  /** Crea una nueva orden interna */
  crearOrden(dto: CrearOrdenInternaDto): Observable<OrdenInterna> {
    const url = `${environment.apiUrl}${ApiEndpoints.TESORERIA_ORDENES_INTERNAS_CREATE}`;
    return this.http
      .post<CrearOrdenInternaResponse>(url, dto)
      .pipe(map((r) => r.data));
  }

  /** Cancela una orden pendiente */
  cancelarOrden(id: string): Observable<OrdenInterna> {
    const url = `${environment.apiUrl}${ApiEndpoints.TESORERIA_ORDENES_INTERNAS_CANCELAR.replace(
      ':id',
      id,
    )}`;
    return this.http
      .patch<CrearOrdenInternaResponse>(url, {})
      .pipe(map((r) => r.data));
  }

  /** Cobra una orden interna desde caja */
  cobrarOrden(id: string, dto: CobrarOrdenDto): Observable<any> {
    const url = `${environment.apiUrl}${ApiEndpoints.TESORERIA_ORDENES_INTERNAS_COBRAR.replace(
      ':id',
      id,
    )}`;
    return this.http.post(url, dto);
  }
}
