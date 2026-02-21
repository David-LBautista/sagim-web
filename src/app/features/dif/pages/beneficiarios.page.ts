import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatTooltipModule } from '@angular/material/tooltip';
import {
  DataTableComponent,
  TableColumn,
} from '../../../shared/components/data-table/data-table.component';
import { StatusBadgeComponent } from '../../../shared/components/status-badge/status-badge.component';
import { BeneficiariosService } from '../services/beneficiarios.service';
import { NotificationService } from '../../../shared/services/notification.service';
import type { Beneficiario } from '../models/beneficiarios.model';
import { BeneficiarioFormDialogComponent } from '../components/beneficiario-form-dialog/beneficiario-form-dialog.component';

interface BeneficiarioListItem {
  folio: string;
  nombreCompleto: string;
  curp: string;
  programa: string;
  municipio: string;
  fechaRegistro: string;
  estatus: 'ACTIVO' | 'INACTIVO';
}

@Component({
  selector: 'app-beneficiarios',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatButtonModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatTooltipModule,
    DataTableComponent,
    StatusBadgeComponent,
  ],
  templateUrl: './beneficiarios.page.html',
  styleUrls: ['./beneficiarios.page.scss'],
})
export class BeneficiariosPage implements OnInit {
  private fb = new FormBuilder();
  private dialog = inject(MatDialog);
  private beneficiariosService = inject(BeneficiariosService);
  private notificationService = inject(NotificationService);

  globalSearch = '';
  showFilters = false;

  municipios = [
    { value: '', label: 'Todos' },
    { value: 'xalapa', label: 'Xalapa' },
  ];

  programas = [
    { value: '', label: 'Todos' },
    { value: 'adulto-mayor', label: 'Adulto Mayor' },
  ];

  sexos = [
    { value: '', label: 'Todos' },
    { value: 'M', label: 'Masculino' },
    { value: 'F', label: 'Femenino' },
    { value: 'OTRO', label: 'Otro' },
  ];

  estatusOptions = [
    { value: '', label: 'Todos' },
    { value: 'ACTIVO', label: 'Activo' },
    { value: 'INACTIVO', label: 'Inactivo' },
  ];

  filtrosForm: FormGroup = this.fb.group({
    municipio: [''],
    programa: [''],
    fechaInicio: [null],
    fechaFin: [null],
    sexo: [''],
    edadMin: [null],
    edadMax: [null],
    estatus: [''],
  });

  tableColumns: TableColumn[] = [
    { key: 'folio', label: 'Folio beneficiario' },
    { key: 'nombreCompleto', label: 'Nombre completo' },
    { key: 'curp', label: 'CURP' },
    { key: 'programa', label: 'Programa' },
    { key: 'municipio', label: 'Municipio' },
    { key: 'fechaRegistro', label: 'Fecha de registro' },
    { key: 'estatus', label: 'Estatus', align: 'center' },
    { key: 'acciones', label: 'Acciones', align: 'center' },
  ];

  beneficiarios: BeneficiarioListItem[] = [];
  total = 0;
  page = 1;
  limit = 20;
  totalPages = 0;

  ngOnInit(): void {
    this.loadBeneficiarios();
  }

  onNuevoBeneficiario(): void {
    const dialogRef = this.dialog.open(BeneficiarioFormDialogComponent, {
      width: '900px',
      maxWidth: '95vw',
      disableClose: true,
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.loadBeneficiarios();
      }
    });
  }

  toggleFilters(): void {
    this.showFilters = !this.showFilters;
  }

  loadBeneficiarios(): void {
    this.beneficiariosService.getBeneficiarios().subscribe({
      next: (response) => {
        this.beneficiarios = response.data.map((item: Beneficiario) =>
          this.mapBeneficiario(item),
        );
        this.total = response.total;
        this.page = response.page;
        this.limit = response.limit;
        this.totalPages = response.totalPages;
      },
      error: (error) => {
        console.error('Error al cargar beneficiarios:', error);
        this.notificationService.error('Error al cargar beneficiarios');
      },
    });
  }

  get tableData(): Array<
    BeneficiarioListItem & { _original: BeneficiarioListItem }
  > {
    return this.beneficiarios.map((item) => ({
      ...item,
      fechaRegistro: this.formatDate(item.fechaRegistro),
      _original: item,
    }));
  }

  getEstatusVariant(
    status: BeneficiarioListItem['estatus'],
  ): 'success' | 'danger' {
    return status === 'ACTIVO' ? 'success' : 'danger';
  }

  onVerBeneficiario(item: BeneficiarioListItem): void {
    console.log('Ver beneficiario:', item);
  }

  onEditarBeneficiario(item: BeneficiarioListItem): void {
    console.log('Editar beneficiario:', item);
  }

  private formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-MX', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  }

  private mapBeneficiario(item: Beneficiario): BeneficiarioListItem {
    const estatus = this.resolveEstatus(item);

    return {
      folio: this.buildFolio(item._id),
      nombreCompleto: this.buildNombreCompleto(item),
      curp: item.curp,
      programa: '-',
      municipio: item.municipioId,
      fechaRegistro: item.createdAt,
      estatus,
    };
  }

  private buildFolio(id: string): string {
    return `BEN-${id.slice(-8).toUpperCase()}`;
  }

  private buildNombreCompleto(item: Beneficiario): string {
    return [item.nombre, item.apellidoPaterno, item.apellidoMaterno]
      .filter(Boolean)
      .join(' ')
      .trim();
  }

  private resolveEstatus(item: Beneficiario): 'ACTIVO' | 'INACTIVO' {
    return item.activo ? 'ACTIVO' : 'INACTIVO';
  }
}
