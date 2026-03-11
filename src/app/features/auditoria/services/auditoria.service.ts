import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { ApiEndpoints } from '../../../core/enums/api-endpoints.enum';
import type {
  AuditoriaLog,
  AuditoriaFiltros,
  AuditoriaLogsParams,
  AuditoriaLogsPaginado,
  CrearAuditoriaLogDto,
  AuditoriaDashboardResumen,
  ActividadPorModulo,
  AccionCritica,
  AccesoReciente,
} from '../models/auditoria.model';

@Injectable({ providedIn: 'root' })
export class AuditoriaService {
  private http = inject(HttpClient);
  private base = environment.apiUrl;

  // ── Bitácora ─────────────────────────────────────────────────────────────
  getLogs(args: AuditoriaLogsParams = {}): Observable<AuditoriaLogsPaginado> {
    let params = new HttpParams();
    if (args.modulo) params = params.set('modulo', args.modulo);
    if (args.accion) params = params.set('accion', args.accion);
    if (args.usuarioId) params = params.set('usuarioId', args.usuarioId);
    if (args.entidad) params = params.set('entidad', args.entidad);
    if (args.desde) params = params.set('desde', args.desde);
    if (args.hasta) params = params.set('hasta', args.hasta);
    params = params.set('page', args.page ?? 1);
    params = params.set('limit', args.limit ?? 50);
    return this.http.get<AuditoriaLogsPaginado>(
      `${this.base}${ApiEndpoints.AUDITORIA_LOGS_LIST}`,
      { params },
    );
  }

  crearLog(dto: CrearAuditoriaLogDto): Observable<AuditoriaLog> {
    return this.http.post<AuditoriaLog>(
      `${this.base}${ApiEndpoints.AUDITORIA_LOGS_CREATE}`,
      dto,
    );
  }

  getHistorial(entidad: string, entidadId: string): Observable<AuditoriaLog[]> {
    const url = `${this.base}/api/v1/auditoria/historial/${entidad}/${entidadId}`;
    return this.http.get<AuditoriaLog[]>(url);
  }

  getActividadUsuario(
    usuarioId: string,
    limite = 50,
  ): Observable<AuditoriaLog[]> {
    const url = `${this.base}/api/v1/auditoria/usuario/${usuarioId}`;
    return this.http.get<AuditoriaLog[]>(url, {
      params: new HttpParams().set('limite', limite),
    });
  }

  // ── Dashboard ─────────────────────────────────────────────────────────────
  getDashboardResumen(dias = 30): Observable<AuditoriaDashboardResumen> {
    return this.http.get<AuditoriaDashboardResumen>(
      `${this.base}${ApiEndpoints.DASHBOARD_AUDITORIA_RESUMEN}`,
      { params: new HttpParams().set('dias', dias) },
    );
  }

  getActividadPorModulo(dias = 30): Observable<ActividadPorModulo[]> {
    return this.http.get<ActividadPorModulo[]>(
      `${this.base}${ApiEndpoints.DASHBOARD_AUDITORIA_ACTIVIDAD_MODULO}`,
      { params: new HttpParams().set('dias', dias) },
    );
  }

  getAccionesCriticas(dias = 30): Observable<AccionCritica[]> {
    return this.http.get<AccionCritica[]>(
      `${this.base}${ApiEndpoints.DASHBOARD_AUDITORIA_ACCIONES_CRITICAS}`,
      { params: new HttpParams().set('dias', dias) },
    );
  }

  getAccesos(dias = 30): Observable<AccesoReciente[]> {
    return this.http.get<AccesoReciente[]>(
      `${this.base}${ApiEndpoints.DASHBOARD_AUDITORIA_ACCESOS}`,
      { params: new HttpParams().set('dias', dias) },
    );
  }
}
