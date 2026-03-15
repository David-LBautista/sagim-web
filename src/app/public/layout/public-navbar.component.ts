import { Component, computed, effect, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MunicipioContextService } from '../municipios/municipio-context.service';

export interface NavLink {
  label: string;
  path: string;
  exact: boolean;
}

@Component({
  selector: 'app-public-navbar',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    RouterLinkActive,
    MatButtonModule,
    MatIconModule,
  ],
  templateUrl: './public-navbar.component.html',
  styleUrl: './public-navbar.component.scss',
})
export class PublicNavbarComponent {
  private ctx = inject(MunicipioContextService);

  readonly slug = this.ctx.slug;
  readonly basePath = this.ctx.basePath;
  readonly municipio = this.ctx.municipio;

  logoError = signal(false);
  menuOpen = signal(false);

  readonly logoSrc = computed(
    () => this.municipio()?.logoUrl ?? '/assets/logo/escudo_sagim.svg',
  );

  readonly navLinks = computed((): NavLink[] => {
    const links: NavLink[] = [{ label: 'Inicio', path: '', exact: true }];
    if (this.ctx.mostrarCitas())
      links.push({ label: 'Citas', path: 'citas', exact: false });
    if (this.ctx.mostrarReportes())
      links.push({ label: 'Reportes', path: 'reportes', exact: false });
    if (this.ctx.mostrarTransparencia())
      links.push({
        label: 'Transparencia',
        path: 'transparencia',
        exact: false,
      });
    return links;
  });

  constructor() {
    effect(() => {
      this.municipio();
      this.logoError.set(false);
    });
  }

  routerLinkFor(link: NavLink): string {
    return link.path
      ? `${this.basePath()}/${link.path}`
      : this.basePath() || '/';
  }

  toggleMenu() {
    this.menuOpen.update((v) => !v);
  }

  closeMenu() {
    this.menuOpen.set(false);
  }
}
