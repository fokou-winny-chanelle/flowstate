import { CommonModule } from '@angular/common';
import {
    ChangeDetectionStrategy,
    Component,
    Input,
} from '@angular/core';

@Component({
  selector: 'flow-badge',
  standalone: true,
  imports: [CommonModule],
  template: `
    <span [class]="badgeClasses">
      <ng-content></ng-content>
    </span>
  `,
  styles: [
    `
      :host {
        display: inline-block;
      }

      .badge {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        padding: var(--space-xs) var(--space-sm);
        font-size: var(--font-size-xs);
        font-weight: 600;
        border-radius: var(--radius-full);
        white-space: nowrap;
      }

      .badge.variant-default {
        background-color: var(--color-muted);
        color: var(--color-text-primary);
      }

      .badge.variant-primary {
        background-color: var(--color-primary);
        color: white;
      }

      .badge.variant-success {
        background-color: var(--color-success);
        color: white;
      }

      .badge.variant-info {
        background-color: var(--color-info);
        color: white;
      }

      .badge.variant-warning {
        background-color: var(--color-warning);
        color: white;
      }

      .badge.variant-error {
        background-color: var(--color-error);
        color: white;
      }

      .badge.size-sm {
        padding: 2px var(--space-xs);
        font-size: 10px;
      }

      .badge.size-md {
        padding: var(--space-xs) var(--space-sm);
        font-size: var(--font-size-xs);
      }

      .badge.size-lg {
        padding: var(--space-sm) var(--space-md);
        font-size: var(--font-size-sm);
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BadgeComponent {
  @Input() variant:
    | 'default'
    | 'primary'
    | 'success'
    | 'info'
    | 'warning'
    | 'error' = 'default';
  @Input() size: 'sm' | 'md' | 'lg' = 'md';

  get badgeClasses(): string {
    return `badge variant-${this.variant} size-${this.size}`;
  }
}
