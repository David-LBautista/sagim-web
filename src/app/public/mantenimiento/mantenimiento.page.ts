import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MunicipioContextService } from '../municipios/municipio-context.service';

@Component({
  selector: 'app-mantenimiento',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="mant">
      <img
        src="/assets/maintenance/en_mantenimiento.svg"
        alt="En mantenimiento"
        class="mant__img"
      />
      <h1 class="mant__titulo">Portal en mantenimiento</h1>
      <p class="mant__sub">
        El portal de
        <strong>{{ municipio()?.nombre ?? 'este municipio' }}</strong>
        se encuentra temporalmente fuera de servicio.<br />
        {{ mensaje() || 'Por favor, intenta de nuevo más tarde.' }}
      </p>
    </div>
  `,
  styles: [
    `
      .mant {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        min-height: 100vh;
        padding: 48px 24px;
        text-align: center;
        gap: 16px;
        background: #fff;
      }
      .mant__img {
        width: 220px;
        height: auto;
      }
      .mant__titulo {
        font-size: 1.8rem;
        font-weight: 800;
        color: #0f2a44;
        margin: 0;
      }
      .mant__sub {
        font-size: 1rem;
        color: #7a7a7a;
        margin: 0;
        max-width: 480px;
        line-height: 1.6;
      }
    `,
  ],
})
export class MantenimientoPage {
  private ctx = inject(MunicipioContextService);
  readonly municipio = this.ctx.municipio;
  readonly mensaje = this.ctx.mensajeMantenimiento;
}
