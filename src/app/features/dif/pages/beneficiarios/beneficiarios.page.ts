import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import dayjs from 'dayjs';
import { FormsModule } from '@angular/forms';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { Subject, debounceTime, distinctUntilChanged, takeUntil } from 'rxjs';
import { StatusBadgeComponent } from '../../../../shared/components/status-badge/status-badge.component';
import { ActionButtonComponent } from '../../../../shared/components/action-button/action-button.component';
import { FolioTagComponent } from '../../../../shared/components/folio-tag/folio-tag.component';
import { BeneficiariosService } from '../../services/beneficiarios.service';
import { NotificationService } from '../../../../shared/services/notification.service';
import type {
  Beneficiario,
  MunicipioRef,
} from '../../models/beneficiarios.model';
import { BeneficiarioFormDialogComponent } from '../../components/beneficiario-form-dialog/beneficiario-form-dialog.component';
import { GenerarReporteDialogComponent } from '../../components/generar-reporte-dialog/generar-reporte-dialog.component';

interface BeneficiarioListItem {
  folio: string;
  nombreCompleto: string;
  curp: string;
  localidad: string;
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
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatButtonModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatTooltipModule,
    MatTableModule,
    StatusBadgeComponent,
    ActionButtonComponent,
    FolioTagComponent,
  ],
  templateUrl: './beneficiarios.page.html',
  styleUrls: ['./beneficiarios.page.scss'],
})
export class BeneficiariosPage implements OnInit, OnDestroy {
  private fb = new FormBuilder();
  private dialog = inject(MatDialog);
  private router = inject(Router);
  private beneficiariosService = inject(BeneficiariosService);
  private notificationService = inject(NotificationService);

  private destroy$ = new Subject<void>();
  private searchSubject = new Subject<string>();

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
    programa: [''],
    fechaInicio: [null],
    fechaFin: [null],
    sexo: [''],
    edadMin: [null],
    edadMax: [null],
    estatus: [''],
  });

  readonly displayedColumns = [
    'folio',
    'nombreCompleto',
    'curp',
    'localidad',
    'municipio',
    'fechaRegistro',
    'estatus',
    'acciones',
  ];

  dataSource = new MatTableDataSource<BeneficiarioListItem>([]);
  total = 0;
  page = 1;
  limit = 20;
  totalPages = 0;

  ngOnInit(): void {
    this.loadBeneficiarios();

    // Debounce global search
    this.searchSubject
      .pipe(debounceTime(400), distinctUntilChanged(), takeUntil(this.destroy$))
      .subscribe(() => {
        this.page = 1;
        this.loadBeneficiarios();
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
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

  onGenerarReporte(): void {
    this.dialog.open(GenerarReporteDialogComponent, {
      width: '480px',
      maxWidth: '95vw',
      data: { tipo: 'beneficiarios' },
    });
  }

  toggleFilters(): void {
    this.showFilters = !this.showFilters;
  }

  onSearchChange(): void {
    this.searchSubject.next(this.globalSearch);
  }

  aplicarFiltros(): void {
    this.page = 1;
    this.loadBeneficiarios();
  }

  limpiarFiltros(): void {
    this.filtrosForm.reset({
      programa: '',
      fechaInicio: null,
      fechaFin: null,
      sexo: '',
      edadMin: null,
      edadMax: null,
      estatus: '',
    });
    this.globalSearch = '';
    this.page = 1;
    this.loadBeneficiarios();
  }

  loadBeneficiarios(): void {
    this.beneficiariosService
      .getBeneficiarios(this.buildQueryParams())
      .subscribe({
        next: (response) => {
          this.dataSource.data = response.data.map((item: Beneficiario) =>
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

  get resumenActivos(): number {
    return this.dataSource.data.filter((b) => b.estatus === 'ACTIVO').length;
  }

  get resumenInactivos(): number {
    return this.dataSource.data.filter((b) => b.estatus === 'INACTIVO').length;
  }

  getEstatusVariant(
    status: BeneficiarioListItem['estatus'],
  ): 'success' | 'danger' {
    return status === 'ACTIVO' ? 'success' : 'danger';
  }

  onVerBeneficiario(item: BeneficiarioListItem): void {
    this.router.navigate(['/dif/beneficiarios', item.curp]);
  }

  onEditarBeneficiario(item: BeneficiarioListItem): void {
    console.log('Editar beneficiario:', item);
  }

  private formatDate(dateString: string): string {
    return dayjs(dateString).tz('America/Mexico_City').format('DD/MM/YYYY');
  }

  private mapBeneficiario(item: Beneficiario): BeneficiarioListItem {
    const estatus = this.resolveEstatus(item);

    return {
      folio: item.folio ?? this.buildFolio(item._id),
      nombreCompleto: this.buildNombreCompleto(item),
      curp: item.curp,
      localidad: item.localidad ?? '-',
      municipio:
        typeof item.municipioId === 'object'
          ? (item.municipioId as MunicipioRef).nombre
          : (item.municipioId ?? '-'),
      fechaRegistro: this.formatDate(item.fechaRegistro ?? item.createdAt),
      estatus,
    };
  }

  private buildFolio(id: string): string {
    return `BEN-${id.slice(-8).toUpperCase()}`;
  }

  private buildQueryParams() {
    const f = this.filtrosForm.value;
    const params: Record<string, unknown> = {
      page: this.page,
      limit: this.limit,
    };
    if (this.globalSearch?.trim()) params['search'] = this.globalSearch.trim();
    if (f.sexo) params['sexo'] = f.sexo;
    if (f.programa) params['programaId'] = f.programa;
    if (f.fechaInicio) params['fechaInicio'] = this.toDateString(f.fechaInicio);
    if (f.fechaFin) params['fechaFin'] = this.toDateString(f.fechaFin);
    if (f.edadMin != null && f.edadMin !== '') params['edadMin'] = f.edadMin;
    if (f.edadMax != null && f.edadMax !== '') params['edadMax'] = f.edadMax;
    if (f.estatus === 'INACTIVO') params['activo'] = false;
    else if (f.estatus === 'ACTIVO') params['activo'] = true;
    return params;
  }

  private toDateString(date: Date | string): string {
    const d = new Date(date);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
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
