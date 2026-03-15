import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatChipsModule } from '@angular/material/chips';
import { PortalConfigService } from '../../services/portal-config.service';
import {
  PortalAviso,
  AvisoTipo,
} from '../../../../public/municipios/portal-publico.models';
import { AvisoFormDialogComponent } from './aviso-form-dialog/aviso-form-dialog.component';
import { ActionButtonComponent } from '../../../../shared/components/action-button/action-button.component';

@Component({
  selector: 'app-portal-avisos',
  standalone: true,
  imports: [
    CommonModule,
    DatePipe,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatProgressSpinnerModule,
    MatDividerModule,
    MatTooltipModule,
    MatDialogModule,
    MatSnackBarModule,
    MatChipsModule,
    MatSlideToggleModule,
    ActionButtonComponent,
  ],
  templateUrl: './portal-avisos.page.html',
  styleUrl: './portal-avisos.page.scss',
})
export class PortalAvisosPage implements OnInit {
  private svc = inject(PortalConfigService);
  private dialog = inject(MatDialog);
  private snack = inject(MatSnackBar);

  cargando = signal(true);
  avisos = signal<PortalAviso[]>([]);

  readonly avisosOrdenados = computed(() =>
    [...this.avisos()].sort((a, b) => a.orden - b.orden),
  );

  readonly tipoConfig: Record<
    AvisoTipo,
    { label: string; icon: string; color: string }
  > = {
    informativo: { label: 'Informativo', icon: 'info', color: 'info' },
    alerta: { label: 'Alerta', icon: 'warning', color: 'warning' },
    urgente: { label: 'Urgente', icon: 'error', color: 'danger' },
  };

  ngOnInit(): void {
    this.cargar();
  }

  cargar(): void {
    this.cargando.set(true);
    this.svc.getAvisos().subscribe({
      next: (data) => {
        this.avisos.set(data);
        this.cargando.set(false);
      },
      error: () => {
        this.snack.open('Error al cargar los avisos', 'Cerrar', {
          duration: 3000,
        });
        this.cargando.set(false);
      },
    });
  }

  crear(): void {
    const ref = this.dialog.open(AvisoFormDialogComponent, {
      width: '600px',
      data: null,
    });
    ref.afterClosed().subscribe((result) => {
      if (result) this.cargar();
    });
  }

  editar(aviso: PortalAviso): void {
    const ref = this.dialog.open(AvisoFormDialogComponent, {
      width: '600px',
      data: aviso,
    });
    ref.afterClosed().subscribe((result) => {
      if (result) this.cargar();
    });
  }

  toggleActivo(aviso: PortalAviso): void {
    this.svc.updateAviso(aviso._id, { activo: !aviso.activo }).subscribe({
      next: () => {
        this.avisos.update((list) =>
          list.map((a) =>
            a._id === aviso._id ? { ...a, activo: !a.activo } : a,
          ),
        );
      },
      error: () =>
        this.snack.open('Error al actualizar el aviso', 'Cerrar', {
          duration: 3000,
        }),
    });
  }

  eliminar(aviso: PortalAviso): void {
    if (
      !confirm(
        `¿Eliminar el aviso "${aviso.titulo}"? Esta acción no se puede deshacer.`,
      )
    )
      return;
    this.svc.deleteAviso(aviso._id).subscribe({
      next: () => {
        this.avisos.update((list) => list.filter((a) => a._id !== aviso._id));
        this.snack.open('Aviso eliminado', 'Cerrar', { duration: 3000 });
      },
      error: () =>
        this.snack.open('Error al eliminar el aviso', 'Cerrar', {
          duration: 3000,
        }),
    });
  }

  estaVigente(aviso: PortalAviso): boolean {
    const ahora = Date.now();
    return (
      new Date(aviso.vigenciaInicio).getTime() <= ahora &&
      ahora <= new Date(aviso.vigenciaFin).getTime()
    );
  }
}
