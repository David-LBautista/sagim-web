import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import {
  DataTableComponent,
  TableColumn,
} from '../../../../shared/components/data-table/data-table.component';
import { StockCriticoItem } from '../../models/inventario.model';

@Component({
  selector: 'app-alertas-criticas',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatIconModule, DataTableComponent],
  templateUrl: './alertas-criticas.component.html',
  styleUrls: ['./alertas-criticas.component.scss'],
})
export class AlertasCriticasComponent {
  @Input() items: StockCriticoItem[] = [];

  stockColumns: TableColumn[] = [
    { key: 'tipo', label: 'Item' },
    { key: 'programa', label: 'Programa' },
    { key: 'stock', label: 'Stock' },
    { key: 'minimo', label: 'Mínimo' },
    { key: 'porcentaje', label: '%', align: 'center' },
    { key: 'estado', label: 'Estado', align: 'center' },
  ];

  get stockTableData(): any[] {
    return this.items.map((item) => ({
      tipo: item.tipo,
      programa: item.programa.nombre,
      stock: `${item.stockActual} ${item.unidadMedida}`,
      minimo: `${item.alertaMinima} ${item.unidadMedida}`,
      porcentaje: `${item.porcentajeStock}%`,
      estado: item.estado,
      _original: item,
    }));
  }

  getEstadoBadgeClass(estado: string): string {
    const estadoMap: Record<string, string> = {
      CRITICO: 'badge-critical',
      BAJO: 'badge-warning',
      NORMAL: 'badge-success',
    };
    return estadoMap[estado] || 'badge-success';
  }
}
