import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialog } from '@angular/material/dialog';
import { ItemFormDialogComponent } from '../components/item-form-dialog/item-form-dialog.component';
import { InventarioService } from '../services/inventario.service';
import { DashboardInventario } from '../models/inventario.model';
import { ActionButtonComponent } from '../../../shared/components/action-button/action-button.component';
import { DashboardKpisComponent } from '../components/dashboard-kpis/dashboard-kpis.component';
import { AlertasCriticasComponent } from '../components/alertas-criticas/alertas-criticas.component';
import { ResumenMovimientosComponent } from '../components/resumen-movimientos/resumen-movimientos.component';
import { ActividadRecienteComponent } from '../components/actividad-reciente/actividad-reciente.component';

@Component({
  selector: 'app-inventario',
  standalone: true,
  imports: [
    CommonModule,
    ActionButtonComponent,
    DashboardKpisComponent,
    AlertasCriticasComponent,
    ResumenMovimientosComponent,
    ActividadRecienteComponent,
  ],
  templateUrl: './inventario.page.html',
  styleUrls: ['./inventario.page.scss'],
})
export class InventarioPage implements OnInit {
  private dialog = inject(MatDialog);
  private inventarioService = inject(InventarioService);

  dashboardData: DashboardInventario | null = null;
  loading = true;

  ngOnInit(): void {
    this.loadDashboard();
  }

  loadDashboard(): void {
    this.loading = true;
    this.inventarioService.getDashboard().subscribe({
      next: (data) => {
        this.dashboardData = data;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error al cargar dashboard:', error);
        this.loading = false;
      },
    });
  }

  onCreateItem(): void {
    const dialogRef = this.dialog.open(ItemFormDialogComponent, {
      width: '700px',
      maxWidth: '90vw',
      disableClose: true,
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.loadDashboard();
      }
    });
  }
}
