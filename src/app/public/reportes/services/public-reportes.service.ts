import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import {
  CategoriaReportePublica,
  CrearReportePublicoDto,
  InfoReportesPublica,
  MetricasReportesPublicas,
  ReporteMapa,
  ReportePublico,
  RespuestaReporteCreado,
} from '../models/reportes-publicas.models';

@Injectable({ providedIn: 'root' })
export class PublicReportesService {
  private http = inject(HttpClient);
  private readonly base = `${environment.apiUrl}/api/v1/public/reportes`;

  getInfo(): Observable<InfoReportesPublica> {
    return this.http.get<InfoReportesPublica>(`${this.base}/info`);
  }

  getCategorias(): Observable<CategoriaReportePublica[]> {
    return this.http.get<CategoriaReportePublica[]>(`${this.base}/categorias`);
  }

  crearReporte(
    dto: CrearReportePublicoDto,
    evidencias?: File[],
  ): Observable<RespuestaReporteCreado> {
    if (evidencias?.length) {
      const fd = new FormData();
      fd.append('categoria', dto.categoria);
      fd.append('descripcion', dto.descripcion);
      if (dto.ubicacion?.descripcion)
        fd.append('ubicacion[descripcion]', dto.ubicacion.descripcion);
      if (dto.ubicacion?.colonia)
        fd.append('ubicacion[colonia]', dto.ubicacion.colonia);
      if (dto.ubicacion?.referencia)
        fd.append('ubicacion[referencia]', dto.ubicacion.referencia);
      if (dto.ubicacion?.latitud != null)
        fd.append('ubicacion[latitud]', String(dto.ubicacion.latitud));
      if (dto.ubicacion?.longitud != null)
        fd.append('ubicacion[longitud]', String(dto.ubicacion.longitud));
      if (dto.nombre) fd.append('nombre', dto.nombre);
      if (dto.telefono) fd.append('telefono', dto.telefono);
      if (dto.correo) fd.append('correo', dto.correo);
      if (dto.recibirNotificaciones != null)
        fd.append('recibirNotificaciones', String(dto.recibirNotificaciones));
      evidencias.forEach((f) => fd.append('evidencias', f, f.name));
      return this.http.post<RespuestaReporteCreado>(this.base, fd);
    }
    return this.http.post<RespuestaReporteCreado>(this.base, dto);
  }

  consultarReporte(folio: string, token: string): Observable<ReportePublico> {
    const params = new HttpParams().set('folio', folio).set('token', token);
    return this.http.get<ReportePublico>(`${this.base}/consultar`, { params });
  }

  getMetricas(
    mes?: number,
    anio?: number,
  ): Observable<MetricasReportesPublicas> {
    let params = new HttpParams();
    if (mes != null) params = params.set('mes', mes);
    if (anio != null) params = params.set('anio', anio);
    return this.http.get<MetricasReportesPublicas>(`${this.base}/metricas`, {
      params,
    });
  }

  getMapaReportes(): Observable<ReporteMapa[]> {
    return this.http.get<ReporteMapa[]>(`${this.base}/mapa`);
  }
}
