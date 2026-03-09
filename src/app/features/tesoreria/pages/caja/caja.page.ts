import {
  Component,
  inject,
  OnInit,
  OnDestroy,
  signal,
  computed,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
  FormControl,
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
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatRadioModule } from '@angular/material/radio';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatTableModule } from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDividerModule } from '@angular/material/divider';
import { MatTabsModule } from '@angular/material/tabs';

import { CajaService } from '../../services/caja.service';
import { OrdenesInternasService } from '../../services/ordenes-internas.service';
import { AuthService } from '../../../auth/services/auth.service';
import { NotificationService } from '../../../../shared/services/notification.service';
import { NotificationType } from '../../../../shared/models/notification.model';
import {
  ServicioCajaItem,
  CiudadanoSearchResult,
  MovimientoDiario,
  TotalesDia,
  MetodoPago,
  ReporteDiarioPdfResponse,
} from '../../models/caja.model';
import {
  OrdenInterna,
  nombreCiudadano,
  CobrarOrdenDto,
} from '../../models/ordenes-internas.model';
import { ActionButtonComponent } from '../../../../shared/components/action-button/action-button.component';
import { FolioTagComponent } from '../../../../shared/components/folio-tag/folio-tag.component';
import { WebSocketService } from '../../../../core/services/websocket.service';

@Component({
  selector: 'app-caja',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatButtonToggleModule,
    MatAutocompleteModule,
    MatTableModule,
    MatTooltipModule,
    MatProgressSpinnerModule,
    MatDividerModule,
    MatTabsModule,
    MatRadioModule,
    ActionButtonComponent,
    FolioTagComponent,
  ],
  templateUrl: './caja.page.html',
  styleUrls: ['./caja.page.scss'],
})
export class CajaPage implements OnInit, OnDestroy {
  private cajaService = inject(CajaService);
  private ordenesService = inject(OrdenesInternasService);
  private authService = inject(AuthService);
  private notification = inject(NotificationService);
  private fb = inject(FormBuilder);
  private wsService = inject(WebSocketService);
  private destroy$ = new Subject<void>();
  private ciudadanoBusqueda$ = new Subject<string>();

  // ── Estado ──────────────────────────────────────────────────────────────
  // Tab activo
  tabIndex = signal(0);

  // Tab "Cobro directo"
  todosLosServicios = signal<ServicioCajaItem[]>([]);
  serviciosFiltrados = signal<ServicioCajaItem[]>([]);
  servicioSeleccionado = signal<ServicioCajaItem | null>(null);

  ciudadanosFiltrados = signal<CiudadanoSearchResult[]>([]);
  ciudadanoSeleccionado = signal<CiudadanoSearchResult | null>(null);
  buscandoCiudadano = signal(false);
  modoContribuyente = signal<'registrado' | 'manual'>('registrado');

  // Tab "Cobrar orden"
  ordenesPendientes = signal<OrdenInterna[]>([]);
  buscandoOrdenes = signal(false);
  ordenSeleccionada = signal<OrdenInterna | null>(null);
  metodoPagoOrden = signal<'EFECTIVO' | 'TARJETA' | 'TRANSFERENCIA'>(
    'EFECTIVO',
  );
  submittingOrden = signal(false);

  ordenBusquedaCtrl = new FormControl('');
  folioDocumentoOrdenCtrl = new FormControl('');

  movimientos = signal<MovimientoDiario[]>([]);
  totales = signal<TotalesDia | null>(null);

  loadingMovimientos = signal(true);
  submitting = signal(false);
  generandoCorte = signal(false);

  // ── Info usuario ─────────────────────────────────────────────────────────
  cajeroNombre = computed(() => {
    const user = this.authService.getCurrentUser();
    return user ? `${user.nombre}` : '—';
  });

  fechaHoy = new Date();

  // ── Formulario ───────────────────────────────────────────────────────────
  servicioBusquedaCtrl = new FormControl('');
  ciudadanoBusquedaCtrl = new FormControl('');

  form: FormGroup = this.fb.group({
    monto: [
      { value: 0, disabled: true },
      [Validators.required, Validators.min(1)],
    ],
    metodoPago: ['EFECTIVO', Validators.required],
    nombreLibre: [''],
    referenciaDocumento: [''],
    observaciones: [''],
  });

  displayedColumns = [
    'hora',
    'folio',
    'servicio',
    'ciudadano',
    'monto',
    'canal',
    'acciones',
  ];

  ngOnInit(): void {
    this.cargarServicios();
    this.cargarMovimientosDia();
    this.setupServicioFilter();
    this.setupCiudadanoSearch();
    this.setupBusquedaOrdenCiudadano();
    this.setupWebSocket();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // ── Setup ────────────────────────────────────────────────────────────────
  private setupWebSocket(): void {
    this.wsService.nuevoPagoCaja$
      .pipe(takeUntil(this.destroy$))
      .subscribe((evento) => {
        this.cargarMovimientosDia();
        this.notification.show({
          message: `💰 Nuevo pago — ${evento.folio} — ${evento.ciudadano ?? evento.servicio ?? ''}`,
          type: NotificationType.SUCCESS,
        });
      });

    // Refrescar movimientos si el socket se reconectó
    this.wsService.reconectado$.pipe(takeUntil(this.destroy$)).subscribe(() => {
      console.log('[Caja] reconectado — refrescando movimientos');
      this.cargarMovimientosDia();
    });
  }
  private cargarServicios(): void {
    this.cajaService
      .getServiciosActivos()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (lista) => {
          this.todosLosServicios.set(lista);
          this.serviciosFiltrados.set(lista);
        },
      });
  }

  cargarMovimientosDia(): void {
    this.loadingMovimientos.set(true);
    this.cajaService
      .getReporteDiario()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res) => {
          this.movimientos.set(res.pagos);
          this.totales.set({
            totalRecaudado: res.totalRecaudado,
            totalOperaciones: res.totalOperaciones,
            porCanal: res.porCanal,
          });
          this.loadingMovimientos.set(false);
        },
        error: () => {
          this.loadingMovimientos.set(false);
        },
      });
  }

  private setupServicioFilter(): void {
    this.servicioBusquedaCtrl.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe((valor) => {
        if (typeof valor !== 'string') return;
        const q = valor.toLowerCase().trim();
        this.serviciosFiltrados.set(
          q
            ? this.todosLosServicios().filter(
                (s) =>
                  s.nombre.toLowerCase().includes(q) ||
                  s.clave.toLowerCase().includes(q),
              )
            : this.todosLosServicios(),
        );
        // Si el usuario borra el texto, limpiar selección
        if (!valor) this.limpiarServicio();
      });
  }

  private setupCiudadanoSearch(): void {
    this.ciudadanoBusquedaCtrl.valueChanges
      .pipe(
        debounceTime(400),
        distinctUntilChanged(),
        takeUntil(this.destroy$),
        switchMap((valor) => {
          if (typeof valor !== 'string' || valor.length < 3) {
            this.ciudadanosFiltrados.set([]);
            return of([]);
          }
          this.buscandoCiudadano.set(true);
          return this.cajaService.buscarCiudadanos(valor);
        }),
      )
      .subscribe({
        next: (resultados) => {
          this.ciudadanosFiltrados.set(resultados);
          this.buscandoCiudadano.set(false);
        },
        error: () => this.buscandoCiudadano.set(false),
      });
  }

  private setupBusquedaOrdenCiudadano(): void {
    this.ordenBusquedaCtrl.valueChanges
      .pipe(
        debounceTime(400),
        distinctUntilChanged(),
        takeUntil(this.destroy$),
        switchMap((valor) => {
          if (typeof valor !== 'string' || valor.trim().length < 3) {
            this.ordenesPendientes.set([]);
            this.ordenSeleccionada.set(null);
            return of([]);
          }
          this.buscandoOrdenes.set(true);
          return this.ordenesService
            .getOrdenes({ busqueda: valor.trim(), estado: 'PENDIENTE' })
            .pipe(finalize(() => this.buscandoOrdenes.set(false)));
        }),
      )
      .subscribe((ordenes) => this.ordenesPendientes.set(ordenes));
  }

  // ── Selección de servicio ────────────────────────────────────────────────
  onServicioSeleccionado(servicio: ServicioCajaItem): void {
    this.servicioSeleccionado.set(servicio);

    if (servicio.montoVariable) {
      this.form.get('monto')!.enable();
      this.form.get('monto')!.setValue(null);
    } else {
      this.form.get('monto')!.setValue(servicio.costo);
      this.form.get('monto')!.disable();
    }

    // Limpiar contribuyente al cambiar servicio
    this.limpiarCiudadano();
    this.form.get('nombreLibre')!.setValue('');
  }

  displayServicio(s: ServicioCajaItem | null): string {
    return s?.nombre ?? '';
  }

  limpiarServicio(): void {
    this.servicioSeleccionado.set(null);
    this.form.get('monto')!.setValue(0);
    this.form.get('monto')!.disable();
    this.limpiarCiudadano();
  }

  // ── Selección de ciudadano ───────────────────────────────────────────────
  onCiudadanoSeleccionado(ciudadano: CiudadanoSearchResult): void {
    this.ciudadanoSeleccionado.set(ciudadano);
    this.ciudadanoBusquedaCtrl.setValue(ciudadano.nombreCompleto, {
      emitEvent: false,
    });
    this.ciudadanosFiltrados.set([]);
  }

  displayCiudadano(c: CiudadanoSearchResult | null): string {
    return c?.nombreCompleto ?? '';
  }

  limpiarCiudadano(): void {
    this.ciudadanoSeleccionado.set(null);
    this.ciudadanoBusquedaCtrl.setValue('', { emitEvent: false });
    this.ciudadanosFiltrados.set([]);
  }

  onModoContribuyenteChange(modo: 'registrado' | 'manual'): void {
    this.modoContribuyente.set(modo);
    this.limpiarCiudadano();
    this.form.get('nombreLibre')!.setValue('');
  }

  // ── Validación del botón cobrar ──────────────────────────────────────────
  get puedeCobrar(): boolean {
    const servicio = this.servicioSeleccionado();
    if (!servicio) return false;
    const monto = this.form.getRawValue().monto;
    if (!monto || monto < 1) return false;
    if (servicio.requiereContribuyente) {
      if (this.modoContribuyente() === 'registrado') {
        if (!this.ciudadanoSeleccionado()) return false;
      } else {
        if (!this.form.value.nombreLibre?.trim()) return false;
      }
    }
    return true;
  }

  // ── Registrar cobro ──────────────────────────────────────────────────────
  onRegistrarCobro(): void {
    const servicio = this.servicioSeleccionado();
    if (!servicio || !this.puedeCobrar) return;

    this.submitting.set(true);
    const ciudadano = this.ciudadanoSeleccionado();
    const nombreLibre = this.form.value.nombreLibre?.trim();
    const dto = {
      servicioId: servicio._id,
      monto: this.form.getRawValue().monto,
      metodoPago: this.form.value.metodoPago as MetodoPago,
      ...(ciudadano
        ? { ciudadanoId: ciudadano._id }
        : nombreLibre
          ? { nombreContribuyente: nombreLibre }
          : {}),
      ...(this.form.value.referenciaDocumento?.trim() && {
        referenciaDocumento: this.form.value.referenciaDocumento.trim(),
      }),
      ...(this.form.value.observaciones?.trim() && {
        observaciones: this.form.value.observaciones.trim(),
      }),
    };

    this.cajaService
      .registrarCobro(dto)
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => this.submitting.set(false)),
      )
      .subscribe({
        next: (pago) => {
          this.notification.show({
            message: `Cobro registrado — Folio ${pago.folio}`,
            type: NotificationType.SUCCESS,
          });
          if (pago.reciboUrl) {
            window.open(pago.reciboUrl, '_blank');
          } else {
            this.notification.show({
              message:
                'El cobro fue registrado pero el recibo no está disponible en este momento.',
              type: NotificationType.WARNING,
            });
          }
          this.resetForm();
          this.cargarMovimientosDia();
        },
        error: (err) => {
          this.notification.show({
            message: err?.error?.message ?? 'Error al registrar el cobro',
            type: NotificationType.ERROR,
          });
        },
      });
  }

  private resetForm(): void {
    this.servicioSeleccionado.set(null);
    this.ciudadanoSeleccionado.set(null);
    this.modoContribuyente.set('registrado');
    this.servicioBusquedaCtrl.setValue('', { emitEvent: false });
    this.ciudadanoBusquedaCtrl.setValue('', { emitEvent: false });
    this.form.reset({
      monto: 0,
      metodoPago: 'EFECTIVO',
      nombreLibre: '',
      referenciaDocumento: '',
      observaciones: '',
    });
    this.form.get('monto')!.disable();
    this.ciudadanosFiltrados.set([]);
  }

  // ── Tab: Cobrar orden ────────────────────────────────────────────────────
  onSeleccionarOrden(orden: OrdenInterna): void {
    const isaSame = this.ordenSeleccionada()?._id === orden._id;
    this.ordenSeleccionada.set(isaSame ? null : orden);
    this.folioDocumentoOrdenCtrl.setValue(
      isaSame ? '' : (orden.folioDocumento ?? ''),
      { emitEvent: false },
    );
  }

  limpiarCiudadanoOrden(): void {
    this.ordenBusquedaCtrl.setValue('', { emitEvent: false });
    this.folioDocumentoOrdenCtrl.setValue('', { emitEvent: false });
    this.ordenesPendientes.set([]);
    this.ordenSeleccionada.set(null);
  }

  onCobrarOrdenInterna(): void {
    const orden = this.ordenSeleccionada();
    if (!orden || this.submittingOrden()) return;

    this.submittingOrden.set(true);
    const folioDoc = this.folioDocumentoOrdenCtrl.value?.trim();
    const dto: CobrarOrdenDto = {
      metodoPago: this.metodoPagoOrden(),
      ...(!orden.ciudadanoId && orden.nombreContribuyente
        ? { nombreContribuyente: orden.nombreContribuyente }
        : {}),
      ...(folioDoc ? { folioDocumento: folioDoc } : {}),
    };

    this.ordenesService
      .cobrarOrden(orden._id, dto)
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => this.submittingOrden.set(false)),
      )
      .subscribe({
        next: (pago: any) => {
          this.notification.show({
            message: `Cobro registrado — Folio ${pago?.folio ?? orden.folio}`,
            type: NotificationType.SUCCESS,
          });
          if (pago?.reciboUrl) window.open(pago.reciboUrl, '_blank');
          else
            this.notification.show({
              message:
                'El cobro fue registrado pero el recibo no está disponible aún.',
              type: NotificationType.WARNING,
            });
          this.limpiarCiudadanoOrden();
          this.cargarMovimientosDia();
        },
        error: (err: any) =>
          this.notification.show({
            message: err?.error?.message ?? 'Error al cobrar la orden',
            type: NotificationType.ERROR,
          }),
      });
  }

  nombreOrden(orden: OrdenInterna): string {
    if (orden.ciudadanoId) return nombreCiudadano(orden.ciudadanoId);
    return orden.nombreContribuyente ?? '—';
  }

  // ── Corte del día ────────────────────────────────────────────────────────
  onCorteDia(): void {
    if (this.generandoCorte()) return;
    this.generandoCorte.set(true);
    this.cajaService
      .getReporteDiarioPdf()
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => this.generandoCorte.set(false)),
      )
      .subscribe({
        next: ({ url }) => window.open(url, '_blank'),
        error: () =>
          this.notification.show({
            message: 'No se pudo generar el reporte. Intenta de nuevo.',
            type: NotificationType.ERROR,
          }),
      });
  }

  // ── Reimprimir recibo ─────────────────────────────────────────────────────
  onReimprimirRecibo(mov: MovimientoDiario): void {
    this.cajaService
      .getReciboUrl(mov._id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: ({ reciboUrl }) => window.open(reciboUrl, '_blank'),
        error: () =>
          this.notification.show({
            message: 'No se pudo obtener el recibo. Intenta de nuevo.',
            type: NotificationType.ERROR,
          }),
      });
  }

  // ── Helpers ──────────────────────────────────────────────────────────────
  get fechaFormateada(): string {
    const fecha = this.fechaHoy.toLocaleDateString('es-MX', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
    return fecha.charAt(0).toUpperCase() + fecha.slice(1);
  }

  formatCurrency(n: number): string {
    return (
      n?.toLocaleString('es-MX', {
        style: 'currency',
        currency: 'MXN',
        minimumFractionDigits: 0,
      }) ?? '$0'
    );
  }
}
