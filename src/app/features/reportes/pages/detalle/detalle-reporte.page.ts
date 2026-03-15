import {
  Component,
  inject,
  signal,
  DestroyRef,
  OnInit,
  OnDestroy,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDividerModule } from '@angular/material/divider';
import { MatChipsModule } from '@angular/material/chips';
import { ActionButtonComponent } from '../../../../shared/components/action-button/action-button.component';
import { ReportesService } from '../../services/reportes.service';
import { WebSocketService } from '../../../../core/services/websocket.service';
import { AuthService } from '../../../auth/services/auth.service';
import { NotificationService } from '../../../../shared/services/notification.service';
import {
  Reporte,
  EstadoReporte,
  PrioridadReporte,
  ESTADO_REPORTE_LABELS,
  PRIORIDAD_REPORTE_LABELS,
  CATEGORIA_REPORTE_LABELS,
  CATEGORIA_REPORTE_ICONS,
  MODULO_REPORTE_LABELS,
  ORIGEN_REPORTE_LABELS,
  CambiarEstadoReporteDto,
  AsignarReporteDto,
  CambiarPrioridadDto,
} from '../../models/reportes.model';

@Component({
  selector: 'app-detalle-reporte',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    ReactiveFormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatProgressBarModule,
    MatProgressSpinnerModule,
    MatTooltipModule,
    MatDividerModule,
    MatChipsModule,
    ActionButtonComponent,
  ],
  templateUrl: './detalle-reporte.page.html',
  styleUrl: './detalle-reporte.page.scss',
})
export class DetalleReportePage implements OnInit, OnDestroy {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private reportesService = inject(ReportesService);
  private wsService = inject(WebSocketService);
  private authService = inject(AuthService);
  private notif = inject(NotificationService);
  private fb = inject(FormBuilder);
  private destroyRef = inject(DestroyRef);

  cargando = signal(true);
  guardando = signal(false);
  reporte = signal<Reporte | null>(null);

  readonly estadoLabels = ESTADO_REPORTE_LABELS;
  readonly prioridadLabels = PRIORIDAD_REPORTE_LABELS;
  readonly categoriaLabels = CATEGORIA_REPORTE_LABELS;
  readonly categoriaIcons = CATEGORIA_REPORTE_ICONS;
  readonly moduloLabels = MODULO_REPORTE_LABELS;
  readonly origenLabels = ORIGEN_REPORTE_LABELS;

  readonly estados: EstadoReporte[] = [
    'pendiente',
    'en_proceso',
    'resuelto',
    'cancelado',
  ];
  readonly prioridades: PrioridadReporte[] = [
    'baja',
    'normal',
    'alta',
    'urgente',
  ];

  estadoForm = this.fb.group({
    estado: ['', Validators.required],
    comentario: ['', Validators.required],
  });

  asignarForm = this.fb.group({
    usuarioId: ['', Validators.required],
    nombreAsignado: ['', Validators.required],
    notaInterna: [''],
  });

  prioridadForm = this.fb.group({
    prioridad: ['', Validators.required],
  });

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) {
      this.router.navigate(['..']);
      return;
    }

    const user = this.authService.getCurrentUser();
    if (user) this.wsService.joinUsuario(user.id);

    this.wsService.reporteActualizado$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((ev) => {
        if (this.reporte()?._id === ev.id) {
          this.reporte.update((r) =>
            r ? { ...r, estado: ev.estado as EstadoReporte } : r,
          );
          this.notif.info('El reporte fue actualizado en tiempo real');
        }
      });

    this.wsService.reporteAsignado$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => {
        this.notif.info('Se te asignó un reporte');
      });

    this.cargar(id);
  }

  ngOnDestroy(): void {
    const user = this.authService.getCurrentUser();
    if (user) this.wsService.leaveUsuario(user.id);
  }

  private cargar(id: string): void {
    this.cargando.set(true);
    this.reportesService
      .getReporte(id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (r) => {
          this.reporte.set(r);
          this.estadoForm.patchValue({ estado: r.estado });
          this.prioridadForm.patchValue({ prioridad: r.prioridad });
          if (r.asignadoA) {
            this.asignarForm.patchValue({
              usuarioId: r.asignadoA,
              nombreAsignado: r.nombreAsignado,
            });
          }
          this.cargando.set(false);
        },
        error: () => {
          this.notif.error('No se pudo cargar el reporte');
          this.router.navigate(['..']);
        },
      });
  }

  cambiarEstado(): void {
    if (this.estadoForm.invalid) return;
    const r = this.reporte();
    if (!r) return;
    this.guardando.set(true);
    const dto: CambiarEstadoReporteDto = {
      estado: this.estadoForm.value.estado as
        | 'en_proceso'
        | 'resuelto'
        | 'cancelado',
      comentarioPublico: this.estadoForm.value.comentario ?? undefined,
    };
    this.reportesService
      .cambiarEstado(r._id, dto)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (updated) => {
          this.reporte.set(updated);
          this.guardando.set(false);
          this.notif.success('Estado actualizado');
        },
        error: () => {
          this.guardando.set(false);
          this.notif.error('No se pudo cambiar el estado');
        },
      });
  }

  asignar(): void {
    if (this.asignarForm.invalid) return;
    const r = this.reporte();
    if (!r) return;
    this.guardando.set(true);
    const dto: AsignarReporteDto = {
      usuarioId: this.asignarForm.value.usuarioId!,
      nombreAsignado: this.asignarForm.value.nombreAsignado!,
      notaInterna: this.asignarForm.value.notaInterna ?? undefined,
    };
    this.reportesService
      .asignar(r._id, dto)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (updated) => {
          this.reporte.set(updated);
          this.guardando.set(false);
          this.notif.success('Reporte asignado');
        },
        error: () => {
          this.guardando.set(false);
          this.notif.error('No se pudo asignar el reporte');
        },
      });
  }

  cambiarPrioridad(): void {
    if (this.prioridadForm.invalid) return;
    const r = this.reporte();
    if (!r) return;
    this.guardando.set(true);
    const dto: CambiarPrioridadDto = {
      prioridad: this.prioridadForm.value.prioridad as PrioridadReporte,
    };
    this.reportesService
      .cambiarPrioridad(r._id, dto)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (updated) => {
          this.reporte.set(updated);
          this.guardando.set(false);
          this.notif.success('Prioridad actualizada');
        },
        error: () => {
          this.guardando.set(false);
          this.notif.error('No se pudo cambiar la prioridad');
        },
      });
  }

  estadoClass(estado: EstadoReporte): string {
    const map: Record<EstadoReporte, string> = {
      pendiente: 'chip-warn',
      en_proceso: 'chip-info',
      resuelto: 'chip-success',
      cancelado: 'chip-neutral',
    };
    return map[estado];
  }

  prioridadClass(prioridad: PrioridadReporte): string {
    const map: Record<PrioridadReporte, string> = {
      baja: 'chip-neutral',
      normal: 'chip-info',
      alta: 'chip-warn',
      urgente: 'chip-danger',
    };
    return map[prioridad];
  }

  volver(): void {
    this.router.navigate(['../'], { relativeTo: this.route });
  }
}
