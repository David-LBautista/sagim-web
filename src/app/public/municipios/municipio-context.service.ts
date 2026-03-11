import { Injectable, signal } from '@angular/core';
import { environment } from '../../../environments/environment';
import { MunicipioPublico } from '../citas/models/citas-publicas.models';

@Injectable({ providedIn: 'root' })
export class MunicipioContextService {
  private _slug = signal<string>('');
  private _municipio = signal<MunicipioPublico | null>(null);
  private _subtitulo = signal<string>('Portal Ciudadano — SAGIM');

  readonly slug = this._slug.asReadonly();
  readonly municipio = this._municipio.asReadonly();
  readonly subtitulo = this._subtitulo.asReadonly();

  resolveSlug(routeSlug?: string): string {
    if (environment.production) {
      return window.location.hostname.split('.')[0];
    }
    return routeSlug ?? '';
  }

  init(slug: string, municipio: MunicipioPublico, subtitulo?: string): void {
    this._slug.set(slug);
    this._municipio.set(municipio);
    if (subtitulo) this._subtitulo.set(subtitulo);
  }

  setSubtitulo(subtitulo: string): void {
    this._subtitulo.set(subtitulo);
  }

  reset(): void {
    this._subtitulo.set('Portal Ciudadano — SAGIM');
  }
}
