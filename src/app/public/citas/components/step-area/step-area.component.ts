import {
  Component,
  DestroyRef,
  EventEmitter,
  inject,
  Input,
  OnInit,
  Output,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { PublicCitasService } from '../../services/public-citas.service';
import { AreaCitas } from '../../models/citas-publicas.models';

export interface SeleccionArea {
  area: AreaCitas;
  tramite: string;
}

@Component({
  selector: 'app-step-area',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    MatChipsModule,
    MatProgressSpinnerModule,
  ],
  templateUrl: './step-area.component.html',
  styleUrl: './step-area.component.scss',
})
export class StepAreaComponent implements OnInit {
  private citasService = inject(PublicCitasService);
  private destroyRef = inject(DestroyRef);

  @Input({ required: true }) slug!: string;
  @Output() seleccionada = new EventEmitter<SeleccionArea>();

  areas = signal<AreaCitas[]>([]);
  cargando = signal(true);
  error = signal<string | null>(null);

  areaSeleccionada = signal<AreaCitas | null>(null);
  tramiteSeleccionado = signal<string | null>(null);

  ngOnInit() {
    this.citasService
      .getAreas(this.slug)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (areas) => {
          this.areas.set(areas);
          this.cargando.set(false);
        },
        error: () => {
          this.error.set(
            'No se pudieron cargar las áreas disponibles. Intenta de nuevo.',
          );
          this.cargando.set(false);
        },
      });
  }

  seleccionarArea(area: AreaCitas) {
    this.areaSeleccionada.set(area);
    this.tramiteSeleccionado.set(null);
  }

  seleccionarTramite(tramite: string) {
    this.tramiteSeleccionado.set(tramite);
  }

  puedeContinuar(): boolean {
    return !!this.areaSeleccionada() && !!this.tramiteSeleccionado();
  }

  continuar() {
    const area = this.areaSeleccionada();
    const tramite = this.tramiteSeleccionado();
    if (area && tramite) {
      this.seleccionada.emit({ area, tramite });
    }
  }
}
