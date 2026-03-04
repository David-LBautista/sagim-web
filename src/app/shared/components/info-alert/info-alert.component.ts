import { Component, input } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';

export type AlertType = 'info' | 'success' | 'warning' | 'danger';

@Component({
  selector: 'app-info-alert',
  standalone: true,
  imports: [MatIconModule],
  template: `
    <div class="info-alert info-alert--{{ type() }}">
      <mat-icon class="info-alert__icon">{{ icons[type()] }}</mat-icon>
      <span class="info-alert__message">{{ message() }}</span>
    </div>
  `,
  styles: [
    `
      :host {
        display: block;
      }

      .info-alert {
        display: flex;
        align-items: flex-start;
        gap: 0.5rem;
        padding: 0.55rem 0.85rem;
        border-radius: var(--sagim-radius-md, 8px);
        font-size: 0.82rem;
        line-height: 1.4;
        border-left: 3px solid transparent;
      }

      .info-alert__icon {
        font-size: 1rem;
        width: 1rem;
        height: 1rem;
        flex-shrink: 0;
        margin-top: 1px;
      }

      .info-alert__message {
        flex: 1;
      }

      .info-alert--info {
        background: color-mix(
          in srgb,
          var(--sagim-secondary, #1f6fae) 10%,
          white
        );
        border-color: var(--sagim-secondary, #1f6fae);
        color: var(--sagim-secondary, #1f6fae);
        .info-alert__icon {
          color: var(--sagim-secondary, #1f6fae);
        }
      }

      .info-alert--success {
        background: color-mix(
          in srgb,
          var(--sagim-success, #6fae3b) 10%,
          white
        );
        border-color: var(--sagim-success, #6fae3b);
        color: color-mix(in srgb, var(--sagim-success, #6fae3b) 80%, #000);
        .info-alert__icon {
          color: var(--sagim-success, #6fae3b);
        }
      }

      .info-alert--warning {
        background: color-mix(
          in srgb,
          var(--sagim-warning, #f0a12a) 12%,
          white
        );
        border-color: var(--sagim-warning, #f0a12a);
        color: color-mix(in srgb, var(--sagim-warning, #f0a12a) 80%, #000);
        .info-alert__icon {
          color: var(--sagim-warning, #f0a12a);
        }
      }

      .info-alert--danger {
        background: color-mix(in srgb, var(--sagim-danger, #d64545) 10%, white);
        border-color: var(--sagim-danger, #d64545);
        color: var(--sagim-danger, #d64545);
        .info-alert__icon {
          color: var(--sagim-danger, #d64545);
        }
      }
    `,
  ],
})
export class InfoAlertComponent {
  message = input.required<string>();
  type = input<AlertType>('info');

  readonly icons: Record<AlertType, string> = {
    info: 'info',
    success: 'check_circle',
    warning: 'warning',
    danger: 'error',
  };
}
