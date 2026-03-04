import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  OrdenPago,
  OrdenPagoMetrics,
  GenerarOrdenDto,
  GenerarOrdenResponse,
  ReenviarLinkResponse,
  ReciboOrdenResponse,
  OrdenFiltros,
} from '../models/ordenes-pago.model';
import { environment } from '../../../../environments/environment';
import { ApiEndpoints } from '../../../core/enums/api-endpoints.enum';

@Injectable({ providedIn: 'root' })
export class OrdenesPagoService {
  private http = inject(HttpClient);

  /** Métricas del encabezado */
  getMetrics(): Observable<OrdenPagoMetrics> {
    const url = `${environment.apiUrl}${ApiEndpoints.TESORERIA_ORDENES_PAGO_METRICS}`;
    return this.http.get<OrdenPagoMetrics>(url);
  }

  /** Lista de órdenes con filtros */
  getOrdenes(filtros: OrdenFiltros = {}): Observable<OrdenPago[]> {
    const url = `${environment.apiUrl}${ApiEndpoints.TESORERIA_ORDENES_PAGO_LIST}`;
    let params = new HttpParams();
    if (filtros.estado) params = params.set('estado', filtros.estado);
    if (filtros.busqueda?.trim())
      params = params.set('busqueda', filtros.busqueda.trim());
    if (filtros.fechaDesde)
      params = params.set('fechaDesde', filtros.fechaDesde);
    if (filtros.fechaHasta)
      params = params.set('fechaHasta', filtros.fechaHasta);
    return this.http.get<OrdenPago[]>(url, { params });
  }

  /** Genera una nueva orden de pago en línea */
  generarOrden(dto: GenerarOrdenDto): Observable<GenerarOrdenResponse> {
    const url = `${environment.apiUrl}${ApiEndpoints.TESORERIA_GENERAR_ORDEN}`;
    return this.http.post<GenerarOrdenResponse>(url, dto);
  }

  /** Cancela una orden pendiente */
  cancelarOrden(id: string): Observable<OrdenPago> {
    const url = `${environment.apiUrl}${ApiEndpoints.TESORERIA_ORDENES_PAGO_CANCELAR.replace(':id', id)}`;
    return this.http.patch<OrdenPago>(url, {});
  }

  /** Reenvía el link de pago al ciudadano */
  reenviarLink(id: string): Observable<ReenviarLinkResponse> {
    const url = `${environment.apiUrl}${ApiEndpoints.TESORERIA_ORDENES_PAGO_REENVIAR.replace(':id', id)}`;
    return this.http.post<ReenviarLinkResponse>(url, {});
  }

  /** Obtiene la URL firmada del recibo de una orden PAGADA */
  getRecibo(pagoId: string): Observable<ReciboOrdenResponse> {
    const url = `${environment.apiUrl}${ApiEndpoints.TESORERIA_PAGO_RECIBO.replace(':pagoId', pagoId)}`;
    return this.http.get<ReciboOrdenResponse>(url);
  }

  /** Construye el link de pago para el ciudadano */
  buildPaymentLink(token: string): string {
    return `${environment.frontendUrl}/pago/${token}`;
  }
}
