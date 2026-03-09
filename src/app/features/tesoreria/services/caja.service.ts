import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  ServicioCajaItem,
  CiudadanoSearchResult,
  CiudadanoCreateDto,
  PagoCajaDto,
  PagoCajaResponse,
  ReciboUrlResponse,
  ReporteDiarioResponse,
  ReporteDiarioPdfResponse,
  ReporteMensualResponse,
  ReporteServicioResponse,
} from '../models/caja.model';
import { environment } from '../../../../environments/environment';
import { ApiEndpoints } from '../../../core/enums/api-endpoints.enum';

@Injectable({ providedIn: 'root' })
export class CajaService {
  private http = inject(HttpClient);

  /** Carga todos los servicios activos para el autocompletado local */
  getServiciosActivos(): Observable<ServicioCajaItem[]> {
    const url = `${environment.apiUrl}${ApiEndpoints.TESORERIA_SERVICIOS_LIST}`;
    const params = new HttpParams().set('activo', 'true');
    return this.http.get<ServicioCajaItem[]>(url, { params });
  }

  /** Búsqueda de ciudadanos con debounce en frontend */
  buscarCiudadanos(busqueda: string): Observable<CiudadanoSearchResult[]> {
    const url = `${environment.apiUrl}${ApiEndpoints.CIUDADANOS_LIST}`;
    const params = new HttpParams().set('busqueda', busqueda);
    return this.http.get<CiudadanoSearchResult[]>(url, { params });
  }

  /** Registra un nuevo ciudadano */
  crearCiudadano(dto: CiudadanoCreateDto): Observable<CiudadanoSearchResult> {
    const url = `${environment.apiUrl}${ApiEndpoints.CIUDADANOS_CREATE}`;
    return this.http.post<CiudadanoSearchResult>(url, dto);
  }

  /** Registra un cobro en caja */
  registrarCobro(dto: PagoCajaDto): Observable<PagoCajaResponse> {
    const url = `${environment.apiUrl}${ApiEndpoints.TESORERIA_PAGOS_CAJA}`;
    return this.http.post<PagoCajaResponse>(url, dto);
  }

  /** Carga el reporte diario con detalle */
  getReporteDiario(): Observable<ReporteDiarioResponse> {
    const url = `${environment.apiUrl}${ApiEndpoints.TESORERIA_REPORTE_DIARIO}`;
    const params = new HttpParams().set('detalle', 'true');
    return this.http.get<ReporteDiarioResponse>(url, { params });
  }

  /** Genera una nueva signed URL para reimprimir el recibo */
  getReciboUrl(id: string): Observable<ReciboUrlResponse> {
    const url = `${environment.apiUrl}${ApiEndpoints.TESORERIA_PAGOS_CAJA_RECIBO.replace(':id', id)}`;
    return this.http.get<ReciboUrlResponse>(url);
  }

  /** Genera el PDF de corte del día y devuelve la signed URL */
  getReporteDiarioPdf(fecha?: string): Observable<ReporteDiarioPdfResponse> {
    const url = `${environment.apiUrl}${ApiEndpoints.TESORERIA_CORTE_DIA_PDF}`;
    let params = new HttpParams();
    if (fecha) params = params.set('fecha', fecha);
    return this.http.get<ReporteDiarioPdfResponse>(url, { params });
  }

  /** Obtiene el resumen de ingresos de un mes completo */
  getReporteMensual(
    mes: number,
    anio: number,
  ): Observable<ReporteMensualResponse> {
    const url = `${environment.apiUrl}${ApiEndpoints.TESORERIA_REPORTE_MENSUAL}`;
    const params = new HttpParams().set('mes', mes).set('año', anio);
    return this.http.get<ReporteMensualResponse>(url, { params });
  }

  /** Genera el PDF del reporte mensual y devuelve la signed URL */
  getReporteMensualPdf(
    mes: number,
    anio: number,
  ): Observable<ReporteDiarioPdfResponse> {
    const url = `${environment.apiUrl}${ApiEndpoints.TESORERIA_REPORTE_MENSUAL_PDF}`;
    const params = new HttpParams().set('mes', mes).set('año', anio);
    return this.http.get<ReporteDiarioPdfResponse>(url, { params });
  }

  /** Obtiene estadísticas históricas de un servicio */
  getReporteServicio(servicioId: string): Observable<ReporteServicioResponse> {
    const url =
      `${environment.apiUrl}${ApiEndpoints.TESORERIA_REPORTE_SERVICIO}`.replace(
        ':servicioId',
        servicioId,
      );
    return this.http.get<ReporteServicioResponse>(url);
  }

  /** Genera el PDF de historial de un servicio y devuelve la signed URL */
  getReporteServicioPdf(
    servicioId: string,
  ): Observable<ReporteDiarioPdfResponse> {
    const url =
      `${environment.apiUrl}${ApiEndpoints.TESORERIA_REPORTE_SERVICIO_PDF}`.replace(
        ':servicioId',
        servicioId,
      );
    return this.http.get<ReporteDiarioPdfResponse>(url);
  }
}
