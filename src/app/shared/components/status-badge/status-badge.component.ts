import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

export type BadgeVariant =
  | 'success'
  | 'warning'
  | 'danger'
  | 'info'
  | 'neutral';

@Component({
  selector: 'app-status-badge',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './status-badge.component.html',
  styleUrls: ['./status-badge.component.scss'],
})
export class StatusBadgeComponent {
  @Input() label: string = '';
  @Input() variant: BadgeVariant = 'neutral';
  @Input() icon?: string;

  get badgeClass(): string {
    return `status-badge status-badge--${this.variant}`;
  }
}
