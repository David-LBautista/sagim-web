import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { environment } from '../../../environments/environment';
import { ApiEndpoints } from '../../core/enums/api-endpoints.enum';
import { MunicipioContextService } from '../municipios/municipio-context.service';
import {
  TransparenciaPublicaResponse,
  TransparenciaResumenPublico,
  TransparenciaDetallePublico,
  TransparenciaDocumentoPublico,
} from '../municipios/portal-publico.models';

@Component({
  selector: 'app-transparencia',
  standalone: true,
  imports: [
    CommonModule,
    MatIconModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    DatePipe,
  ],
  templateUrl: './transparencia.page.html',
  styleUrl: './transparencia.page.scss',
})
export class TransparenciaPage implements OnInit {
  private ctx = inject(MunicipioContextService);
  private http = inject(HttpClient);

  readonly slug = this.ctx.slug;
  readonly municipio = this.ctx.municipio;

  cargando = signal(true);
  error = signal(false);
  comunes = signal<TransparenciaResumenPublico[]>([]);
  municipales = signal<TransparenciaResumenPublico[]>([]);

  /** Secciones cuyo acordeón está abierto */
  private abiertos = signal<Set<string>>(new Set());
  /** Subsecciones cuyo acordeón anidado está abierto */
  private abiertasSub = signal<Set<string>>(new Set());
  /** Claves cuyo detalle se está cargando */
  cargandoDetalle = signal<Set<string>>(new Set());
  /** Detalles ya cargados, indexados por clave */
  detalles = signal<Map<string, TransparenciaDetallePublico>>(new Map());

  ngOnInit(): void {
    const slug = this.slug();
    if (!slug) return;
    const url = `${environment.apiUrl}${ApiEndpoints.PUBLIC_TRANSPARENCIA.replace(':slug', slug)}`;
    this.http.get<TransparenciaPublicaResponse>(url).subscribe({
      next: (data) => {
        this.comunes.set(data.obligacionesComunes);
        this.municipales.set(data.obligacionesMunicipales);
        this.cargando.set(false);
      },
      error: () => {
        this.error.set(true);
        this.cargando.set(false);
      },
    });
  }

  abierto(clave: string): boolean {
    return this.abiertos().has(clave);
  }

  toggle(clave: string): void {
    const s = new Set(this.abiertos());
    if (s.has(clave)) {
      s.delete(clave);
    } else {
      s.add(clave);
      this.cargarDetalle(clave);
    }
    this.abiertos.set(s);
  }

  abiertoSub(clave: string): boolean {
    return this.abiertasSub().has(clave);
  }

  toggleSub(clave: string): void {
    const s = new Set(this.abiertasSub());
    if (s.has(clave)) {
      s.delete(clave);
    } else {
      s.add(clave);
    }
    this.abiertasSub.set(s);
  }

  private cargarDetalle(clave: string): void {
    if (this.detalles().has(clave) || this.cargandoDetalle().has(clave)) return;
    const slug = this.slug();
    if (!slug) return;
    const url = `${environment.apiUrl}${ApiEndpoints.PUBLIC_TRANSPARENCIA_SECCION.replace(
      ':slug',
      slug,
    ).replace(':clave', clave)}`;

    const loading = new Set(this.cargandoDetalle());
    loading.add(clave);
    this.cargandoDetalle.set(loading);

    this.http.get<TransparenciaDetallePublico>(url).subscribe({
      next: (det) => {
        const map = new Map(this.detalles());
        map.set(clave, det);
        this.detalles.set(map);
        const l = new Set(this.cargandoDetalle());
        l.delete(clave);
        this.cargandoDetalle.set(l);
      },
      error: () => {
        const l = new Set(this.cargandoDetalle());
        l.delete(clave);
        this.cargandoDetalle.set(l);
      },
    });
  }

  docIcon(doc: TransparenciaDocumentoPublico): string {
    if (doc.tipo === 'pdf') return 'picture_as_pdf';
    if (doc.tipo === 'excel') return 'table_chart';
    if (doc.tipo === 'link') return 'link';
    return 'text_snippet';
  }

  docUrl(doc: TransparenciaDocumentoPublico): string | null {
    if ((doc.tipo === 'pdf' || doc.tipo === 'excel') && doc.archivoUrl)
      return doc.archivoUrl;
    if (doc.tipo === 'link' && doc.url) return doc.url;
    return null;
  }

  docLabel(doc: TransparenciaDocumentoPublico): string {
    if (doc.tipo === 'pdf') return 'Ver PDF';
    if (doc.tipo === 'excel') return 'Descargar Excel';
    if (doc.tipo === 'link') return 'Ir al enlace';
    return 'Ver contenido';
  }
}
