import {
  AfterViewInit,
  Component,
  ElementRef,
  Input,
  NgZone,
  OnChanges,
  OnDestroy,
  SimpleChanges,
  ViewChild,
} from '@angular/core';
import * as L from 'leaflet';
import { ReporteMapa } from '../../models/reportes-publicas.models';

// Ícono verde para reportes resueltos
const iconResuelto = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl:
    'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
  className: 'leaflet-marker--resuelto',
});

@Component({
  selector: 'app-mapa-reportes-publicos',
  standalone: true,
  imports: [],
  template: `<div #mapContainer class="mrp__map"></div>`,
  styles: [
    `
      :host {
        display: block;
        height: 100%;
      }
      .mrp__map {
        width: 100%;
        height: var(--mrp-height, 420px);
        border-radius: 12px;
        overflow: hidden;
        border: 1.5px solid #d0dce8;
      }

      /* Tint marker green via CSS filter */
      :host ::ng-deep .leaflet-marker--resuelto {
        filter: hue-rotate(100deg) saturate(1.6) brightness(1.05);
      }
    `,
  ],
})
export class MapaReportesPublicosComponent
  implements AfterViewInit, OnChanges, OnDestroy
{
  @ViewChild('mapContainer', { static: true })
  mapContainer!: ElementRef<HTMLDivElement>;

  @Input() reportes: ReporteMapa[] = [];
  @Input() centerLat = 19.4326;
  @Input() centerLng = -99.1332;

  private map?: L.Map;
  private markers: L.Marker[] = [];

  constructor(private ngZone: NgZone) {}

  ngAfterViewInit(): void {
    this.ngZone.runOutsideAngular(() => {
      this.initMap();
      this.syncMarkers();
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['reportes'] && this.map) {
      this.ngZone.runOutsideAngular(() => this.syncMarkers());
    }
  }

  ngOnDestroy(): void {
    this.map?.remove();
  }

  private initMap(): void {
    const center = this.getCenter();
    this.map = L.map(this.mapContainer.nativeElement, {
      center: [center.lat, center.lng],
      zoom: 13,
      zoomControl: true,
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
      maxZoom: 19,
    }).addTo(this.map);
  }

  private syncMarkers(): void {
    if (!this.map) return;

    // Remove previous markers
    this.markers.forEach((m) => m.remove());
    this.markers = [];

    const validos = this.reportes.filter((r) => r.lat != null && r.lng != null);
    if (!validos.length) return;

    const bounds: L.LatLngTuple[] = [];

    validos.forEach((r) => {
      const marker = L.marker([r.lat, r.lng], { icon: iconResuelto })
        .bindPopup(this.buildPopup(r), { maxWidth: 260 })
        .addTo(this.map!);
      this.markers.push(marker);
      bounds.push([r.lat, r.lng]);
    });

    if (bounds.length === 1) {
      this.map.setView(bounds[0], 15);
    } else if (bounds.length > 1) {
      this.map.fitBounds(bounds, { padding: [32, 32] });
    }
  }

  private buildPopup(r: ReporteMapa): string {
    const fecha = r.fechaResolucion
      ? new Date(r.fechaResolucion).toLocaleDateString('es-MX', {
          year: 'numeric',
          month: 'short',
          day: '2-digit',
        })
      : '—';
    const dir = [r.direccion, r.colonia].filter(Boolean).join(', ');

    return `
      <div style="font-family:inherit;min-width:200px">
        <p style="margin:0 0 2px;font-weight:700;color:#0F2A44;font-size:13px">${r.categoriaNombre}</p>
        <p style="margin:0 0 6px;font-size:11px;color:#7A7A7A">${r.folio}</p>
        ${r.descripcion ? `<p style="margin:0 0 6px;font-size:12px;color:#3A3A3A">${r.descripcion}</p>` : ''}
        ${dir ? `<p style="margin:0 0 4px;font-size:11px;color:#7A7A7A">📍 ${dir}</p>` : ''}
        <p style="margin:0;font-size:11px;color:#6FAE3B;font-weight:600">✔ Resuelto el ${fecha}</p>
      </div>
    `;
  }

  private getCenter(): { lat: number; lng: number } {
    const first = this.reportes.find((r) => r.lat != null && r.lng != null);
    return first ?? { lat: this.centerLat, lng: this.centerLng };
  }
}
