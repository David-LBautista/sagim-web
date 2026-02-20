import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';

export interface MovimientosDelMes {
  entradas: {
    totalMovimientos: number;
    cantidadTotal: number;
  };
  salidas: {
    totalMovimientos: number;
    cantidadTotal: number;
  };
  balance: number;
}

@Component({
  selector: 'app-resumen-movimientos',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatIconModule],
  templateUrl: './resumen-movimientos.component.html',
  styleUrls: ['./resumen-movimientos.component.scss'],
})
export class ResumenMovimientosComponent {
  @Input() movimientos: MovimientosDelMes | null = null;

  getBalanceClass(balance: number): string {
    if (balance > 0) return 'balance-summary--positive';
    if (balance < -500) return 'balance-summary--critical';
    if (balance < 0) return 'balance-summary--negative';
    return 'balance-summary--neutral';
  }
}
