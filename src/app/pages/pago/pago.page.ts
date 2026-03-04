import { Component, DestroyRef, inject, OnInit, signal } from '@angular/core';
import dayjs from 'dayjs';
import { ActivatedRoute } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';
import {
  loadStripe,
  type Stripe,
  type StripeElements,
  type StripeCardElement,
} from '@stripe/stripe-js';
import { PagoService } from './pago.service';
import { environment } from '../../../environments/environment';
import type { OrdenPagoPublica } from '../../features/tesoreria/models/ordenes-pago.model';

// ── Estados de la vista ────────────────────────────────────────────────
type PagoEstado =
  | 'cargando'
  | 'listo'
  | 'procesando'
  | 'exito'
  | 'pagada'
  | 'cancelada'
  | 'expirada'
  | 'error';

@Component({
  selector: 'app-pago',
  standalone: true,
  imports: [MatProgressSpinnerModule, MatIconModule],
  templateUrl: './pago.page.html',
  styleUrl: './pago.page.scss',
})
export class PagoPage implements OnInit {
  private route = inject(ActivatedRoute);
  private pagoService = inject(PagoService);
  private destroyRef = inject(DestroyRef);

  // ── Estado ──────────────────────────────────────────────────────────
  estado = signal<PagoEstado>('cargando');
  orden = signal<OrdenPagoPublica | null>(null);
  errorMsg = signal('');
  folio = signal('');
  reciboUrl = signal('');

  // ── Stripe internals ──────────────────────────────────────────────────
  private stripe: Stripe | null = null;
  private elements: StripeElements | null = null;
  private cardElement: StripeCardElement | null = null;
  private clientSecret = '';

  // ── Init ─────────────────────────────────────────────────────────────
  ngOnInit(): void {
    const token = this.route.snapshot.paramMap.get('token')!;
    this._cargarOrdenYMontarStripe(token);
  }

  // ── Carga de orden + intento de pago ─────────────────────────────────────
  private _cargarOrdenYMontarStripe(token: string): void {
    this.pagoService
      .getOrdenByToken(token)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (orden) => {
          this.orden.set(orden);

          if (orden.estado === 'PAGADA') {
            this.estado.set('pagada');
            return;
          }
          if (orden.estado === 'CANCELADA') {
            this.estado.set('cancelada');
            return;
          }
          if (
            orden.estado === 'EXPIRADA' ||
            new Date(orden.expiresAt) < new Date()
          ) {
            this.estado.set('expirada');
            return;
          }

          // PENDIENTE → crear PaymentIntent y montar Stripe Card Element
          this.pagoService.crearIntent(token).subscribe({
            next: async (intent) => {
              this.clientSecret = intent.clientSecret;
              this.stripe = await loadStripe(environment.stripePublishableKey);

              if (!this.stripe) {
                this.estado.set('error');
                this.errorMsg.set('No se pudo cargar el procesador de pagos.');
                return;
              }

              // No se pasa clientSecret a elements() en el flujo de CardElement
              this.elements = this.stripe.elements({
                locale: 'es-419',
                appearance: {
                  theme: 'stripe',
                  variables: {
                    colorPrimary: '#1F6FAE',
                    colorBackground: '#ffffff',
                    borderRadius: '8px',
                    fontFamily: '"Inter", sans-serif',
                  },
                },
              });

              this.estado.set('listo');

              setTimeout(() => {
                this.cardElement = this.elements!.create('card', {
                  hidePostalCode: true,
                  style: {
                    base: {
                      fontSize: '16px',
                      fontFamily: '"Inter", sans-serif',
                      color: '#3A3A3A',
                      '::placeholder': { color: '#aab7c4' },
                    },
                    invalid: { color: '#D64545' },
                  },
                });
                this.cardElement.mount('#stripe-card-element');
              }, 0);
            },
            error: () => {
              this.estado.set('error');
              this.errorMsg.set(
                'No se pudo iniciar el proceso de pago. Intente más tarde.',
              );
            },
          });
        },
        error: (err) => {
          this.estado.set('error');
          this.errorMsg.set(
            err?.error?.message ||
              'La orden no existe o el enlace no es válido.',
          );
        },
      });
  }

  // ── Confirmar pago (sin redirect) ───────────────────────────────────────────
  async onPagar(): Promise<void> {
    if (!this.stripe || !this.cardElement || !this.clientSecret) return;
    this.errorMsg.set('');
    this.estado.set('procesando');

    const token = this.route.snapshot.paramMap.get('token')!;

    // Paso 1: Stripe confirma el cobro
    console.log('[Pago] clientSecret:', this.clientSecret);
    const { paymentIntent, error } = await this.stripe.confirmCardPayment(
      this.clientSecret,
      { payment_method: { card: this.cardElement } },
    );

    if (error) {
      this.estado.set('listo');
      this.errorMsg.set(
        error.message ?? 'Ocurrió un error al procesar el pago.',
      );
      return;
    }

    if (paymentIntent?.status !== 'succeeded') {
      this.estado.set('listo');
      this.errorMsg.set('El pago no fue confirmado. Intente de nuevo.');
      return;
    }

    // Paso 2: Notificar al backend y obtener folio + pagoId
    console.log('[pagar] paymentIntent.id:', paymentIntent?.id);
    this.pagoService.pagar(token, paymentIntent!.id).subscribe({
      next: (res) => {
        this.folio.set(res.folio);

        // Paso 3: Obtener URL del recibo PDF
        this.pagoService.getRecibo(res.pagoId).subscribe({
          next: (recibo) => {
            this.reciboUrl.set(recibo.url);
            this.estado.set('exito');
          },
          error: () => {
            // Recibo no crítico: mostrar éxito aunque falle
            this.estado.set('exito');
          },
        });
      },
      error: () => {
        // El cargo ya se realizó en Stripe; mostrar éxito de todas formas
        this.estado.set('exito');
      },
    });
  }

  // ── Helpers de formato ──────────────────────────────────────────────────────
  formatMonto(monto: number): string {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN',
    }).format(monto);
  }

  formatFecha(fecha: string): string {
    return dayjs(fecha)
      .tz('America/Mexico_City')
      .format('DD [de] MMMM [de] YYYY, HH:mm');
  }
}
