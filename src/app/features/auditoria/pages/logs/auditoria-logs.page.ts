import { Component, OnInit, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatChipsModule } from '@angular/material/chips';
import { MatDividerModule } from '@angular/material/divider';

import { AuditoriaService } from '../../services/auditoria.service';
import {
  AuditoriaLog,
  AuditoriaLogsParams,
  AuditModulo,
  AuditAccion,
} from '../../models/auditoria.model';

import dayjs from 'dayjs';
import 'dayjs/locale/es';
dayjs.locale('es');

@Component({
  selector: 'app-auditoria-logs',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatPaginatorModule,
    MatTooltipModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatChipsModule,
    MatDividerModule,
  ],
  templateUrl: './auditoria-logs.page.html',
  styleUrl: './auditoria-logs.page.scss',
})
export class AuditoriaLogsPage implements OnInit {
  private readonly auditoriaService = inject(AuditoriaService);

  /* ── state ──────────────────────────────────────────────────────────── */
  cargando = signal(false);
  logs = signal<AuditoriaLog[]>([]);
  logSeleccionado = signal<AuditoriaLog | null>(null);
  drawerAbierto = signal(false);

  /* ── paginación ──────────────────────────────────────────────────────── */
  limitActual = 50;
  paginaActual = signal(1);
  totalRegistros = signal(0);
  totalPaginas = signal(0);

  /* ── filtros ─────────────────────────────────────────────────────────── */
  filtroModulo = signal<AuditModulo | ''>('');
  filtroAccion = signal<AuditAccion | ''>('');
  filtroUsuario = signal('');
  filtroEntidad = signal('');
  filtroDesde = signal<Date | null>(null);
  filtroHasta = signal<Date | null>(null);

  /* ── selects catalogue ───────────────────────────────────────────────── */
  readonly modulos: { valor: AuditModulo; label: string }[] = [
    { valor: 'TESORERIA', label: 'Tesorería' },
    { valor: 'DIF', label: 'DIF' },
    { valor: 'PRESIDENCIA', label: 'Presidencia' },
    { valor: 'CITAS', label: 'Citas' },
    { valor: 'USUARIOS', label: 'Usuarios' },
    { valor: 'MUNICIPIOS', label: 'Municipios' },
    { valor: 'COMUNICACION_SOCIAL', label: 'Comunicación Social' },
    { valor: 'CONTRALORIA', label: 'Contraloría' },
    { valor: 'DESARROLLO_ECONOMICO', label: 'Desarrollo Económico' },
    { valor: 'DESARROLLO_SOCIAL', label: 'Desarrollo Social' },
    { valor: 'DESARROLLO_URBANO', label: 'Desarrollo Urbano' },
    { valor: 'ORGANISMO_AGUA', label: 'Organismo de Agua' },
    { valor: 'REGISTRO_CIVIL', label: 'Registro Civil' },
    { valor: 'SECRETARIA_AYUNTAMIENTO', label: 'Secretaría Ayuntamiento' },
    { valor: 'SEGURIDAD_PUBLICA', label: 'Seguridad Pública' },
    { valor: 'SERVICIOS_PUBLICOS', label: 'Servicios Públicos' },
    { valor: 'UIPPE', label: 'UIPPE' },
    { valor: 'REPORTES', label: 'Reportes' },
    { valor: 'AUDITORIA', label: 'Auditoría' },
  ];

  readonly acciones: { valor: AuditAccion; label: string }[] = [
    { valor: 'CREATE', label: 'Crear' },
    { valor: 'UPDATE', label: 'Actualizar' },
    { valor: 'DELETE', label: 'Eliminar' },
    { valor: 'VIEW', label: 'Ver' },
    { valor: 'LOGIN', label: 'Inicio de sesión' },
    { valor: 'LOGOUT', label: 'Cierre de sesión' },
    { valor: 'EXPORT', label: 'Exportar' },
    { valor: 'DOWNLOAD', label: 'Descargar' },
  ];

  /* ── computed ────────────────────────────────────────────────────────── */
  cambiosFormateados = computed(() => {
    const log = this.logSeleccionado();
    if (!log?.cambios) return null;
    try {
      return JSON.stringify(log.cambios, null, 2);
    } catch {
      return String(log.cambios);
    }
  });

  filtrosActivos = computed(() => {
    let count = 0;
    if (this.filtroModulo()) count++;
    if (this.filtroAccion()) count++;
    if (this.filtroUsuario()) count++;
    if (this.filtroEntidad()) count++;
    if (this.filtroDesde()) count++;
    if (this.filtroHasta()) count++;
    return count;
  });

  /* ── lifecycle ───────────────────────────────────────────────────────── */
  ngOnInit(): void {
    this.buscar();
  }

  /* ── methods ─────────────────────────────────────────────────────────── */
  buscar(pagina = 1): void {
    this.paginaActual.set(pagina);

    const params: AuditoriaLogsParams = {
      page: pagina,
      limit: this.limitActual,
    };
    if (this.filtroModulo()) params.modulo = this.filtroModulo() as AuditModulo;
    if (this.filtroAccion()) params.accion = this.filtroAccion() as AuditAccion;
    if (this.filtroUsuario()) params.usuarioId = this.filtroUsuario();
    if (this.filtroEntidad()) params.entidad = this.filtroEntidad();
    if (this.filtroDesde())
      params.desde = dayjs(this.filtroDesde()!).format('YYYY-MM-DD');
    if (this.filtroHasta())
      params.hasta = dayjs(this.filtroHasta()!).format('YYYY-MM-DD');

    this.cargando.set(true);
    this.auditoriaService.getLogs(params).subscribe({
      next: (res) => {
        this.logs.set(res.data);
        this.totalRegistros.set(res.total);
        this.totalPaginas.set(res.totalPages);
        this.cargando.set(false);
      },
      error: () => {
        this.logs.set([]);
        this.totalRegistros.set(0);
        this.totalPaginas.set(0);
        this.cargando.set(false);
      },
    });
  }

  irAPagina(pagina: number): void {
    if (pagina < 1 || pagina > this.totalPaginas()) return;
    this.buscar(pagina);
  }

  onPageEvent(e: PageEvent): void {
    if (e.pageSize !== this.limitActual) {
      this.limitActual = e.pageSize;
      this.buscar(1);
    } else {
      this.irAPagina(e.pageIndex + 1);
    }
  }

  limpiarFiltros(): void {
    this.filtroModulo.set('');
    this.filtroAccion.set('');
    this.filtroUsuario.set('');
    this.filtroEntidad.set('');
    this.filtroDesde.set(null);
    this.filtroHasta.set(null);
    this.buscar(1);
  }

  abrirDetalle(log: AuditoriaLog): void {
    this.logSeleccionado.set(log);
    this.drawerAbierto.set(true);
  }

  cerrarDetalle(): void {
    this.drawerAbierto.set(false);
    setTimeout(() => this.logSeleccionado.set(null), 300);
  }

  /* ── helpers ─────────────────────────────────────────────────────────── */
  accionLabel(accion: AuditAccion): string {
    const map: Record<AuditAccion, string> = {
      CREATE: 'Crear',
      UPDATE: 'Actualizar',
      DELETE: 'Eliminar',
      VIEW: 'Ver',
      LOGIN: 'Login',
      LOGOUT: 'Logout',
      EXPORT: 'Exportar',
      DOWNLOAD: 'Descargar',
    };
    return map[accion] ?? accion;
  }

  accionClass(accion: AuditAccion): string {
    const map: Record<AuditAccion, string> = {
      DELETE: 'badge-danger',
      UPDATE: 'badge-warning',
      CREATE: 'badge-success',
      LOGIN: 'badge-info',
      LOGOUT: 'badge-info',
      EXPORT: 'badge-neutral',
      DOWNLOAD: 'badge-neutral',
      VIEW: 'badge-neutral',
    };
    return `accion-badge ${map[accion] ?? 'badge-neutral'}`;
  }

  formatFechaHora(iso: string): string {
    return dayjs(iso).format('DD/MM/YYYY HH:mm:ss');
  }

  nombreUsuario(log: AuditoriaLog): string {
    if (!log.usuarioId) return '—';
    return log.usuarioId.nombre || log.usuarioId.email || '—';
  }

  moduloLabel(modulo: string): string {
    return this.modulos.find((m) => m.valor === modulo)?.label ?? modulo;
  }
}
