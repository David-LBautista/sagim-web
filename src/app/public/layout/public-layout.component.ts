import { Component, inject, OnInit, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { PublicMunicipiosService } from '../municipios/public-municipios.service';
import { MunicipioContextService } from '../municipios/municipio-context.service';
import { MunicipioPublico } from '../citas/models/citas-publicas.models';

@Component({
  selector: 'app-public-layout',
  standalone: true,
  imports: [RouterOutlet, CommonModule],
  templateUrl: './public-layout.component.html',
  styleUrl: './public-layout.component.scss',
})
export class PublicLayoutComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private municipiosService = inject(PublicMunicipiosService);
  private municipioContext = inject(MunicipioContextService);

  municipio = signal<MunicipioPublico | null>(null);
  cargando = signal(true);
  logoError = signal(false);

  readonly subtitulo = this.municipioContext.subtitulo;

  get logoSrc(): string {
    return this.municipio()?.logoUrl ?? '/assets/logo/sagim_logo_white.png';
  }

  ngOnInit() {
    const routeSlug = this.route.snapshot.params['slug'];
    const slug = this.municipioContext.resolveSlug(routeSlug);

    if (slug) {
      this.municipiosService.getBySlug(slug).subscribe({
        next: (m) => {
          const municipio = { ...m, slug };
          this.logoError.set(false);
          this.municipio.set(municipio);
          this.municipioContext.init(slug, municipio);
          this.cargando.set(false);
        },
        error: () => {
          const fallback: MunicipioPublico = { nombre: slug, slug };
          this.municipio.set(fallback);
          this.municipioContext.init(slug, fallback);
          this.cargando.set(false);
        },
      });
    } else {
      this.cargando.set(false);
    }
  }
}
