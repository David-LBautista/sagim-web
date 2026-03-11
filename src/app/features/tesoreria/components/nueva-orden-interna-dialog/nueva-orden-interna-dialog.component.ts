import { Component, inject, signal, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormControl,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import {
  Subject,
  takeUntil,
  debounceTime,
  distinctUntilChanged,
  switchMap,
  of,
  finalize,
} from 'rxjs';
import {
  MatDialogRef,
  MatDialogModule,
  MAT_DIALOG_DATA,
} from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDividerModule } from '@angular/material/divider';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatRadioModule } from '@angular/material/radio';
import { MatSelectModule } from '@angular/material/select';

import { OrdenesInternasService } from '../../services/ordenes-internas.service';
import { CajaService } from '../../services/caja.service';
import { TesoreriaService } from '../../services/tesoreria.service';
import { NotificationService } from '../../../../shared/services/notification.service';
import { CatalogosService } from '../../../../shared/services/catalogos.service';
import { NotificationType } from '../../../../shared/models/notification.model';
import { OrdenInterna } from '../../models/ordenes-internas.model';
import { CiudadanoSearchResult } from '../../models/caja.model';
import { ServicioCobrable } from '../../models/servicios.model';

export interface NuevaOrdenInternaDialogData {
  areaResponsable: string;
  /** Categoría para pre-filtrar servicios (ej. 'Registro Civil') */
  categoriaServicio?: string;
}

@Component({
  selector: 'app-nueva-orden-interna-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatAutocompleteModule,
    MatProgressSpinnerModule,
    MatDividerModule,
    MatTooltipModule,
    MatRadioModule,
    MatSelectModule,
  ],
  templateUrl: './nueva-orden-interna-dialog.component.html',
  styleUrls: ['./nueva-orden-interna-dialog.component.scss'],
})
export class NuevaOrdenInternaDialogComponent implements OnInit, OnDestroy {
  private fb = inject(FormBuilder);
  readonly dialogData = inject<NuevaOrdenInternaDialogData>(MAT_DIALOG_DATA);
  private dialogRef = inject(MatDialogRef<NuevaOrdenInternaDialogComponent>);
  private service = inject(OrdenesInternasService);
  private cajaService = inject(CajaService);
  private tesoreriaService = inject(TesoreriaService);
  private notification = inject(NotificationService);
  private catalogosService = inject(CatalogosService);
  private destroy$ = new Subject<void>();

  // ── Estado ───────────────────────────────────────────────────────────────
  submitting = signal(false);
  modoContribuyente = signal<'registrado' | 'manual'>('registrado');
  areasResponsables = signal<string[]>([]);

  // Ciudadano
  buscandoCiudadano = signal(false);
  ciudadanosFiltrados = signal<CiudadanoSearchResult[]>([]);
  ciudadanoSeleccionado = signal<CiudadanoSearchResult | null>(null);
  ciudadanoBusquedaCtrl = new FormControl('');

  // Servicio (opcional)
  buscandoServicio = signal(false);
  serviciosFiltrados = signal<ServicioCobrable[]>([]);
  servicioSeleccionado = signal<ServicioCobrable | null>(null);
  servicioBusquedaCtrl = new FormControl('');

  // ── Formulario ────────────────────────────────────────────────────────────
  form = this.fb.group({
    nombreManual: ['', Validators.maxLength(120)],
    descripcion: [{ value: '', disabled: true }, Validators.maxLength(200)],
    monto: [
      { value: null as number | null, disabled: true },
      [Validators.required, Validators.min(1)],
    ],
    folioDocumento: ['', Validators.maxLength(60)],
    areaResponsable: [
      { value: this.dialogData.areaResponsable ?? '', disabled: true },
      Validators.required,
    ],
  });

  ngOnInit(): void {
    // Cargar áreas responsables desde el catálogo
    this.catalogosService
      .getAreasResponsables()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (areas) => {
          this.areasResponsables.set(areas);
          // Re-patchear para que mat-select encuentre la opción ya cargada
          this.form
            .get('areaResponsable')!
            .setValue(this.dialogData.areaResponsable ?? '');
        },
        error: () => {
          if (this.dialogData.areaResponsable) {
            this.areasResponsables.set([this.dialogData.areaResponsable]);
            this.form
              .get('areaResponsable')!
              .setValue(this.dialogData.areaResponsable);
          }
        },
      });

    // Autocomplete de ciudadanos
    this.ciudadanoBusquedaCtrl.valueChanges
      .pipe(
        debounceTime(300),
        distinctUntilChanged(),
        switchMap((valor) => {
          if (typeof valor !== 'string' || valor.trim().length < 2) {
            this.ciudadanosFiltrados.set([]);
            return of([]);
          }
          this.buscandoCiudadano.set(true);
          return this.cajaService
            .buscarCiudadanos(valor.trim())
            .pipe(finalize(() => this.buscandoCiudadano.set(false)));
        }),
        takeUntil(this.destroy$),
      )
      .subscribe((res) => this.ciudadanosFiltrados.set(res));

    // Autocomplete de servicios
    this.servicioBusquedaCtrl.valueChanges
      .pipe(
        debounceTime(300),
        distinctUntilChanged(),
        switchMap((valor) => {
          if (typeof valor !== 'string' || valor.trim().length < 2) {
            this.serviciosFiltrados.set([]);
            return of([]);
          }
          this.buscandoServicio.set(true);
          const params: { busqueda: string; categoria?: any } = {
            busqueda: valor.trim(),
          };
          if (this.dialogData.categoriaServicio) {
            params.categoria = this.dialogData.categoriaServicio as any;
          }
          return this.tesoreriaService
            .getServicios(params)
            .pipe(finalize(() => this.buscandoServicio.set(false)));
        }),
        takeUntil(this.destroy$),
      )
      .subscribe((res) => this.serviciosFiltrados.set(res));
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // ── Utilidades ────────────────────────────────────────────────────────────
  displayCiudadano = (c: CiudadanoSearchResult | null): string => {
    if (!c) return '';
    return [c.nombre, c.apellidoPaterno, c.apellidoMaterno]
      .filter(Boolean)
      .join(' ');
  };

  displayServicio = (s: ServicioCobrable | null): string => {
    return s ? s.nombre : '';
  };

  // ── Acciones ciudadano ────────────────────────────────────────────────────
  onCiudadanoSeleccionado(c: CiudadanoSearchResult): void {
    this.ciudadanoSeleccionado.set(c);
  }

  onModoChange(modo: 'registrado' | 'manual'): void {
    this.modoContribuyente.set(modo);
    if (modo === 'registrado') {
      this.form.patchValue({ nombreManual: '' });
    } else {
      this.limpiarCiudadano();
    }
  }

  limpiarCiudadano(): void {
    this.ciudadanoSeleccionado.set(null);
    this.ciudadanoBusquedaCtrl.setValue('', { emitEvent: false });
    this.ciudadanosFiltrados.set([]);
  }

  // ── Acciones servicio ─────────────────────────────────────────────────────
  onServicioSeleccionado(s: ServicioCobrable): void {
    this.servicioSeleccionado.set(s);
    this.form.get('descripcion')!.setValue(s.nombre);
    if (s.areaResponsable) {
      this.form.get('areaResponsable')!.setValue(s.areaResponsable);
    }
    if (s.montoVariable) {
      this.form.get('monto')!.enable();
      this.form.get('monto')!.setValue(null);
    } else {
      this.form.get('monto')!.setValue(s.costo);
      this.form.get('monto')!.disable();
    }
  }

  limpiarServicio(): void {
    this.servicioSeleccionado.set(null);
    this.servicioBusquedaCtrl.setValue('', { emitEvent: false });
    this.serviciosFiltrados.set([]);
    this.form.get('descripcion')!.setValue('');
    this.form.get('monto')!.setValue(null);
    this.form.get('monto')!.disable();
    this.form
      .get('areaResponsable')!
      .setValue(this.dialogData.areaResponsable ?? '');
  }

  // ── Submit ────────────────────────────────────────────────────────────────
  get ciudadanoValido(): boolean {
    if (this.modoContribuyente() === 'registrado') {
      return !!this.ciudadanoSeleccionado();
    }
    return !!this.form.value.nombreManual?.trim();
  }

  get formValido(): boolean {
    const raw = this.form.getRawValue();
    return (
      this.ciudadanoValido &&
      !!raw.descripcion?.trim() &&
      !!raw.monto &&
      !this.form.invalid
    );
  }

  onGenerarOrden(): void {
    if (!this.formValido || this.submitting()) return;

    const modo = this.modoContribuyente();
    const ciudadano = this.ciudadanoSeleccionado();
    const servicio = this.servicioSeleccionado();
    const { descripcion, monto, nombreManual, folioDocumento } =
      this.form.getRawValue();

    this.submitting.set(true);
    this.service
      .crearOrden({
        ...(modo === 'registrado' && ciudadano
          ? { ciudadanoId: ciudadano._id }
          : { nombreContribuyente: nombreManual?.trim() }),
        ...(servicio && { servicioId: servicio._id }),
        ...(folioDocumento?.trim() && {
          folioDocumento: folioDocumento.trim(),
        }),
        monto: monto!,
        descripcion: descripcion!.trim(),
        areaResponsable: this.form.getRawValue().areaResponsable!,
      })
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => this.submitting.set(false)),
      )
      .subscribe({
        next: (orden) => {
          try {
            const folio = orden?.folio ?? '';
            this.notification.show({
              message: folio
                ? `Orden generada — Folio ${folio}`
                : 'Orden de pago generada correctamente.',
              type: NotificationType.SUCCESS,
            });
          } finally {
            this.dialogRef.close(orden ?? null);
          }
        },
        error: (err) =>
          this.notification.show({
            message: err?.error?.message ?? 'Error al generar la orden',
            type: NotificationType.ERROR,
          }),
      });
  }

  onCerrar(): void {
    this.dialogRef.close();
  }
}
