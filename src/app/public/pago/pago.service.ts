import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiEndpoints } from '../../core/enums/api-endpoints.enum';
import type {
  OrdenPagoPublica,
  PaymentIntentResponse,
  PagoResponse,
  ReciboResponse,
} from '../../features/tesoreria/models/ordenes-pago.model';

@Injectable({ providedIn: 'root' })
export class PagoService {
  private http = inject(HttpClient);
  private base = environment.apiUrl;

  getOrdenByToken(token: string): Observable<OrdenPagoPublica> {
    const url =
      this.base + ApiEndpoints.PAGOS_ORDEN_BY_TOKEN.replace(':token', token);
    return this.http.get<OrdenPagoPublica>(url);
  }

  crearIntent(token: string): Observable<PaymentIntentResponse> {
    const url =
      this.base + ApiEndpoints.PAGOS_CREAR_INTENT.replace(':token', token);
    return this.http.post<PaymentIntentResponse>(url, {});
  }

  pagar(
    token: string,
    stripePaymentIntentId: string,
  ): Observable<PagoResponse> {
    const url = this.base + ApiEndpoints.PAGOS_PAGAR.replace(':token', token);
    return this.http.post<PagoResponse>(url, { stripePaymentIntentId });
  }

  getRecibo(pagoId: string): Observable<ReciboResponse> {
    const url =
      this.base + ApiEndpoints.PAGOS_RECIBO.replace(':pagoId', pagoId);
    return this.http.get<ReciboResponse>(url);
  }
}
