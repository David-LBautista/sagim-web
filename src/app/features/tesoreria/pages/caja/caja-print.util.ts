import { PagoCajaResponse } from '../../models/caja.model';
import dayjs from 'dayjs';

export function imprimirRecibo(
  pago: PagoCajaResponse,
  nombreRecibo?: string,
  municipioInfo?: { nombre: string; logoUrl: string } | null,
  referenciaDocumento?: string,
): void {
  const fechaMx = dayjs(pago.fechaPago).tz('America/Mexico_City');
  const fechaFormateada = fechaMx.format('DD/MM/YYYY');
  const hora = fechaMx.format('HH:mm');
  const cajero = pago.cajeroNombre ?? '—';
  const ciudadano = nombreRecibo || '—';

  const html = `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8" />
  <title>Recibo ${pago.folio}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: 'Courier New', Courier, monospace;
      font-size: 12px;
      width: 80mm;
      margin: 0 auto;
      padding: 8px;
      color: #000;
    }
    .center { text-align: center; }
    .bold { font-weight: bold; }
    .separator { border-top: 1px dashed #000; margin: 6px 0; }
    .logo { font-size: 14px; font-weight: bold; text-transform: uppercase; }
    .municipio-logo { width: 56px; height: 56px; object-fit: contain; margin-bottom: 4px; }
    .titulo { font-size: 13px; font-weight: bold; margin: 4px 0; }
    .row { display: flex; justify-content: space-between; margin: 3px 0; }
    .label { color: #444; }
    .total-row {
      display: flex;
      justify-content: space-between;
      font-size: 16px;
      font-weight: bold;
      margin: 4px 0;
    }
    .footer { font-size: 10px; color: #555; margin-top: 4px; }
    @media print {
      body { width: 80mm; }
    }
  </style>
</head>
<body>
  <div class="center">
    ${municipioInfo?.logoUrl ? `<img class="municipio-logo" src="${municipioInfo.logoUrl}" alt="Logo" />` : ''}
    <div class="logo">${municipioInfo?.nombre ?? 'H. Ayuntamiento'}</div>
  </div>

  <div class="separator"></div>

  <div class="center">
    <div class="titulo">RECIBO DE PAGO</div>
  </div>

  <div class="separator"></div>

  <div class="row"><span class="label">Folio:</span><span class="bold">${pago.folio}</span></div>
  <div class="row"><span class="label">Fecha:</span><span>${fechaFormateada}</span></div>
  <div class="row"><span class="label">Hora:</span><span>${hora}</span></div>

  <div class="separator"></div>

  <div class="row"><span class="label">Servicio:</span><span>${pago.servicioNombre}</span></div>
  <div class="row"><span class="label">Ciudadano:</span><span>${ciudadano}</span></div>
  ${referenciaDocumento ? `<div class="row"><span class="label">Referencia:</span><span>${referenciaDocumento}</span></div>` : ''}

  <div class="separator"></div>

  <div class="row"><span class="label">Método:</span><span>${pago.metodoPago === 'EFECTIVO' ? 'Efectivo' : 'Tarjeta'}</span></div>
  <div class="total-row"><span>TOTAL:</span><span>$${pago.monto.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</span></div>

  <div class="separator"></div>

  <div class="row"><span class="label">Atendió:</span><span>${cajero}</span></div>

  <div class="separator"></div>

  <div class="center footer">
    <div>Documento generado por SAGIM</div>
    <div>Este recibo es comprobante oficial de pago</div>
  </div>

  <script>window.onload = () => { window.print(); window.onafterprint = () => window.close(); };<\/script>
</body>
</html>`;

  const ventana = window.open('', '_blank', 'width=400,height=600');
  if (ventana) {
    ventana.document.write(html);
    ventana.document.close();
  }
}
