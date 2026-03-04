import { Pipe, PipeTransform } from '@angular/core';
import dayjs from 'dayjs';
import timezone from 'dayjs/plugin/timezone';
import utc from 'dayjs/plugin/utc';
import 'dayjs/locale/es';

// Asegurar plugins en caso de que el pipe se use antes del bootstrap
dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.locale('es');

const TZ = 'America/Mexico_City';

/**
 * Formatea una fecha/string ISO al horario de México (America/Mexico_City).
 *
 * Uso:
 *   {{ pago.fechaPago | fechaLocal }}                     → "03/03/2026 17:30"
 *   {{ pago.fechaPago | fechaLocal:'HH:mm' }}             → "17:30"
 *   {{ orden.expiresAt | fechaLocal:'DD/MM/YYYY hh:mm a' }} → "03/03/2026 05:30 pm"
 */
@Pipe({
  name: 'fechaLocal',
  standalone: true,
  pure: true,
})
export class FechaLocalPipe implements PipeTransform {
  transform(
    value: Date | string | null | undefined,
    formato = 'DD/MM/YYYY HH:mm',
  ): string {
    if (!value) return '—';
    return dayjs(value).tz(TZ).format(formato);
  }
}
