import { Component, Input, ContentChild, TemplateRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';

export interface TableColumn {
  key: string;
  label: string;
  align?: 'left' | 'center' | 'right';
}

@Component({
  selector: 'app-data-table',
  standalone: true,
  imports: [CommonModule, MatTableModule, MatIconModule],
  templateUrl: './data-table.component.html',
  styleUrls: ['./data-table.component.scss'],
})
export class DataTableComponent {
  @Input({ required: true }) dataSource: any[] = [];
  @Input({ required: true }) columns: TableColumn[] = [];
  @Input() noDataMessage = 'No hay datos disponibles';
  @Input() noDataIcon = 'inbox';

  @ContentChild('cellTemplate') cellTemplate?: TemplateRef<any>;

  get displayedColumns(): string[] {
    return this.columns.map((col) => col.key);
  }
}
