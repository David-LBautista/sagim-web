import {
  AfterViewInit,
  Component,
  computed,
  DestroyRef,
  EventEmitter,
  inject,
  Input,
  OnChanges,
  OnInit,
  Output,
  signal,
  SimpleChanges,
  ViewChild,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatCalendar, MatDatepickerModule } from '@angular/material/datepicker';
import { ActionButtonComponent } from '../../../../shared/components/action-button/action-button.component';
import { PublicCitasService } from '../../services/public-citas.service';
import {
  DisponibilidadDia,
  SlotDisponibilidad,
} from '../../models/citas-publicas.models';

export interface SeleccionFechaHorario {
  fecha: string; // YYYY-MM-DD
  horario: string; // HH:mm
}

@Component({
  selector: 'app-step-calendario',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatDatepickerModule,
    ActionButtonComponent,
  ],
  templateUrl: './step-calendario.component.html',
  styleUrl: './step-calendario.component.scss',
})
export class StepCalendarioComponent
  implements OnInit, OnChanges, AfterViewInit
{
  private citasService = inject(PublicCitasService);
  private destroyRef = inject(DestroyRef);

  @Input({ required: true }) slug!: string;
  @Input({ required: true }) area!: string;
  @Output() seleccionada = new EventEmitter<SeleccionFechaHorario>();
  @Output() atras = new EventEmitter<void>();

  @ViewChild(MatCalendar) calendar!: MatCalendar<Date>;

  // Disponibilidad cargada (próximos 90 días)
  disponibilidad = signal<DisponibilidadDia[]>([]);
  cargando = signal(true);
  error = signal<string | null>(null);

  // Selección actual
  fechaSeleccionada = signal<Date | null>(null);
  horarioSeleccionado = signal<string | null>(null);

  // Límites del calendario
  readonly hoy = new Date();
  readonly maxFecha = (() => {
    const d = new Date();
    d.setDate(d.getDate() + 90);
    return d;
  })();

  // Slots del día seleccionado
  slotsDelDia = computed<SlotDisponibilidad[]>(() => {
    const fecha = this.fechaSeleccionada();
    if (!fecha) return [];
    const key = this.toDateStr(fecha);
    return this.disponibilidad().find((d) => d.fecha === key)?.slots ?? [];
  });

  // Filtro para el mat-calendar
  filtroFechas = (date: Date | null): boolean => {
    if (!date) return false;
    const key = this.toDateStr(date);
    return (
      this.disponibilidad().find((d) => d.fecha === key)?.disponible ?? false
    );
  };

  ngOnInit() {
    this.cargarDisponibilidad();
  }

  ngOnChanges(changes: SimpleChanges) {
    if ((changes['slug'] || changes['area']) && !changes['slug']?.firstChange) {
      this.fechaSeleccionada.set(null);
      this.horarioSeleccionado.set(null);
      this.cargarDisponibilidad();
    }
  }

  ngAfterViewInit() {
    // Reload if user navigates to a month outside our loaded range
    if (this.calendar) {
      this.calendar.stateChanges
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe(() => {
          const activeDate = this.calendar.activeDate;
          const endOfRange = this.maxFecha;
          if (activeDate > endOfRange) {
            this.extenderDisponibilidad(activeDate);
          }
        });
    }
  }

  cargarDisponibilidad() {
    this.cargando.set(true);
    this.error.set(null);

    const inicio = this.toDateStr(this.hoy);
    const fin = this.toDateStr(this.maxFecha);

    this.citasService
      .getDisponibilidad(this.slug, this.area, inicio, fin)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (dias) => {
          this.disponibilidad.set(dias);
          this.cargando.set(false);
          // Force calendar to refresh its date filter
          if (this.calendar) {
            this.calendar.updateTodaysDate();
          }
        },
        error: () => {
          this.error.set(
            'No se pudo cargar la disponibilidad. Intenta nuevamente.',
          );
          this.cargando.set(false);
        },
      });
  }

  private extenderDisponibilidad(desde: Date) {
    const fin = new Date(desde);
    fin.setDate(fin.getDate() + 30);
    const inicio = this.toDateStr(desde);
    const finStr = this.toDateStr(fin);

    this.citasService
      .getDisponibilidad(this.slug, this.area, inicio, finStr)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (dias) => {
          const existing = this.disponibilidad();
          const merged = [
            ...existing,
            ...dias.filter((d) => !existing.find((e) => e.fecha === d.fecha)),
          ];
          this.disponibilidad.set(merged);
          if (this.calendar) {
            this.calendar.updateTodaysDate();
          }
        },
      });
  }

  onFechaSeleccionada(date: Date | null) {
    this.fechaSeleccionada.set(date);
    this.horarioSeleccionado.set(null);
  }

  seleccionarHorario(slot: SlotDisponibilidad) {
    if (!slot.disponible) return;
    this.horarioSeleccionado.set(slot.horario);
  }

  puedeContinuar(): boolean {
    return !!this.fechaSeleccionada() && !!this.horarioSeleccionado();
  }

  continuar() {
    const fecha = this.fechaSeleccionada();
    const horario = this.horarioSeleccionado();
    if (fecha && horario) {
      this.seleccionada.emit({ fecha: this.toDateStr(fecha), horario });
    }
  }

  private toDateStr(date: Date): string {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }

  formatFechaLarga(date: Date | null): string {
    if (!date) return '';
    return date.toLocaleDateString('es-MX', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  }
}
