import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import dayjs from 'dayjs';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { Subject, takeUntil } from 'rxjs';
import {
  DataTableComponent,
  TableColumn,
} from '../../../../shared/components/data-table/data-table.component';
import { StatusBadgeComponent } from '../../../../shared/components/status-badge/status-badge.component';
import { FolioTagComponent } from '../../../../shared/components/folio-tag/folio-tag.component';
import { BeneficiariosService } from '../../services/beneficiarios.service';
import { NotificationService } from '../../../../shared/services/notification.service';
import type {
  ApoyoHistorial,
  BeneficiarioDetalle,
} from '../../models/beneficiarios.model';

interface ApoyoRow {
  folio: string;
  fecha: string;
  tipo: string;
  programa: string;
  monto: string;
  cantidad: number;
  entregadoPor: string;
}

@Component({
  selector: 'app-beneficiario-detalle',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatTooltipModule,
    MatProgressSpinnerModule,
    DataTableComponent,
    StatusBadgeComponent,
    FolioTagComponent,
  ],
  templateUrl: './beneficiario-detalle.page.html',
  styleUrls: ['./beneficiario-detalle.page.scss'],
})
export class BeneficiarioDetallePage implements OnInit, OnDestroy {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private beneficiariosService = inject(BeneficiariosService);
  private notificationService = inject(NotificationService);
  private destroy$ = new Subject<void>();

  detalle: BeneficiarioDetalle | null = null;
  loading = false;
  loadingTable = false;

  page = 1;
  limit = 10;
  total = 0;
  totalPages = 1;

  apoyosRows: ApoyoRow[] = [];

  readonly apoyosColumns: TableColumn[] = [
    { key: 'folio', label: 'Folio' },
    { key: 'fecha', label: 'Fecha' },
    { key: 'tipo', label: 'Tipo' },
    { key: 'programa', label: 'Programa' },
    { key: 'monto', label: 'Monto' },
    { key: 'cantidad', label: 'Cant.' },
    { key: 'entregadoPor', label: 'Entregado por' },
  ];

  get curp(): string {
    return this.route.snapshot.paramMap.get('curp') ?? '';
  }

  get nombreCompleto(): string {
    if (!this.detalle) return '—';
    return [
      this.detalle.nombre,
      this.detalle.apellidoPaterno,
      this.detalle.apellidoMaterno,
    ]
      .filter(Boolean)
      .join(' ');
  }

  get estatusVariant(): 'success' | 'danger' {
    return this.detalle?.activo ? 'success' : 'danger';
  }

  get estatusLabel(): string {
    return this.detalle?.activo ? 'ACTIVO' : 'INACTIVO';
  }

  ngOnInit(): void {
    this.loadDetalle();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadDetalle(): void {
    if (!this.curp) return;
    this.loading = true;
    this.beneficiariosService
      .getBeneficiarioByCurp(this.curp, this.page, this.limit)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data) => {
          this.detalle = data;
          this.total = data.historialApoyos.total;
          this.totalPages = data.historialApoyos.totalPages;
          this.apoyosRows = data.historialApoyos.data.map((a) =>
            this.mapApoyo(a),
          );
          this.loading = false;
        },
        error: () => {
          this.notificationService.error('No se pudo cargar el beneficiario');
          this.loading = false;
        },
      });
  }

  loadApoyosPage(newPage: number): void {
    if (!this.detalle) return;
    this.loadingTable = true;
    this.page = newPage;
    this.beneficiariosService
      .getBeneficiarioByCurp(this.curp, this.page, this.limit)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data) => {
          this.apoyosRows = data.historialApoyos.data.map((a) =>
            this.mapApoyo(a),
          );
          this.total = data.historialApoyos.total;
          this.totalPages = data.historialApoyos.totalPages;
          this.loadingTable = false;
        },
        error: () => {
          this.notificationService.error('No se pudo cargar el historial');
          this.loadingTable = false;
        },
      });
  }

  prevPage(): void {
    if (this.page > 1) this.loadApoyosPage(this.page - 1);
  }

  nextPage(): void {
    if (this.page < this.totalPages) this.loadApoyosPage(this.page + 1);
  }

  goBack(): void {
    this.router.navigate(['../'], { relativeTo: this.route });
  }

  private mapApoyo(a: ApoyoHistorial): ApoyoRow {
    return {
      folio: a.folio,
      fecha: this.formatDate(a.fecha),
      tipo: a.tipo,
      programa: a.programaId?.nombre ?? '—',
      monto: a.monto > 0 ? `$${a.monto.toLocaleString('es-MX')}` : '—',
      cantidad: a.cantidad,
      entregadoPor: a.entregadoPor?.nombre ?? '—',
    };
  }

  private formatDate(dateString: string): string {
    return dayjs(dateString).tz('America/Mexico_City').format('DD/MM/YYYY');
  }
}
