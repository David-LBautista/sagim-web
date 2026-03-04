import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import dayjs from 'dayjs';
import { Subject } from 'rxjs';
import { MatDialogModule } from '@angular/material/dialog';
import { MatDialog } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import {
  DataTableComponent,
  type TableColumn,
} from '../../../../shared/components/data-table/data-table.component';
import { KpiCardComponent } from '../../../../shared/components/kpi-card/kpi-card.component';
import { ActionButtonComponent } from '../../../../shared/components/action-button/action-button.component';
import { FolioTagComponent } from '../../../../shared/components/folio-tag/folio-tag.component';
import { ApoyosService } from '../../services/apoyos.service';
import { NotificationService } from '../../../../shared/services/notification.service';
import { ApoyoFormDialogComponent } from '../../components/apoyo-form-dialog/apoyo-form-dialog.component';
import { GenerarReporteDialogComponent } from '../../components/generar-reporte-dialog/generar-reporte-dialog.component';
import type {
  ApoyosDashboard,
  Apoyo,
  BeneficiarioRef,
  ProgramaRef,
} from '../../models/apoyos.model';

@Component({
  selector: 'app-apoyos',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatCardModule,
    MatProgressBarModule,
    DataTableComponent,
    KpiCardComponent,
    ActionButtonComponent,
    FolioTagComponent,
  ],
  templateUrl: './apoyos.page.html',
  styleUrls: ['./apoyos.page.scss'],
})
export class ApoyosPage implements OnInit, OnDestroy {
  private dialog = inject(MatDialog);
  private apoyosService = inject(ApoyosService);
  private notificationService = inject(NotificationService);
  private destroy$ = new Subject<void>();

  loadingKpis = true;
  dashboard: ApoyosDashboard | null = null;

  readonly tableColumns: TableColumn[] = [
    { key: 'folio', label: 'Folio' },
    { key: 'beneficiario', label: 'Beneficiario' },
    { key: 'programa', label: 'Programa' },
    { key: 'tipo', label: 'Tipo', align: 'center' },
    { key: 'fecha', label: 'Fecha', align: 'center' },
    { key: 'monto', label: 'Monto', align: 'right' },
  ];

  ngOnInit(): void {
    this.loadDashboard();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  onNuevoApoyo(): void {
    const dialogRef = this.dialog.open(ApoyoFormDialogComponent, {
      width: '700px',
      maxWidth: '95vw',
      disableClose: true,
    });
    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.loadDashboard();
      }
    });
  }

  onGenerarReporte(): void {
    this.dialog.open(GenerarReporteDialogComponent, {
      width: '480px',
      maxWidth: '95vw',
      data: { tipo: 'apoyos' },
    });
  }

  loadDashboard(): void {
    this.loadingKpis = true;
    this.apoyosService.getDashboard().subscribe({
      next: (data) => {
        this.dashboard = data;
        this.loadingKpis = false;
      },
      error: () => {
        this.loadingKpis = false;
      },
    });
  }

  get totalMontoLabel(): string {
    if (!this.dashboard) return '—';
    const total = this.dashboard.porPrograma.reduce(
      (acc, p) => acc + p.monto,
      0,
    );
    return `$${Number(total).toLocaleString('es-MX')}`;
  }

  get crecimientoLabel(): string {
    if (!this.dashboard) return '—';
    const val = this.dashboard.resumen.crecimientoMensual;
    return `${val > 0 ? '+' : ''}${val}%`;
  }

  get tableData(): Array<Record<string, any>> {
    if (!this.dashboard?.recientes) return [];
    return this.dashboard.recientes.map((apoyo) => ({
      folio: apoyo.folio,
      beneficiario: this.getNombreBeneficiario(apoyo),
      programa: this.getNombrePrograma(apoyo),
      tipo: apoyo.tipo,
      fecha: this.formatDate(apoyo.fecha),
      monto: apoyo.monto ?? null,
    }));
  }

  private getNombreBeneficiario(apoyo: Apoyo): string {
    const b = apoyo.beneficiarioId as BeneficiarioRef;
    if (!b || typeof b === 'string') return '—';
    return `${b.nombre} ${b.apellidoPaterno} ${b.apellidoMaterno ?? ''}`.trim();
  }

  private getNombrePrograma(apoyo: Apoyo): string {
    const p = apoyo.programaId as ProgramaRef;
    if (!p || typeof p === 'string') return '—';
    return p.nombre;
  }

  private formatDate(dateString: string): string {
    return dayjs(dateString).tz('America/Mexico_City').format('DD/MM/YYYY');
  }
}
