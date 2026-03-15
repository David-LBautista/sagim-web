import {
  AfterViewInit,
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnDestroy,
  Output,
  ViewChild,
  NgZone,
} from '@angular/core';
import { DecimalPipe } from '@angular/common';
import * as L from 'leaflet';

export interface LatLng {
  lat: number;
  lng: number;
}

// Fix default marker icons (Leaflet + bundlers issue)
const iconDefault = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl:
    'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

@Component({
  selector: 'app-ubicacion-mapa',
  standalone: true,
  imports: [DecimalPipe],
  template: `
    <div class="mapa-wrap">
      <p class="mapa-hint">
        <span class="mapa-hint__icon">📍</span>
        Toca o haz clic en el mapa para marcar la ubicación del problema
      </p>
      <div #mapContainer class="mapa-container"></div>
      @if (coordenadas) {
        <p class="mapa-coordenadas">
          Ubicación seleccionada: {{ coordenadas.lat | number: '1.5-5' }},
          {{ coordenadas.lng | number: '1.5-5' }}
          <button type="button" class="mapa-clear" (click)="limpiar()">
            ✕ Quitar
          </button>
        </p>
      }
    </div>
  `,
  styles: [
    `
      .mapa-wrap {
        display: flex;
        flex-direction: column;
        gap: 8px;
      }
      .mapa-hint {
        font-size: 0.82rem;
        color: #7a7a7a;
        margin: 0;
        display: flex;
        align-items: center;
        gap: 6px;
      }
      .mapa-hint__icon {
        font-size: 1rem;
      }
      .mapa-container {
        width: 100%;
        height: 280px;
        border-radius: 10px;
        overflow: hidden;
        border: 1.5px solid #d0dce8;
        cursor: crosshair;
      }
      .mapa-coordenadas {
        font-size: 0.78rem;
        color: #4a7a1e;
        margin: 0;
        display: flex;
        align-items: center;
        gap: 10px;
      }
      .mapa-clear {
        background: none;
        border: none;
        color: #d64545;
        font-size: 0.75rem;
        cursor: pointer;
        padding: 0;
        font-weight: 600;
      }
    `,
  ],
})
export class UbicacionMapaComponent implements AfterViewInit, OnDestroy {
  @ViewChild('mapContainer') mapContainer!: ElementRef<HTMLDivElement>;
  @Input() centerLat = 19.4326; // Ciudad de México por defecto
  @Input() centerLng = -99.1332;
  @Input() zoom = 13;
  @Output() ubicacionSeleccionada = new EventEmitter<LatLng | null>();

  coordenadas: LatLng | null = null;
  private map?: L.Map;
  private marker?: L.Marker;

  constructor(private ngZone: NgZone) {}

  ngAfterViewInit(): void {
    // Inicializar fuera de la zona Angular para mejor rendimiento
    this.ngZone.runOutsideAngular(() => {
      this.map = L.map(this.mapContainer.nativeElement, {
        center: [this.centerLat, this.centerLng],
        zoom: this.zoom,
        zoomControl: true,
      });

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution:
          '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        maxZoom: 19,
      }).addTo(this.map);

      this.map.on('click', (e: L.LeafletMouseEvent) => {
        this.ngZone.run(() => this.onMapClick(e.latlng));
      });
    });
  }

  private onMapClick(latlng: L.LatLng): void {
    const coords: LatLng = {
      lat: Math.round(latlng.lat * 1e6) / 1e6,
      lng: Math.round(latlng.lng * 1e6) / 1e6,
    };
    this.coordenadas = coords;

    if (this.marker) {
      this.marker.setLatLng(latlng);
    } else {
      this.marker = L.marker(latlng, { icon: iconDefault }).addTo(this.map!);
    }
    this.marker.bindPopup('Ubicación del problema').openPopup();
    this.ubicacionSeleccionada.emit(coords);
  }

  limpiar(): void {
    this.coordenadas = null;
    if (this.marker) {
      this.marker.remove();
      this.marker = undefined;
    }
    this.ubicacionSeleccionada.emit(null);
  }

  ngOnDestroy(): void {
    this.map?.remove();
  }
}
