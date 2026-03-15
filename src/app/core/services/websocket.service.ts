import { Injectable, inject } from '@angular/core';
import { io, Socket } from 'socket.io-client';
import { Subject, BehaviorSubject } from 'rxjs';
import { environment } from '../../../environments/environment';

/** Payload del evento nueva_cita_agendada */
export interface NuevaCitaAgendadaEvent {
  _id: string;
  area: string;  // nombre del área
  tramite: string;
  fechaCita: string; // YYYY-MM-DD
  horario: string;
  estado: string;
  ciudadano: { nombreCompleto: string; curp: string };
}

/** Payload del evento cita_cancelada */
export interface CitaCanceladaEvent {
  _id: string;
  area: string;
  fechaCita: string;
  horario: string;
}

/** Payload del evento nuevo_reporte */
export interface NuevoReporteEvent {
  folio: string;
  categoria: string;
  categoriaNombre: string;
  modulo: string;
  areaResponsable: string;
  ubicacion: string;
  prioridad: string;
}

/** Payload del evento reporte_actualizado */
export interface ReporteActualizadoEvent {
  id: string;
  folio: string;
  estado: string;
  modulo: string;
}

/** Payload del evento reporte_asignado (solo al usuario asignado) */
export interface ReporteAsignadoEvent {
  folio: string;
  categoriaNombre: string;
  ubicacion: string;
  prioridad: string;
}

/** Payload del evento orden:pagada */
export interface OrdenPagadaEvent {
  folioOrden: string;
  ciudadano: string;
  monto: number;
  area: string;
}

/** Payload del evento caja:nuevo-pago */
export interface NuevoPagoCajaEvent {
  folio: string;
  ciudadano: string | null;
  monto: number;
  servicio?: string;
  metodoPago?: string;
  canal?: string;
  timestamp?: string;
}

/** Payload del evento tesoreria:dashboard-update */
export interface TesoreriaDashboardUpdateEvent {
  resumen: {
    totalRecaudado: number;
    totalOperaciones: number;
    porCanal: { CAJA: number; EN_LINEA: number };
  };
  serviciosTop: Array<{ nombre: string; cantidad: number; total: number }>;
  ingresosPorCanal: { CAJA: number; EN_LINEA: number };
}

/** Payload del evento presidencial:dashboard-update */
export interface PresidencialDashboardUpdateEvent {
  tesoreria: {
    resumen: { recaudacionTotal: number; pagosRealizados: number };
    ingresos: Array<{ fecha: string; monto: number }>;
    ingresosPorArea: Array<{ area: string; monto: number }>;
    serviciosTop: Array<{ servicio: string; total: number }>;
    comparativoMensual: Array<{ mes: string; monto: number }>;
    alertas: Array<{ tipo: string; mensaje: string }>;
  };
  dif: {
    resumen: { beneficiariosUnicos: number; apoyosEntregados: number };
    apoyosPorPrograma: Array<{
      programaId: string;
      programa: string;
      total: number;
    }>;
    beneficiariosPorLocalidad: Array<{ localidad: string; total: number }>;
    comparativoMensual: Array<{ mes: string; apoyos: number }>;
    alertas: Array<{ tipo: string; mensaje: string }>;
  };
}

@Injectable({ providedIn: 'root' })
export class WebSocketService {
  private socket: Socket | null = null;
  private municipioId: string | null = null;
  private activeAreas = new Set<string>();
  private primeraConexion = true;
  private manualReconnectAttempts = 0;
  private readonly MAX_MANUAL_RECONNECT_ATTEMPTS = 5;
  private manualReconnectTimer: ReturnType<typeof setTimeout> | null = null;

  /** Emite cuando una orden interna es cobrada */
  ordenPagada$ = new Subject<OrdenPagadaEvent>();

  /** Emite cuando se registra un nuevo pago en caja */
  nuevoPagoCaja$ = new Subject<NuevoPagoCajaEvent>();

  /** Emite resumen+gráficas actualizados tras cada pago (dashboard tesorería) */
  tesoreriaDashboardUpdate$ = new Subject<TesoreriaDashboardUpdateEvent>();

  /** Emite snapshot completo para el dashboard presidencial */
  presidencialDashboardUpdate$ =
    new Subject<PresidencialDashboardUpdateEvent>();

  /** Emite cuando se agenda una nueva cita (tiempo real) */
  nuevaCitaAgendada$ = new Subject<NuevaCitaAgendadaEvent>();

  /** Emite cuando una cita es cancelada (tiempo real) */
  citaCancelada$ = new Subject<CitaCanceladaEvent>();

  /** Emite cuando se crea un nuevo reporte */
  nuevoReporte$ = new Subject<NuevoReporteEvent>();

  /** Emite cuando un reporte cambia de estado o es asignado */
  reporteActualizado$ = new Subject<ReporteActualizadoEvent>();

  /** Emite cuando se asigna un reporte al usuario autenticado */
  reporteAsignado$ = new Subject<ReporteAsignadoEvent>();

  /** Estado de conexión en tiempo real */
  conexionActiva$ = new BehaviorSubject<boolean>(false);

  /** Emite cuando el socket se reconecta (NO en la primera conexión inicial) */
  reconectado$ = new Subject<void>();

  /** Conectar al namespace /sagim con el token y room del municipio */
  connect(municipioId: string, token: string): void {
    if (this.socket?.connected) {
      console.log('[WS] Ya conectado, skip connect()');
      return;
    }

    this.municipioId = municipioId;
    const url = `${environment.wsUrl}/sagim`;
    console.log(
      '[WS] Intentando conectar a:',
      url,
      '| municipioId:',
      municipioId,
    );

    this.primeraConexion = true;

    this.socket = io(url, {
      auth: { token },
      transports: ['websocket'],
      reconnection: true,
      reconnectionAttempts: Infinity,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
    });

    this.socket.on('connect', () => {
      console.log('[WS] Conectado ✅ | socket.id:', this.socket?.id);
      this.conexionActiva$.next(true);
      this.manualReconnectAttempts = 0; // reset on successful connect
      this.socket!.emit('join:municipio', municipioId);
      // Re-unirse a todos los rooms de área activos
      this.activeAreas.forEach((area) => {
        this.socket!.emit('join:area', area);
        console.log('[WS] emit join:area (reconexion) →', area);
      });
      console.log('[WS] emit join:municipio →', municipioId);
      // Avisar a los componentes que refresquen datos (solo en reconexiones)
      if (!this.primeraConexion) {
        console.log('[WS] Reconexion detectada — emitiendo reconectado$');
        this.reconectado$.next();
      }
      this.primeraConexion = false;
    });

    this.socket.on('disconnect', (reason) => {
      console.warn('[WS] Desconectado:', reason);
      this.conexionActiva$.next(false);
      // Si el servidor cerró deliberadamente, reconectar manualmente
      if (reason === 'io server disconnect') {
        if (
          this.manualReconnectAttempts >= this.MAX_MANUAL_RECONNECT_ATTEMPTS
        ) {
          console.warn(
            `[WS] Máximo de reconexiones manuales alcanzado (${this.MAX_MANUAL_RECONNECT_ATTEMPTS}). Deteniendo reconexión automática.`,
          );
          return;
        }
        this.manualReconnectAttempts++;
        const delay = Math.min(
          1000 * Math.pow(2, this.manualReconnectAttempts - 1),
          30000,
        );
        console.log(
          `[WS] Reconexión manual por io server disconnect (intento ${this.manualReconnectAttempts}/${this.MAX_MANUAL_RECONNECT_ATTEMPTS}) en ${delay}ms`,
        );
        if (this.manualReconnectTimer) clearTimeout(this.manualReconnectTimer);
        this.manualReconnectTimer = setTimeout(() => {
          this.socket?.connect();
        }, delay);
      }
    });

    this.socket.on('reconnect', (attempt: number) => {
      console.log(`[WS] Reconectado ✅ (intento ${attempt})`);
      this.conexionActiva$.next(true);
      this.socket!.emit('join:municipio', municipioId);
      console.log('[WS] emit join:municipio (tras reconexión) →', municipioId);
    });

    this.socket.on('orden:pagada', (data: OrdenPagadaEvent) => {
      console.log('[WS] ← orden:pagada', data);
      this.ordenPagada$.next(data);
    });

    this.socket.on('caja:nuevo-pago', (data: NuevoPagoCajaEvent) => {
      console.log('[WS] ← caja:nuevo-pago', data);
      this.nuevoPagoCaja$.next(data);
    });

    this.socket.on(
      'tesoreria:dashboard-update',
      (data: TesoreriaDashboardUpdateEvent) => {
        console.log('[WS] ← tesoreria:dashboard-update', data);
        this.tesoreriaDashboardUpdate$.next(data);
      },
    );

    this.socket.on(
      'presidencial:dashboard-update',
      (data: PresidencialDashboardUpdateEvent) => {
        console.log('[WS] ← presidencial:dashboard-update', data);
        this.presidencialDashboardUpdate$.next(data);
      },
    );

    this.socket.on('nueva_cita_agendada', (data: NuevaCitaAgendadaEvent) => {
      console.log('[WS] ← nueva_cita_agendada', data);
      this.nuevaCitaAgendada$.next(data);
    });

    this.socket.on('cita_cancelada', (data: CitaCanceladaEvent) => {
      console.log('[WS] ← cita_cancelada', data);
      this.citaCancelada$.next(data);
    });

    this.socket.on('nuevo_reporte', (data: NuevoReporteEvent) => {
      console.log('[WS] ← nuevo_reporte', data);
      this.nuevoReporte$.next(data);
    });

    this.socket.on('reporte_actualizado', (data: ReporteActualizadoEvent) => {
      console.log('[WS] ← reporte_actualizado', data);
      this.reporteActualizado$.next(data);
    });

    this.socket.on('reporte_asignado', (data: ReporteAsignadoEvent) => {
      console.log('[WS] ← reporte_asignado', data);
      this.reporteAsignado$.next(data);
    });

    this.socket.on('connect_error', (err: Error) => {
      console.error('[WS] Error de conexión:', err.message, err);
    });

    this.socket.on('error', (err: Error) => {
      console.error('[WS] Error de socket:', err);
    });
  }

  /**
   * Unirse al room de un área (p.ej. 'Registro Civil').
   * Si el socket aún no está conectado, espera el evento connect.
   */
  joinArea(area: string): void {
    this.activeAreas.add(area);
    if (!this.socket) {
      console.warn('[WS] joinArea() llamado pero socket es null');
      return;
    }
    if (this.socket.connected) {
      console.log('[WS] emit join:area →', area);
      this.socket.emit('join:area', area);
    } else {
      console.log('[WS] join:area encolado (socket no conectado aún) →', area);
      this.socket.once('connect', () => {
        console.log('[WS] emit join:area (desde cola) →', area);
        this.socket?.emit('join:area', area);
      });
    }
  }

  /** Salir del room de un área al destruir el componente */
  leaveArea(area: string): void {
    this.activeAreas.delete(area);
    console.log('[WS] emit leave:area →', area);
    this.socket?.emit('leave:area', area);
  }

  /** Suscribe el socket a la room personal del usuario para recibir reportes asignados. */
  joinUsuario(userId: string): void {
    if (!this.socket) return;
    if (this.socket.connected) {
      this.socket.emit('join_usuario', userId);
    } else {
      this.socket.once('connect', () =>
        this.socket?.emit('join_usuario', userId),
      );
    }
  }

  /** Abandona la room personal del usuario. */
  leaveUsuario(userId: string): void {
    this.socket?.emit('leave_usuario', userId);
  }

  /**
   * Actualiza el token JWT en el socket activo sin reconectar.
   * El servidor verifica el token, re-une al socket a sus rooms y responde auth:ok.
   * También actualiza socket.auth.token para que futuras reconexiones automáticas
   * (por pérdida de red, etc.) usen el token actualizado.
   */
  updateToken(accessToken: string): void {
    if (!this.socket) return;

    // Persistir en socket.auth para reconexiones automáticas de Socket.IO
    (this.socket.auth as Record<string, unknown>)['token'] = accessToken;

    this.socket.emit('auth:token', { token: accessToken });
    console.log('[WS] emit auth:token (token actualizado sin reconexión)');

    this.socket.once('auth:ok', () => {
      console.log('[WS] ← auth:ok — token aceptado por el servidor');
    });
  }

  /** Desconectar al hacer logout */
  disconnect(): void {
    if (this.manualReconnectTimer) {
      clearTimeout(this.manualReconnectTimer);
      this.manualReconnectTimer = null;
    }
    this.manualReconnectAttempts = 0;
    this.socket?.disconnect();
    this.socket = null;
    this.municipioId = null;
    this.activeAreas.clear();
    this.primeraConexion = true;
    this.conexionActiva$.next(false);
  }

  get isConnected(): boolean {
    return this.socket?.connected ?? false;
  }
}
