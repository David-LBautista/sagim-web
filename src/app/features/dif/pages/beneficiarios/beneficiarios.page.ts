import {
  Component,
  OnInit,
  OnDestroy,
  ViewChild,
  inject,
  signal,
} from '@angular/core';
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
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import {
  MatPaginatorModule,
  MatPaginator,
  PageEvent,
} from '@angular/material/paginator';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import {
  Subject,
  debounceTime,
  distinctUntilChanged,
  takeUntil,
  catchError,
  forkJoin,
  map,
  of,
  timeout,
} from 'rxjs';
import { NgApexchartsModule } from 'ng-apexcharts';
import type {
  ApexAxisChartSeries,
  ApexChart,
  ApexXAxis,
  ApexPlotOptions,
  ApexDataLabels,
  ApexGrid,
} from 'ng-apexcharts';
import { ActionButtonComponent } from '../../../../shared/components/action-button/action-button.component';
import { FolioTagComponent } from '../../../../shared/components/folio-tag/folio-tag.component';
import { KpiCardComponent } from '../../../../shared/components/kpi-card/kpi-card.component';
import { BeneficiariosService } from '../../services/beneficiarios.service';
import { NotificationService } from '../../../../shared/services/notification.service';
import type {
  Beneficiario,
  BeneficiarioDetalle,
  BeneficiariosEstadisticas,
  MunicipioRef,
  ProgramaDIF,
} from '../../models/beneficiarios.model';
import { BeneficiarioFormDialogComponent } from '../../components/beneficiario-form-dialog/beneficiario-form-dialog.component';
import { ImportarBeneficiariosDialogComponent } from '../../components/importar-beneficiarios-dialog/importar-beneficiarios-dialog.component';
import { GenerarReporteDialogComponent } from '../../components/generar-reporte-dialog/generar-reporte-dialog.component';

interface BeneficiarioListItem {
  _id: string;
  folio: string;
  nombreCompleto: string;
  curp: string;
  gruposVulnerables: string[];
  localidad: string;
  fechaRegistro: string;
  estatus: 'ACTIVO' | 'INACTIVO';
}

const GRUPOS_LABELS: Record<string, string> = {
  ADULTO_MAYOR: 'Adulto Mayor',
  DISCAPACIDAD: 'Discapacidad',
  MUJER: 'Mujer',
  MENOR: 'Menor',
  INDIGENA: 'Indígena',
  MIGRANTE: 'Migrante',
};

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
    MatSlideToggleModule,
    MatTooltipModule,
    MatTableModule,
    MatPaginatorModule,
    MatChipsModule,
    MatProgressSpinnerModule,
    ActionButtonComponent,
    FolioTagComponent,
    KpiCardComponent,
    NgApexchartsModule,
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
  @ViewChild(MatPaginator) paginator!: MatPaginator;

  private destroy$ = new Subject<void>();
  private searchSubject = new Subject<string>();

  // ---- loading / state ----
  loading = signal(false);
  loadingStats = signal(false);
  exportando = signal(false);

  // ---- estadísticas ----
  estadisticas = signal<BeneficiariosEstadisticas | null>(null);

  // ---- grupos chart ----
  gruposChartSeries: ApexAxisChartSeries = [
    { name: 'Beneficiarios', data: [] },
  ];
  gruposChartConfig: ApexChart = {
    type: 'bar',
    height: 210,
    toolbar: { show: false },
    fontFamily: 'Poppins, sans-serif',
    foreColor: '#7A7A7A',
  };
  gruposChartPlotOptions: ApexPlotOptions = {
    bar: {
      horizontal: true,
      borderRadius: 4,
      barHeight: '60%',
      distributed: true,
    },
  };
  gruposChartXaxis: ApexXAxis = {
    categories: [],
    labels: { style: { fontSize: '11px' } },
    axisBorder: { show: false },
    axisTicks: { show: false },
  };
  gruposChartDataLabels: ApexDataLabels = {
    enabled: true,
    style: { fontSize: '11px', colors: ['#fff'] },
  };
  gruposChartColors: string[] = [
    '#1F6FAE',
    '#0F2A44',
    '#6FAE3B',
    '#F0A12A',
    '#D64545',
    '#7A7A7A',
  ];
  gruposChartGrid: ApexGrid = {
    borderColor: 'rgba(0,0,0,0.06)',
    xaxis: { lines: { show: false } },
  };

  // ---- drawer ----
  drawerOpen = signal(false);
  beneficiarioDetalle = signal<BeneficiarioDetalle | null>(null);
  loadingDetalle = signal(false);

  // ---- tabla ----
  dataSource = new MatTableDataSource<BeneficiarioListItem>([]);
  total = 0;
  page = 1;
  limit = 20;
  totalPages = 0;

  readonly displayedColumns = [
    'folio',
    'nombreCompleto',
    'curp',
    'gruposVulnerables',
    'localidad',
    'fechaRegistro',
    'acciones',
  ];

  // ---- filtros ----
  globalSearch = '';
  soloActivos = true;

  programas: ProgramaDIF[] = [];

  gruposVulnerablesOptions = [
    { value: '', label: 'Todos' },
    { value: 'ADULTO_MAYOR', label: 'Adulto Mayor' },
    { value: 'DISCAPACIDAD', label: 'Discapacidad' },
    { value: 'MUJER', label: 'Mujer' },
    { value: 'MENOR', label: 'Menor' },
    { value: 'INDIGENA', label: 'Indígena' },
    { value: 'MIGRANTE', label: 'Migrante' },
  ];

  sexos = [
    { value: '', label: 'Todos' },
    { value: 'M', label: 'Masculino' },
    { value: 'F', label: 'Femenino' },
    { value: 'OTRO', label: 'Otro' },
  ];

  filtrosForm: FormGroup = this.fb.group({
    grupoVulnerable: [''],
    programa: [''],
    sexo: [''],
    edadMin: [null],
    edadMax: [null],
  });

  // ============================================================

  ngOnInit(): void {
    this.loadStats();
    this.loadProgramas();
    this.loadBeneficiarios();

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

  // ---- data loading ----

  private loadStats(): void {
    this.loadingStats.set(true);

    this.beneficiariosService
      .getEstadisticas()
      .pipe(
        timeout(8000),
        catchError(() =>
          // Endpoint not available — derive from two fast list calls
          forkJoin({
            all: this.beneficiariosService.getBeneficiarios({
              page: 1,
              limit: 1,
            }),
            activos: this.beneficiariosService.getBeneficiarios({
              page: 1,
              limit: 1,
              activo: true,
            }),
          }).pipe(
            map(({ all, activos }) => ({
              total: all.total,
              activos: activos.total,
              registradosEsteMes: 0,
              porGrupoVulnerable: {} as Record<string, number>,
            })),
            catchError(() => of(null)),
          ),
        ),
      )
      .subscribe({
        next: (stats) => {
          this.estadisticas.set(stats);
          this.buildGruposChart();
          this.loadingStats.set(false);
        },
        error: () => this.loadingStats.set(false),
      });
  }

  private buildGruposChart(): void {
    const grupos = this.estadisticas()?.porGrupoVulnerable;
    if (!grupos) return;
    const entries = Object.entries(grupos).sort((a, b) => b[1] - a[1]);
    this.gruposChartXaxis = {
      ...this.gruposChartXaxis,
      categories: entries.map(([k]) => this.getGrupoLabel(k)),
    };
    this.gruposChartSeries = [
      { name: 'Beneficiarios', data: entries.map(([, v]) => v) },
    ];
  }

  private loadProgramas(): void {
    this.beneficiariosService.getProgramas().subscribe({
      next: (programas) => (this.programas = programas),
      error: () => {},
    });
  }

  loadBeneficiarios(): void {
    this.loading.set(true);
    this.beneficiariosService
      .getBeneficiarios(this.buildQueryParams())
      .subscribe({
        next: (response) => {
          this.dataSource.data = response.data.map((item) =>
            this.mapBeneficiario(item),
          );
          this.total = response.total;
          this.page = response.page;
          this.limit = response.limit;
          this.totalPages = response.totalPages;
          this.loading.set(false);
        },
        error: () => {
          this.notificationService.error('Error al cargar beneficiarios');
          this.loading.set(false);
        },
      });
  }

  // ---- filtros ----

  onSearchChange(): void {
    this.searchSubject.next(this.globalSearch);
  }

  onFiltroChange(): void {
    this.page = 1;
    this.loadBeneficiarios();
  }

  aplicarFiltros(): void {
    this.page = 1;
    this.loadBeneficiarios();
  }

  limpiarFiltros(): void {
    this.filtrosForm.reset({
      grupoVulnerable: '',
      programa: '',
      sexo: '',
      edadMin: null,
      edadMax: null,
    });
    this.globalSearch = '';
    this.soloActivos = true;
    this.page = 1;
    this.loadBeneficiarios();
  }

  onPageChange(event: PageEvent): void {
    this.page = event.pageIndex + 1;
    this.limit = event.pageSize;
    this.loadBeneficiarios();
  }

  // ---- acciones header ----

  onNuevoBeneficiario(): void {
    const dialogRef = this.dialog.open(BeneficiarioFormDialogComponent, {
      width: '700px',
      maxWidth: '95vw',
      disableClose: true,
      data: {},
    });
    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.page = 1;
        if (this.paginator) this.paginator.pageIndex = 0;
        this.loadBeneficiarios();
        this.loadStats();
      }
    });
  }

  generarReporte(): void {
    this.dialog.open(GenerarReporteDialogComponent, {
      width: '480px',
      maxWidth: '95vw',
      disableClose: false,
      data: { tipo: 'beneficiarios' },
    });
  }

  importar(): void {
    const dialogRef = this.dialog.open(ImportarBeneficiariosDialogComponent, {
      width: '700px',
      maxWidth: '95vw',
      disableClose: true,
    });
    dialogRef.afterClosed().subscribe((huboImportacion) => {
      if (huboImportacion) {
        this.page = 1;
        if (this.paginator) this.paginator.pageIndex = 0;
        this.loadBeneficiarios();
        this.loadStats();
      }
    });
  }

  exportar(): void {
    this.exportando.set(true);
    this.beneficiariosService.exportar(this.buildQueryParams()).subscribe({
      next: (blob) => {
        const fecha = dayjs().format('YYYY-MM-DD');
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `beneficiarios-dif-${fecha}.xlsx`;
        a.click();
        URL.revokeObjectURL(url);
        this.exportando.set(false);
      },
      error: () => {
        this.notificationService.error('Error al exportar beneficiarios');
        this.exportando.set(false);
      },
    });
  }

  // ---- acciones fila ----

  verDetalle(item: BeneficiarioListItem): void {
    this.drawerOpen.set(true);
    this.beneficiarioDetalle.set(null);
    this.loadingDetalle.set(true);
    this.beneficiariosService.getBeneficiarioByCurp(item.curp, 1, 3).subscribe({
      next: (data) => {
        this.beneficiarioDetalle.set(data);
        this.loadingDetalle.set(false);
      },
      error: () => {
        this.notificationService.error('Error al cargar detalle');
        this.loadingDetalle.set(false);
      },
    });
  }

  cerrarDetalle(): void {
    this.drawerOpen.set(false);
    this.beneficiarioDetalle.set(null);
  }

  editarBeneficiario(item: BeneficiarioListItem): void {
    const detalle = this.beneficiarioDetalle();
    const cached =
      detalle?.curp === item.curp ? (detalle as unknown as Beneficiario) : null;

    const openDialog = (beneficiario: Beneficiario) => {
      const dialogRef = this.dialog.open(BeneficiarioFormDialogComponent, {
        width: '700px',
        maxWidth: '95vw',
        disableClose: true,
        data: { beneficiario },
      });
      dialogRef.afterClosed().subscribe((result) => {
        if (result) {
          this.loadBeneficiarios();
          if (this.drawerOpen()) this.verDetalle(item);
        }
      });
    };

    if (cached) {
      openDialog(cached);
    } else {
      this.beneficiariosService.getBeneficiarioById(item._id).subscribe({
        next: (b) => openDialog(b),
        error: () => {
          this.notificationService.error('No se pudo cargar el beneficiario');
        },
      });
    }
  }

  desactivar(item: BeneficiarioListItem): void {
    if (
      !confirm(
        `¿Desactivar a ${item.nombreCompleto}? El historial de apoyos quedará intacto.`,
      )
    )
      return;
    this.beneficiariosService.desactivar(item._id).subscribe({
      next: () => {
        this.notificationService.success('Beneficiario desactivado');
        this.loadBeneficiarios();
        this.loadStats();
        if (
          this.drawerOpen() &&
          this.beneficiarioDetalle()?.curp === item.curp
        ) {
          this.cerrarDetalle();
        }
      },
      error: () => this.notificationService.error('Error al desactivar'),
    });
  }

  verTodosApoyos(curp: string): void {
    this.router.navigate(['/dif/beneficiarios', curp]);
  }

  // ---- helpers ----

  getEstatusVariant(status: 'ACTIVO' | 'INACTIVO'): 'success' | 'danger' {
    return status === 'ACTIVO' ? 'success' : 'danger';
  }

  getGrupoLabel(clave: string): string {
    return GRUPOS_LABELS[clave] ?? clave;
  }

  getApoyosMostrar(): any[] {
    return this.beneficiarioDetalle()?.historialApoyos?.data?.slice(0, 3) ?? [];
  }

  formatFechaApoyo(dateString: string): string {
    return dayjs(dateString).format('MMM YYYY');
  }

  formatFechaNacimiento(dateString: string): string {
    return dayjs(dateString).format('DD/MM/YYYY');
  }

  calcEdad(fechaNacimiento: string): number {
    return dayjs().diff(dayjs(fechaNacimiento), 'year');
  }

  getSexoLabel(sexo: string): string {
    if (sexo === 'M') return 'Masculino';
    if (sexo === 'F') return 'Femenino';
    return sexo ?? '—';
  }

  private buildQueryParams() {
    const f = this.filtrosForm.value;
    const params: Record<string, unknown> = {
      page: this.page,
      limit: this.limit,
    };
    if (this.globalSearch?.trim()) params['search'] = this.globalSearch.trim();
    if (f.grupoVulnerable) params['grupoVulnerable'] = f.grupoVulnerable;
    if (f.programa) params['programaId'] = f.programa;
    if (f.sexo) params['sexo'] = f.sexo;
    if (f.edadMin != null && f.edadMin !== '') params['edadMin'] = f.edadMin;
    if (f.edadMax != null && f.edadMax !== '') params['edadMax'] = f.edadMax;
    if (this.soloActivos) params['activo'] = true;
    return params;
  }

  private mapBeneficiario(item: Beneficiario): BeneficiarioListItem {
    return {
      _id: item._id,
      folio: item.folio ?? `BEN-${item._id.slice(-8).toUpperCase()}`,
      nombreCompleto: [item.nombre, item.apellidoPaterno, item.apellidoMaterno]
        .filter(Boolean)
        .join(' ')
        .trim(),
      curp: item.curp,
      gruposVulnerables: item.grupoVulnerable ?? [],
      localidad: item.localidad ?? '—',
      fechaRegistro: dayjs(item.fechaRegistro ?? item.createdAt).format(
        'DD/MM/YY',
      ),
      estatus: item.activo ? 'ACTIVO' : 'INACTIVO',
    };
  }

  private buildFolio(id: string): string {
    return `BEN-${id.slice(-8).toUpperCase()}`;
  }
}
