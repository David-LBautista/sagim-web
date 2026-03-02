import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';

export interface MovimientosDelMesFisico {
  entradas: { totalMovimientos: number; cantidadTotal: number };
  salidas: { totalMovimientos: number; cantidadTotal: number };
  balance: number;
}

export interface MovimientosDelMesMonetario {
  entradas: { totalMovimientos: number; montoTotal: number };
  salidas: { totalMovimientos: number; montoTotal: number };
  balance: number;
}

export type MovimientosDelMes =
  | MovimientosDelMesFisico
  | MovimientosDelMesMonetario;

@Component({
  selector: 'app-resumen-movimientos',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatIconModule],
  templateUrl: './resumen-movimientos.component.html',
  styleUrls: ['./resumen-movimientos.component.scss'],
})
export class ResumenMovimientosComponent {
  @Input() movimientos: MovimientosDelMes | null = null;
  @Input() titulo = 'Resumen de Movimientos del Mes';
  @Input() modo: 'fisico' | 'monetario' = 'fisico';

  get entradasValor(): string {
    if (!this.movimientos) return '0';
    if (this.modo === 'monetario') {
      return (
        '$' +
        (
          this.movimientos.entradas as MovimientosDelMesMonetario['entradas']
        ).montoTotal.toLocaleString('es-MX')
      );
    }
    return (
      this.movimientos.entradas as MovimientosDelMesFisico['entradas']
    ).cantidadTotal.toLocaleString('es-MX');
  }

  get salidasValor(): string {
    if (!this.movimientos) return '0';
    if (this.modo === 'monetario') {
      return (
        '$' +
        (
          this.movimientos.salidas as MovimientosDelMesMonetario['salidas']
        ).montoTotal.toLocaleString('es-MX')
      );
    }
    return (
      this.movimientos.salidas as MovimientosDelMesFisico['salidas']
    ).cantidadTotal.toLocaleString('es-MX');
  }

  get balanceLabel(): string {
    if (!this.movimientos) return '0';
    const val = this.movimientos.balance;
    const formatted =
      (this.modo === 'monetario' ? '$' : '') +
      Math.abs(val).toLocaleString('es-MX') +
      (this.modo === 'fisico' ? ' unidades' : '');
    return (val > 0 ? '+' : val < 0 ? '-' : '') + formatted;
  }

  get unidadLabel(): string {
    return this.modo === 'monetario' ? 'monto' : 'unidades';
  }

  getBalanceClass(balance: number): string {
    if (balance > 0) return 'balance-summary--positive';
    if (balance < -500) return 'balance-summary--critical';
    if (balance < 0) return 'balance-summary--negative';
    return 'balance-summary--neutral';
  }
}
