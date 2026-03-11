import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { RouterModule } from '@angular/router';
import { RespuestaCitaCreada } from '../../models/citas-publicas.models';

@Component({
  selector: 'app-step-confirmacion',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatIconModule, RouterModule],
  templateUrl: './step-confirmacion.component.html',
  styleUrl: './step-confirmacion.component.scss',
})
export class StepConfirmacionComponent {
  @Input({ required: true }) cita!: RespuestaCitaCreada;
  @Input({ required: true }) slug!: string;
  @Output() nuevaCita = new EventEmitter<void>();
}
