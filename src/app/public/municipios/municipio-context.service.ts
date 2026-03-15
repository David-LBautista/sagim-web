import { computed, Injectable, signal } from '@angular/core';
import { environment } from '../../../environments/environment';
import { MunicipioPublico } from '../citas/models/citas-publicas.models';
import { PortalAviso, PortalPublicoData } from './portal-publico.models';

@Injectable({ providedIn: 'root' })
export class MunicipioContextService {
  private _slug = signal<string>('');
  private _portalConfig = signal<PortalPublicoData | null>(null);

  readonly slug = this._slug.asReadonly();
  readonly portalConfig = this._portalConfig.asReadonly();

  // ── Computed helpers para componentes hijos ───────────────────────────

  /** Datos planos de municipio (compatibilidad con componentes existentes) */
  readonly municipio = computed((): MunicipioPublico | null => {
    const cfg = this._portalConfig();
    if (!cfg) return null;
    return {
      nombre: cfg.nombre,
      logoUrl: cfg.logoUrl,
      bannerUrl: cfg.apariencia?.bannerUrl,
      slug: this._slug(),
    };
  });

  readonly colorPrimario = computed(
    () => this._portalConfig()?.apariencia.colorPrimario ?? '#0f2a44',
  );
  readonly colorSecundario = computed(
    () => this._portalConfig()?.apariencia.colorSecundario ?? '#1f6fae',
  );
  readonly mostrarCitas = computed(
    () => this._portalConfig()?.general.mostrarCitas ?? true,
  );
  readonly mostrarReportes = computed(
    () => this._portalConfig()?.general.mostrarReportes ?? true,
  );
  readonly mostrarTransparencia = computed(
    () => this._portalConfig()?.general.mostrarTransparencia ?? true,
  );
  readonly enMantenimiento = computed(
    () => this._portalConfig()?.general.enMantenimiento ?? false,
  );
  readonly mensajeMantenimiento = computed(
    () => this._portalConfig()?.general.mensajeMantenimiento ?? '',
  );
  readonly subtitulo = computed(
    () => this._portalConfig()?.general.subtitulo ?? 'Portal Ciudadano — SAGIM',
  );
  readonly mensajeBienvenida = computed(
    () => this._portalConfig()?.general.mensajeBienvenida ?? '',
  );
  readonly avisos = computed(
    (): PortalAviso[] => this._portalConfig()?.avisos ?? [],
  );
  readonly hayAvisos = computed(
    () => (this._portalConfig()?.avisos?.length ?? 0) > 0,
  );

  resolveSlug(routeSlug?: string): string {
    if (environment.production) {
      return window.location.hostname.split('.')[0];
    }
    return routeSlug ?? '';
  }

  init(slug: string, portalConfig: PortalPublicoData): void {
    this._slug.set(slug);
    this._portalConfig.set(portalConfig);
  }

  reset(): void {
    this._portalConfig.set(null);
  }
}
