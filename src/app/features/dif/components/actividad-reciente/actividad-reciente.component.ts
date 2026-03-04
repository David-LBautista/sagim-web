import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import dayjs from 'dayjs';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import {
  DataTableComponent,
  TableColumn,
} from '../../../../shared/components/data-table/data-table.component';
import { StatusBadgeComponent } from '../../../../shared/components/status-badge/status-badge.component';
import { FolioTagComponent } from '../../../../shared/components/folio-tag/folio-tag.component';
import { MovimientoReciente } from '../../models/inventario.model';

@Component({
  selector: 'app-actividad-reciente',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatIconModule,
    DataTableComponent,
    StatusBadgeComponent,
    FolioTagComponent,
  ],
  templateUrl: './actividad-reciente.component.html',
  styleUrls: ['./actividad-reciente.component.scss'],
})
export class ActividadRecienteComponent {
  @Input() movimientos: MovimientoReciente[] = [];

  actividadColumns: TableColumn[] = [
    { key: 'fecha', label: 'Fecha' },
    { key: 'folio', label: 'Folio' },
    { key: 'tipoMovimiento', label: 'Tipo', align: 'center' },
    { key: 'tipo', label: 'Item' },
    { key: 'cantidad', label: 'Cantidad', align: 'center' },
    { key: 'programa', label: 'Programa' },
    { key: 'responsable', label: 'Responsable' },
    { key: 'concepto', label: 'Concepto' },
  ];

  get actividadTableData(): any[] {
    return this.movimientos.map((mov) => ({
      fecha: dayjs(mov.fecha).tz('America/Mexico_City').format('DD/MM/YYYY'),
      folio: mov.folio,
      tipoMovimiento: mov.tipoMovimiento,
      tipo: mov.tipo,
      cantidad: mov.cantidad,
      programa: mov.programa.nombre,
      responsable: mov.responsable.nombre,
      concepto: mov.concepto,
      _original: mov,
    }));
  }

  getBadgeVariant(tipo: string): 'success' | 'warning' {
    return tipo === 'IN' ? 'success' : 'warning';
  }

  getBadgeIcon(tipo: string): string {
    return tipo === 'IN' ? '📥' : '📤';
  }

  getBadgeLabel(tipo: string): string {
    return tipo === 'IN' ? 'ENTRADA' : 'SALIDA';
  }
}
