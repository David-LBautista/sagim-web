import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { KpiCardComponent } from '../../../../shared/components/kpi-card/kpi-card.component';
import { DashboardInventario } from '../../models/inventario.model';

@Component({
  selector: 'app-dashboard-kpis',
  standalone: true,
  imports: [CommonModule, KpiCardComponent, MatProgressSpinnerModule],
  templateUrl: './dashboard-kpis.component.html',
  styleUrls: ['./dashboard-kpis.component.scss'],
})
export class DashboardKpisComponent {
  @Input() loading = false;
  @Input() dashboardData: DashboardInventario | null = null;

  getTotalMovimientos(): number {
    if (!this.dashboardData) return 0;
    const { entradas, salidas } = this.dashboardData.movimientosDelMes;
    return entradas.totalMovimientos + salidas.totalMovimientos;
  }
}
