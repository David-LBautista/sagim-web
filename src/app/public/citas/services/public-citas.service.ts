import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { ApiEndpoints } from '../../../core/enums/api-endpoints.enum';
import {
  AreaCitas,
  CiudadanoCurp,
  ConsultaCita,
  CrearCitaPublicaDto,
  DisponibilidadDia,
  RespuestaCitaCreada,
} from '../models/citas-publicas.models';

@Injectable({ providedIn: 'root' })
export class PublicCitasService {
  private http = inject(HttpClient);

  private base(slug: string): string {
    return `${environment.apiUrl}/api/v1/public/${slug}/citas`;
  }

  getAreas(slug: string): Observable<AreaCitas[]> {
    return this.http.get<AreaCitas[]>(`${this.base(slug)}/areas`);
  }

  getDisponibilidad(
    slug: string,
    area: string,
    fechaInicio: string,
    fechaFin: string,
  ): Observable<DisponibilidadDia[]> {
    const params = new HttpParams()
      .set('area', area)
      .set('fechaInicio', fechaInicio)
      .set('fechaFin', fechaFin);
    return this.http.get<DisponibilidadDia[]>(
      `${this.base(slug)}/disponibilidad`,
      { params },
    );
  }

  crearCita(
    slug: string,
    dto: CrearCitaPublicaDto,
  ): Observable<RespuestaCitaCreada> {
    return this.http.post<RespuestaCitaCreada>(this.base(slug), dto);
  }

  /** Consulta por token (viene del email) o por CURP (formulario manual) */
  consultarCita(
    slug: string,
    folio: string,
    auth: { token: string } | { curp: string },
  ): Observable<ConsultaCita> {
    let params = new HttpParams().set('folio', folio);
    if ('token' in auth) {
      params = params.set('token', auth.token);
    } else {
      params = params.set('curp', auth.curp);
    }
    return this.http.get<ConsultaCita>(`${this.base(slug)}/consultar`, {
      params,
    });
  }

  /** Cancela con token (viene del email) o con CURP (formulario manual) */
  cancelarCita(
    slug: string,
    folio: string,
    auth: { token: string } | { curp: string },
    motivo?: string,
  ): Observable<{ mensaje: string }> {
    const body: Record<string, string> = { folio };
    if ('token' in auth) {
      body['token'] = auth.token;
    } else {
      body['curp'] = auth.curp;
    }
    if (motivo) body['motivo'] = motivo;
    return this.http.patch<{ mensaje: string }>(
      `${this.base(slug)}/cancelar`,
      body,
    );
  }

  getCiudadanoPorCurp(slug: string, curp: string): Observable<CiudadanoCurp> {
    const url = `${environment.apiUrl}${ApiEndpoints.PUBLIC_CITAS_CIUDADANO_CURP.replace(
      ':slug',
      slug,
    ).replace(':curp', curp)}`;
    return this.http.get<CiudadanoCurp>(url);
  }
}
