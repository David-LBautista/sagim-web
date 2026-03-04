import {
  Component,
  Input,
  Output,
  EventEmitter,
  ViewChild,
  OnChanges,
  SimpleChanges,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import dayjs from 'dayjs';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatPaginatorModule, MatPaginator } from '@angular/material/paginator';
import { MatSortModule, MatSort } from '@angular/material/sort';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';
import { StatusBadgeComponent } from '../../../../shared/components/status-badge/status-badge.component';
import { Usuario } from '../../models/usuario.model';

@Component({
  selector: 'app-user-table',
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatTooltipModule,
    StatusBadgeComponent,
  ],
  templateUrl: './user-table.component.html',
  styleUrls: ['./user-table.component.scss'],
})
export class UserTableComponent implements OnChanges {
  @Input() usuarios: Usuario[] = [];
  @Input() showMunicipioColumn: boolean = false;
  @Output() editUser = new EventEmitter<Usuario>();
  @Output() toggleUserStatus = new EventEmitter<Usuario>();
  @Output() deleteUser = new EventEmitter<Usuario>();

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  dataSource = new MatTableDataSource<Usuario>([]);

  get displayedColumns(): string[] {
    const baseColumns = ['nombre', 'email', 'rol'];
    if (this.showMunicipioColumn) {
      baseColumns.push('municipio');
    }
    baseColumns.push('estado', 'ultimoAcceso', 'acciones');
    return baseColumns;
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['usuarios']) {
      this.dataSource.data = this.usuarios;
      if (this.paginator) {
        this.dataSource.paginator = this.paginator;
      }
      if (this.sort) {
        this.dataSource.sort = this.sort;
      }
    }
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  onEditUser(usuario: Usuario): void {
    this.editUser.emit(usuario);
  }

  onToggleStatus(usuario: Usuario): void {
    this.toggleUserStatus.emit(usuario);
  }

  onDeleteUser(usuario: Usuario): void {
    this.deleteUser.emit(usuario);
  }

  getRolLabel(rol: string): string {
    return rol;
  }

  getRolColor(rol: string): string {
    const colors: Record<string, string> = {
      SUPER_ADMIN: 'primary',
      ADMIN: 'accent',
      OPERADOR: 'basic',
    };
    return colors[rol] || 'basic';
  }

  formatDate(dateString?: string): string {
    if (!dateString) return 'Nunca';
    return dayjs(dateString).tz('America/Mexico_City').format('DD MMM YYYY');
  }

  getEstadoBadgeVariant(activo: boolean): 'success' | 'danger' {
    return activo ? 'success' : 'danger';
  }

  getEstadoLabel(activo: boolean): string {
    return activo ? 'ACTIVO' : 'INACTIVO';
  }
}
