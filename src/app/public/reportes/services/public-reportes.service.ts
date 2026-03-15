import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import {
  CategoriaReportePublica,
  CrearReportePublicoDto,
  InfoReportesPublica,
  MetricasReportesPublicas,
  ReportePublico,
  RespuestaReporteCreado,
} from '../models/reportes-publicas.models';

@Injectable({ providedIn: 'root' })
export class PublicReportesService {
  private http = inject(HttpClient);

  private base(slug: string): string {
    return `${environment.apiUrl}/api/v1/public/${slug}/reportes`;
  }

  getInfo(slug: string): Observable<InfoReportesPublica> {
    return this.http.get<InfoReportesPublica>(`${this.base(slug)}/info`);
  }

  getCategorias(slug: string): Observable<CategoriaReportePublica[]> {
    return this.http.get<CategoriaReportePublica[]>(
      `${this.base(slug)}/categorias`,
    );
  }

  crearReporte(
    slug: string,
    dto: CrearReportePublicoDto,
    evidencias?: File[],
  ): Observable<RespuestaReporteCreado> {
    if (evidencias?.length) {
      const fd = new FormData();
      fd.append('categoria', dto.categoria);
      fd.append('descripcion', dto.descripcion);
      if (dto.ubicacion?.descripcion)
        fd.append('ubicacion[descripcion]', dto.ubicacion.descripcion);
      if (dto.nombre) fd.append('nombre', dto.nombre);
      if (dto.telefono) fd.append('telefono', dto.telefono);
      if (dto.correo) fd.append('correo', dto.correo);
      if (dto.recibirNotificaciones != null)
        fd.append('recibirNotificaciones', String(dto.recibirNotificaciones));
      evidencias.forEach((f) => fd.append('evidencias', f, f.name));
      return this.http.post<RespuestaReporteCreado>(this.base(slug), fd);
    }
    return this.http.post<RespuestaReporteCreado>(this.base(slug), dto);
  }

  consultarReporte(
    slug: string,
    folio: string,
    token: string,
  ): Observable<ReportePublico> {
    const params = new HttpParams().set('folio', folio).set('token', token);
    return this.http.get<ReportePublico>(`${this.base(slug)}/consultar`, {
      params,
    });
  }

  getMetricas(
    slug: string,
    mes?: number,
    anio?: number,
  ): Observable<MetricasReportesPublicas> {
    let params = new HttpParams();
    if (mes != null) params = params.set('mes', mes);
    if (anio != null) params = params.set('anio', anio);
    return this.http.get<MetricasReportesPublicas>(
      `${this.base(slug)}/metricas`,
      { params },
    );
  }
}
