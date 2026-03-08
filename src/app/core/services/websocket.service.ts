import { Injectable, inject } from '@angular/core';
import { io, Socket } from 'socket.io-client';
import { Subject, BehaviorSubject } from 'rxjs';
import { environment } from '../../../environments/environment';

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
  ciudadano: string;
  monto: number;
  servicio?: string;
}

@Injectable({ providedIn: 'root' })
export class WebSocketService {
  private socket: Socket | null = null;
  private municipioId: string | null = null;
  private activeAreas = new Set<string>();
  private primeraConexion = true;

  /** Emite cuando una orden interna es cobrada */
  ordenPagada$ = new Subject<OrdenPagadaEvent>();

  /** Emite cuando se registra un nuevo pago en caja */
  nuevoPagoCaja$ = new Subject<NuevoPagoCajaEvent>();

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
        console.log('[WS] Reconexión manual por io server disconnect');
        this.socket?.connect();
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

  /** Desconectar al hacer logout */
  disconnect(): void {
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
