import { Component, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MunicipioContextService } from '../municipios/municipio-context.service';

@Component({
  selector: 'app-public-footer',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './public-footer.component.html',
  styleUrl: './public-footer.component.scss',
})
export class PublicFooterComponent {
  private ctx = inject(MunicipioContextService);

  readonly slug = this.ctx.slug;
  readonly basePath = this.ctx.basePath;
  readonly municipio = this.ctx.municipio;

  readonly footer = computed(() => this.ctx.portalConfig()?.footer ?? null);
  readonly redes = computed(
    () => this.ctx.portalConfig()?.redesSociales ?? null,
  );

  linkRouterPath(url: string): string | null {
    if (!url || url.startsWith('http')) return null;
    const clean = url.startsWith('/') ? url : `/${url}`;
    return `${this.basePath()}${clean}`;
  }
}
