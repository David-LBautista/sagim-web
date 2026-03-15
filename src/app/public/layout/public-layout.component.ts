import { Component, ElementRef, inject, OnInit, signal } from '@angular/core';
import { RouterOutlet, Router, ActivatedRoute } from '@angular/router';
import { environment } from '../../../environments/environment';
import { CommonModule } from '@angular/common';
import { PublicMunicipiosService } from '../municipios/public-municipios.service';
import { MunicipioContextService } from '../municipios/municipio-context.service';
import { PublicNavbarComponent } from './public-navbar.component';
import { PublicFooterComponent } from './public-footer.component';
import { MantenimientoPage } from '../mantenimiento/mantenimiento.page';

@Component({
  selector: 'app-public-layout',
  standalone: true,
  imports: [
    RouterOutlet,
    CommonModule,
    PublicNavbarComponent,
    PublicFooterComponent,
    MantenimientoPage,
  ],
  templateUrl: './public-layout.component.html',
  styleUrl: './public-layout.component.scss',
})
export class PublicLayoutComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private municipiosService = inject(PublicMunicipiosService);
  private municipioContext = inject(MunicipioContextService);
  private el = inject(ElementRef<HTMLElement>);

  cargando = signal(true);
  error = signal(false);
  mantenimiento = signal(false);

  ngOnInit() {
    const routeSlug = this.route.snapshot.params['slug'];
    const slug = this.municipioContext.resolveSlug(routeSlug);

    if (!slug) {
      this.cargando.set(false);
      return;
    }

    this.municipiosService.getPortal().subscribe({
      next: (data) => {
        this.municipioContext.init(slug, data);

        const host = this.el.nativeElement;
        const primary = data.apariencia.colorPrimario;
        const secondary = data.apariencia.colorSecundario;

        host.style.setProperty('--sagim-primary', primary);
        host.style.setProperty('--sagim-secondary', secondary);

        // Variantes RGB para usar con rgba()
        host.style.setProperty('--sagim-primary-rgb', hexToRgb(primary));
        host.style.setProperty('--sagim-secondary-rgb', hexToRgb(secondary));

        this.mantenimiento.set(data.general.enMantenimiento);

        if (!data.general.enMantenimiento) {
          // Si estábamos en la ruta de mantenimiento, redirigir al inicio
          const currentUrl = this.router.url;
          if (currentUrl.includes('/mantenimiento')) {
            const homePath = environment.useSubdomain
              ? ['/']
              : [`/public/${slug}`];
            this.router.navigate(homePath);
          }
        }

        this.cargando.set(false);
      },
      error: () => {
        this.error.set(true);
        this.cargando.set(false);
      },
    });
  }
}

function hexToRgb(hex: string): string {
  const clean = hex.replace('#', '');
  const full =
    clean.length === 3
      ? clean
          .split('')
          .map((c) => c + c)
          .join('')
      : clean;
  const n = parseInt(full, 16);
  return `${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}`;
}
