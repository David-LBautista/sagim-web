import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { ApiEndpoints } from '../../../core/enums/api-endpoints.enum';
import {
  Reporte,
  PaginatedReportes,
  FiltrosReportes,
  MisReportesResponse,
  MetricasReportes,
  ConfiguracionReportes,
  CatalogoCategoriaReporte,
  CrearReporteInternoDto,
  CambiarEstadoReporteDto,
  AsignarReporteDto,
  CambiarPrioridadDto,
  CambiarVisibilidadDto,
  ActualizarConfigReportesDto,
} from '../models/reportes.model';

@Injectable({ providedIn: 'root' })
export class ReportesService {
  private http = inject(HttpClient);

  // ─── Listado paginado ─────────────────────────────────────────────────────
  getReportes(filtros: FiltrosReportes = {}): Observable<PaginatedReportes> {
    const url = `${environment.apiUrl}${ApiEndpoints.REPORTES_LIST}`;
    let params = new HttpParams();
    if (filtros.categoria) params = params.set('categoria', filtros.categoria);
    if (filtros.estado) params = params.set('estado', filtros.estado);
    if (filtros.modulo) params = params.set('modulo', filtros.modulo);
    if (filtros.prioridad) params = params.set('prioridad', filtros.prioridad);
    if (filtros.origen) params = params.set('origen', filtros.origen);
    if (filtros.asignadoA) params = params.set('asignadoA', filtros.asignadoA);
    if (filtros.fechaInicio)
      params = params.set('fechaInicio', filtros.fechaInicio);
    if (filtros.fechaFin) params = params.set('fechaFin', filtros.fechaFin);
    if (filtros.buscar) params = params.set('buscar', filtros.buscar);
    if (filtros.page != null) params = params.set('page', String(filtros.page));
    if (filtros.limit != null)
      params = params.set('limit', String(filtros.limit));
    return this.http.get<PaginatedReportes>(url, { params });
  }

  // ─── Mis reportes asignados ───────────────────────────────────────────────
  getMisReportes(estado?: string): Observable<MisReportesResponse> {
    const url = `${environment.apiUrl}${ApiEndpoints.REPORTES_MIS_REPORTES}`;
    let params = new HttpParams();
    if (estado) params = params.set('estado', estado);
    return this.http.get<MisReportesResponse>(url, { params });
  }

  // ─── Detalle de un reporte ────────────────────────────────────────────────
  getReporte(id: string): Observable<Reporte> {
    const url = `${environment.apiUrl}${ApiEndpoints.REPORTES_GET}`.replace(
      ':id',
      id,
    );
    return this.http.get<Reporte>(url);
  }

  // ─── Crear reporte interno ────────────────────────────────────────────────
  crearReporte(dto: CrearReporteInternoDto): Observable<Reporte> {
    const url = `${environment.apiUrl}${ApiEndpoints.REPORTES_CREATE}`;
    return this.http.post<Reporte>(url, dto);
  }

  // ─── Cambiar estado ───────────────────────────────────────────────────────
  cambiarEstado(id: string, dto: CambiarEstadoReporteDto): Observable<Reporte> {
    const url =
      `${environment.apiUrl}${ApiEndpoints.REPORTES_CAMBIAR_ESTADO}`.replace(
        ':id',
        id,
      );
    return this.http.patch<Reporte>(url, dto);
  }

  // ─── Asignar a funcionario ────────────────────────────────────────────────
  asignar(id: string, dto: AsignarReporteDto): Observable<Reporte> {
    const url = `${environment.apiUrl}${ApiEndpoints.REPORTES_ASIGNAR}`.replace(
      ':id',
      id,
    );
    return this.http.patch<Reporte>(url, dto);
  }

  // ─── Cambiar prioridad ────────────────────────────────────────────────────
  cambiarPrioridad(id: string, dto: CambiarPrioridadDto): Observable<Reporte> {
    const url =
      `${environment.apiUrl}${ApiEndpoints.REPORTES_PRIORIDAD}`.replace(
        ':id',
        id,
      );
    return this.http.patch<Reporte>(url, dto);
  }

  // ─── Cambiar visibilidad ──────────────────────────────────────────────────
  cambiarVisibilidad(
    id: string,
    dto: CambiarVisibilidadDto,
  ): Observable<Reporte> {
    const url =
      `${environment.apiUrl}${ApiEndpoints.REPORTES_VISIBILIDAD}`.replace(
        ':id',
        id,
      );
    return this.http.patch<Reporte>(url, dto);
  }

  // ─── Métricas ─────────────────────────────────────────────────────────────
  getMetricas(
    mes?: number,
    anio?: number,
    modulo?: string,
  ): Observable<MetricasReportes> {
    const url = `${environment.apiUrl}${ApiEndpoints.REPORTES_METRICAS}`;
    let params = new HttpParams();
    if (mes != null) params = params.set('mes', String(mes));
    if (anio != null) params = params.set('anio', String(anio));
    if (modulo) params = params.set('modulo', modulo);
    return this.http.get<MetricasReportes>(url, { params });
  }

  // ─── Configuración ───────────────────────────────────────────────────────
  getConfiguracion(): Observable<ConfiguracionReportes> {
    const url = `${environment.apiUrl}${ApiEndpoints.REPORTES_CONFIG_GET}`;
    return this.http.get<ConfiguracionReportes>(url);
  }

  actualizarConfiguracion(
    dto: ActualizarConfigReportesDto,
  ): Observable<ConfiguracionReportes> {
    const url = `${environment.apiUrl}${ApiEndpoints.REPORTES_CONFIG_UPDATE}`;
    return this.http.patch<ConfiguracionReportes>(url, dto);
  }

  getCatalogo(): Observable<CatalogoCategoriaReporte[]> {
    const url = `${environment.apiUrl}${ApiEndpoints.REPORTES_CONFIG_CATALOGO}`;
    return this.http.get<CatalogoCategoriaReporte[]>(url);
  }

  // ─── Subir imágenes ───────────────────────────────────────────────────────
  subirImagenes(archivos: File[]): Observable<{ urls: string[] }> {
    const url = `${environment.apiUrl}${ApiEndpoints.REPORTES_UPLOAD_IMAGES}`;
    const form = new FormData();
    archivos.forEach((f) => form.append('files', f));
    return this.http.post<{ urls: string[] }>(url, form);
  }
}
