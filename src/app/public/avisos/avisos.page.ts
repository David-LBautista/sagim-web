import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { UpperCasePipe } from '@angular/common';
import { MunicipioContextService } from '../municipios/municipio-context.service';
import { AvisoTipo } from '../municipios/portal-publico.models';

@Component({
  selector: 'app-avisos',
  standalone: true,
  imports: [RouterLink, MatIconModule, UpperCasePipe],
  templateUrl: './avisos.page.html',
  styleUrl: './avisos.page.scss',
})
export class AvisosPage {
  private ctx = inject(MunicipioContextService);

  readonly slug = this.ctx.slug;
  readonly basePath = this.ctx.basePath;
  readonly municipio = this.ctx.municipio;
  readonly avisos = this.ctx.avisos;

  readonly tipoConfig: Record<
    AvisoTipo,
    { label: string; icon: string; css: string }
  > = {
    informativo: { label: 'Informativo', icon: 'info', css: 'informativo' },
    alerta: { label: 'Alerta', icon: 'warning', css: 'alerta' },
    urgente: { label: 'Urgente', icon: 'error', css: 'urgente' },
  };
}
