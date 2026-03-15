import { Component, DestroyRef, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { PagoService } from './pago.service';
import { MunicipioContextService } from '../municipios/municipio-context.service';
import type { OrdenFolioResponse } from '../../features/tesoreria/models/ordenes-pago.model';

type BusquedaEstado = 'idle' | 'buscando' | 'encontrada' | 'error';

@Component({
  selector: 'app-buscar-pago',
  standalone: true,
  imports: [FormsModule, MatIconModule, MatProgressSpinnerModule],
  templateUrl: './buscar-pago.page.html',
  styleUrl: './buscar-pago.page.scss',
})
export class BuscarPagoPage {
  private pagoService = inject(PagoService);
  private router = inject(Router);
  private destroyRef = inject(DestroyRef);
  private ctx = inject(MunicipioContextService);

  readonly slug = this.ctx.slug;
  readonly municipio = this.ctx.municipio;

  folio = signal('');
  estado = signal<BusquedaEstado>('idle');
  orden = signal<OrdenFolioResponse | null>(null);
  errorMsg = signal('');

  onFolioInput(value: string): void {
    this.folio.set(value.toUpperCase().trim());
  }

  buscar(): void {
    const folio = this.folio();
    if (!folio) return;
    this.estado.set('buscando');
    this.orden.set(null);
    this.errorMsg.set('');

    this.pagoService
      .getOrdenByFolio(folio)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (orden) => {
          this.orden.set(orden);
          this.estado.set('encontrada');
        },
        error: (err) => {
          this.errorMsg.set(
            err?.error?.message ??
              'No se encontró ninguna orden con ese folio.',
          );
          this.estado.set('error');
        },
      });
  }

  procederAlPago(): void {
    const token = this.orden()?.token;
    if (token) {
      this.router.navigate(['/pago', token]);
    }
  }

  formatMonto(monto: number): string {
    return new Intl.NumberFormat('es-MX', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(monto);
  }

  formatFecha(fecha: string | undefined): string {
    if (!fecha) return '—';
    const d = new Date(fecha);
    if (isNaN(d.getTime())) return '—';
    return new Intl.DateTimeFormat('es-MX', {
      dateStyle: 'long',
      timeStyle: 'short',
    }).format(d);
  }
}
