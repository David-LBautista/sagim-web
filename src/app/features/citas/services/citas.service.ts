import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../../../environments/environment';
import { ApiEndpoints } from '../../../core/enums/api-endpoints.enum';
import {
  Cita,
  CitaHoy,
  ResumenHoy,
  MetricasCitas,
  PaginatedCitas,
  FiltrosCitas,
  CrearCitaInternaDto,
  CambiarEstadoDto,
  ReagendarDto,
  ConfiguracionCitasArea,
  BloqueoFecha,
  UpsertConfigDto,
  CrearBloqueoDto,
  CrearConfiguracionDto,
  AreaDisponible,
} from '../models/citas.model';

@Injectable({
  providedIn: 'root',
})
export class CitasService {
  private http = inject(HttpClient);

  // ─── Citas CRUD ───────────────────────────────────────────────────────────

  /** Normaliza un objeto crudo de la API al modelo Cita del frontend */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private mapCita(raw: any): Cita {
    const area =
      raw.area && typeof raw.area === 'object'
        ? raw.area
        : { _id: '', nombre: String(raw.area ?? '') };
    return {
      _id: raw._id,
      folio: raw.folio,
      municipio: raw.municipioId ?? raw.municipio ?? '',
      area,
      tramite: raw.tramite,
      ciudadano: {
        nombre: raw.ciudadano?.nombreCompleto ?? raw.ciudadano?.nombre ?? '',
        curp: raw.ciudadano?.curp ?? '',
        telefono: raw.ciudadano?.telefono ?? '',
        correo: raw.ciudadano?.correo,
      },
      fecha: (raw.fechaCita ?? raw.fecha ?? '').substring(0, 10),
      hora: raw.horario ?? raw.hora ?? '',
      estado: raw.estado,
      notas: raw.notasCiudadano ?? raw.notas,
      origen: raw.origen,
      tokenConsulta: raw.tokenConsulta,
      atendidoPor: raw.atendidoPor,
      creadoPor: raw.creadoPor,
      createdAt: raw.createdAt,
      updatedAt: raw.updatedAt,
    };
  }

  /** Lista paginada de citas con filtros opcionales */
  getCitas(filtros: FiltrosCitas = {}): Observable<PaginatedCitas> {
    const url = `${environment.apiUrl}${ApiEndpoints.CITAS_LIST}`;
    let params = new HttpParams();
    if (filtros.area) params = params.set('area', filtros.area);
    if (filtros.estado) params = params.set('estado', filtros.estado);
    if (filtros.fechaInicio)
      params = params.set('fechaInicio', filtros.fechaInicio);
    if (filtros.fechaFin) params = params.set('fechaFin', filtros.fechaFin);
    if (filtros.curp) params = params.set('curp', filtros.curp);
    if (filtros.tramite) params = params.set('tramite', filtros.tramite);
    if (filtros.origen) params = params.set('origen', filtros.origen);
    if (filtros.page != null) params = params.set('page', String(filtros.page));
    if (filtros.limit != null)
      params = params.set('limit', String(filtros.limit));
    return this.http
      .get<PaginatedCitas>(url, { params })
      .pipe(
        map((res) => ({ ...res, data: res.data.map((c) => this.mapCita(c)) })),
      );
  }

  /** Resumen de la agenda del día con todas las citas */
  getAgendaHoy(areaId?: string): Observable<ResumenHoy> {
    const url = `${environment.apiUrl}${ApiEndpoints.CITAS_HOY}`;
    let params = new HttpParams();
    if (areaId) params = params.set('area', areaId);
    return this.http.get<ResumenHoy>(url, { params });
  }

  /** Métricas mensuales */
  getMetricas(mes: number, anio: number): Observable<MetricasCitas> {
    const url = `${environment.apiUrl}${ApiEndpoints.CITAS_METRICAS}`;
    const params = new HttpParams()
      .set('mes', String(mes))
      .set('anio', String(anio));
    return this.http.get<MetricasCitas>(url, { params });
  }

  /** Detalle de una cita por ID */
  getCita(id: string): Observable<Cita> {
    const url = `${environment.apiUrl}${ApiEndpoints.CITAS_DETAIL}`.replace(
      ':id',
      id,
    );
    return this.http.get<Cita>(url).pipe(map((c) => this.mapCita(c)));
  }

  /** Crea una cita desde recepción */
  crearCita(dto: CrearCitaInternaDto): Observable<Cita> {
    const url = `${environment.apiUrl}${ApiEndpoints.CITAS_CREAR}`;
    return this.http.post<Cita>(url, dto);
  }

  /** Cambia el estado de una cita */
  cambiarEstado(id: string, dto: CambiarEstadoDto): Observable<Cita> {
    const url =
      `${environment.apiUrl}${ApiEndpoints.CITAS_CAMBIAR_ESTADO}`.replace(
        ':id',
        id,
      );
    return this.http.patch<Cita>(url, dto);
  }

  /** Reagenda una cita a otra fecha/hora */
  reagendar(id: string, dto: ReagendarDto): Observable<Cita> {
    const url = `${environment.apiUrl}${ApiEndpoints.CITAS_REAGENDAR}`.replace(
      ':id',
      id,
    );
    return this.http.patch<Cita>(url, dto);
  }

  // ─── Configuración ────────────────────────────────────────────────────────

  /** Lista todas las configuraciones de áreas */
  getConfiguraciones(): Observable<ConfiguracionCitasArea[]> {
    const url = `${environment.apiUrl}${ApiEndpoints.CITAS_CONFIG_LIST}`;
    return this.http.get<ConfiguracionCitasArea[]>(url);
  }

  /** Áreas activas del municipio que aún no tienen configuración de citas */
  getAreasDisponibles(): Observable<AreaDisponible[]> {
    const url = `${environment.apiUrl}${ApiEndpoints.CITAS_CONFIG_AREAS_DISPONIBLES}`;
    return this.http.get<AreaDisponible[]>(url);
  }

  /** Crea una nueva configuración para un área (con defaults) */
  crearConfiguracion(
    dto: CrearConfiguracionDto,
  ): Observable<ConfiguracionCitasArea> {
    const url = `${environment.apiUrl}${ApiEndpoints.CITAS_CONFIG_CREAR}`;
    return this.http.post<ConfiguracionCitasArea>(url, dto);
  }

  /** Crea o actualiza la configuración de un área */
  upsertConfiguracion(
    areaId: string,
    dto: UpsertConfigDto,
  ): Observable<ConfiguracionCitasArea> {
    const url =
      `${environment.apiUrl}${ApiEndpoints.CITAS_CONFIG_UPSERT}`.replace(
        ':areaId',
        areaId,
      );
    return this.http.patch<ConfiguracionCitasArea>(url, dto);
  }

  /** Activa o desactiva la agenda de un área */
  toggleConfiguracion(areaId: string): Observable<ConfiguracionCitasArea> {
    const url =
      `${environment.apiUrl}${ApiEndpoints.CITAS_CONFIG_TOGGLE}`.replace(
        ':areaId',
        areaId,
      );
    return this.http.patch<ConfiguracionCitasArea>(url, {});
  }

  /** Lista todos los bloqueos de fechas */
  getBloqueos(): Observable<BloqueoFecha[]> {
    const url = `${environment.apiUrl}${ApiEndpoints.CITAS_CONFIG_BLOQUEOS_LIST}`;
    return this.http.get<BloqueoFecha[]>(url);
  }

  /** Crea un bloqueo de fechas */
  crearBloqueo(dto: CrearBloqueoDto): Observable<BloqueoFecha> {
    const url = `${environment.apiUrl}${ApiEndpoints.CITAS_CONFIG_BLOQUEOS_CREAR}`;
    return this.http.post<BloqueoFecha>(url, dto);
  }

  /** Elimina un bloqueo */
  eliminarBloqueo(id: string): Observable<void> {
    const url =
      `${environment.apiUrl}${ApiEndpoints.CITAS_CONFIG_BLOQUEOS_ELIMINAR}`.replace(
        ':id',
        id,
      );
    return this.http.delete<void>(url);
  }

  /** Citas de un mes completo para el calendario (reutiliza getCitas con fechaInicio/fechaFin) */
  getCitasMes(
    anio: number,
    mes: number,
    areaId?: string,
  ): Observable<PaginatedCitas> {
    const fechaInicio = `${anio}-${String(mes).padStart(2, '0')}-01`;
    const ultimoDia = new Date(anio, mes, 0).getDate();
    const fechaFin = `${anio}-${String(mes).padStart(2, '0')}-${ultimoDia}`;
    return this.getCitas({ fechaInicio, fechaFin, area: areaId, limit: 500 });
  }
}
