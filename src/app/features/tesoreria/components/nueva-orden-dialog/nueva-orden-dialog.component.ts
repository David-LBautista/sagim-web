import { Component, inject, signal, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import dayjs from 'dayjs';
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
import { MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDividerModule } from '@angular/material/divider';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Clipboard } from '@angular/cdk/clipboard';

import { OrdenesPagoService } from '../../services/ordenes-pago.service';
import { CajaService } from '../../services/caja.service';
import { TesoreriaService } from '../../services/tesoreria.service';
import { NotificationService } from '../../../../shared/services/notification.service';
import { NotificationType } from '../../../../shared/models/notification.model';
import {
  AREAS_RESPONSABLES,
  GenerarOrdenResponse,
} from '../../models/ordenes-pago.model';
import { CiudadanoSearchResult } from '../../models/caja.model';
import { ServicioCobrable } from '../../models/servicios.model';
import { ActionButtonComponent } from '../../../../shared/components/action-button/action-button.component';

type DialogVista = 'form' | 'exito';

@Component({
  selector: 'app-nueva-orden-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatAutocompleteModule,
    MatProgressSpinnerModule,
    MatDividerModule,
    MatTooltipModule,
    ActionButtonComponent,
  ],
  templateUrl: './nueva-orden-dialog.component.html',
  styleUrls: ['./nueva-orden-dialog.component.scss'],
})
export class NuevaOrdenDialogComponent implements OnInit, OnDestroy {
  private fb = inject(FormBuilder);
  private dialogRef = inject(MatDialogRef<NuevaOrdenDialogComponent>);
  private ordenesService = inject(OrdenesPagoService);
  private cajaService = inject(CajaService);
  private tesoreriaService = inject(TesoreriaService);
  private notification = inject(NotificationService);
  private clipboard = inject(Clipboard);
  private destroy$ = new Subject<void>();

  readonly areas = AREAS_RESPONSABLES;

  // ── Estado ───────────────────────────────────────────────────────────────
  vista = signal<DialogVista>('form');
  submitting = signal(false);
  reenviando = signal(false);
  buscandoCiudadano = signal(false);
  ciudadanosFiltrados = signal<CiudadanoSearchResult[]>([]);
  ciudadanoSeleccionado = signal<CiudadanoSearchResult | null>(null);
  ordenCreada = signal<GenerarOrdenResponse | null>(null);
  linkCopiado = signal(false);
  // ── Servicio ──────────────────────────────────────────────────────────────
  buscandoServicio = signal(false);
  serviciosFiltrados = signal<ServicioCobrable[]>([]);
  servicioSeleccionado = signal<ServicioCobrable | null>(null);
  montoEditable = signal(false);
  servicioBusquedaCtrl = new FormControl('');

  // ── Formulario ────────────────────────────────────────────────────────────
  form = this.fb.group({
    descripcion: [
      { value: '', disabled: true },
      [Validators.required, Validators.maxLength(200)],
    ],
    monto: [
      { value: null as number | null, disabled: true },
      [Validators.required, Validators.min(1)],
    ],
    areaResponsable: [{ value: '', disabled: true }],
    horasValidez: [
      48,
      [Validators.required, Validators.min(1), Validators.max(72)],
    ],
    emailExterno: ['', [Validators.email]],
  });

  ciudadanoBusquedaCtrl = new FormControl('');

  ngOnInit(): void {
    // ── Autocomplete de servicios ─────────────────────────────────────────
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
          return this.tesoreriaService
            .getServicios({ busqueda: valor.trim() })
            .pipe(finalize(() => this.buscandoServicio.set(false)));
        }),
        takeUntil(this.destroy$),
      )
      .subscribe((res) => this.serviciosFiltrados.set(res));

    // ── Autocomplete de ciudadanos ────────────────────────────────────────
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
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // ── Utilidades ────────────────────────────────────────────────────────────
  displayCiudadano(c: CiudadanoSearchResult | null): string {
    if (!c) return '';
    return `${c.nombre} ${c.apellidoPaterno}${c.apellidoMaterno ? ' ' + c.apellidoMaterno : ''}`;
  }

  // ── Servicio ──────────────────────────────────────────────────────────────
  displayServicio(s: ServicioCobrable | null): string {
    return s ? s.nombre : '';
  }

  onServicioSeleccionado(s: ServicioCobrable): void {
    this.servicioSeleccionado.set(s);
    // Pre-llenar todos los campos relacionados
    this.form.patchValue({
      descripcion: s.descripcion,
      monto: s.montoVariable ? null : s.costo,
      areaResponsable: s.areaResponsable,
    });
    // Monto: variable = editable, fijo = sigue bloqueado
    if (s.montoVariable) {
      this.form.get('monto')!.enable();
      this.montoEditable.set(true);
    } else {
      this.form.get('monto')!.disable();
      this.montoEditable.set(false);
    }
  }

  limpiarServicio(): void {
    this.servicioSeleccionado.set(null);
    this.servicioBusquedaCtrl.setValue('', { emitEvent: false });
    this.serviciosFiltrados.set([]);
    // Limpiar y volver a bloquear los 3 campos
    this.form.patchValue({ descripcion: '', monto: null, areaResponsable: '' });
    this.form.get('descripcion')!.disable();
    this.form.get('monto')!.disable();
    this.form.get('areaResponsable')!.disable();
    this.montoEditable.set(false);
  }

  onCiudadanoSeleccionado(c: CiudadanoSearchResult): void {
    this.ciudadanoSeleccionado.set(c);
  }

  limpiarCiudadano(): void {
    this.ciudadanoSeleccionado.set(null);
    this.ciudadanoBusquedaCtrl.setValue('', { emitEvent: false });
    this.ciudadanosFiltrados.set([]);
  }

  get paymentLink(): string {
    const orden = this.ordenCreada();
    return orden ? this.ordenesService.buildPaymentLink(orden.token) : '';
  }

  get vigenciaTexto(): string {
    const orden = this.ordenCreada();
    if (!orden) return '';
    const horas = this.form.value.horasValidez ?? 48;
    const vence = dayjs(orden.expiresAt).tz('America/Mexico_City');
    return `${horas} horas — vence el ${vence.format('DD/MM/YYYY')} a las ${vence.format('HH:mm')}`;
  }

  // ── Acciones ──────────────────────────────────────────────────────────────
  onGenerarOrden(): void {
    if (this.form.invalid || this.submitting() || !this.servicioSeleccionado())
      return;
    const { descripcion, monto, areaResponsable, horasValidez, emailExterno } =
      this.form.getRawValue();
    const ciudadano = this.ciudadanoSeleccionado();

    this.submitting.set(true);
    this.ordenesService
      .generarOrden({
        descripcion: descripcion!.trim(),
        monto: monto!,
        ...(areaResponsable && { areaResponsable }),
        ...(horasValidez !== 48 && { horasValidez: horasValidez ?? 48 }),
        ...(ciudadano && { ciudadanoId: ciudadano._id }),
        ...(!ciudadano &&
          emailExterno?.trim() && { emailCiudadano: emailExterno.trim() }),
        ...(this.servicioSeleccionado() && {
          servicioId: this.servicioSeleccionado()!._id,
        }),
      })
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => this.submitting.set(false)),
      )
      .subscribe({
        next: (orden) => {
          this.ordenCreada.set(orden);
          this.vista.set('exito');
        },
        error: (err) =>
          this.notification.show({
            message: err?.error?.message ?? 'Error al generar la orden',
            type: NotificationType.ERROR,
          }),
      });
  }

  onCopiarLink(): void {
    this.clipboard.copy(this.paymentLink);
    this.linkCopiado.set(true);
    setTimeout(() => this.linkCopiado.set(false), 2500);
  }

  onReenviarEmail(): void {
    const orden = this.ordenCreada();
    if (!orden || this.reenviando()) return;
    this.reenviando.set(true);
    this.ordenesService
      .reenviarLink(orden._id)
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => this.reenviando.set(false)),
      )
      .subscribe({
        next: () =>
          this.notification.show({
            message: 'Link reenviado al correo del ciudadano.',
            type: NotificationType.SUCCESS,
          }),
        error: () =>
          this.notification.show({
            message: 'No se pudo reenviar el link.',
            type: NotificationType.ERROR,
          }),
      });
  }

  onCerrar(): void {
    this.dialogRef.close(this.ordenCreada());
  }
}
