import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

export type BadgeVariant = 'default' | 'primary' | 'success' | 'warning' | 'error' | 'info';
export type BadgeSize = 'sm' | 'md' | 'lg';

@Component({
  selector: 'fs-badge',
  standalone: true,
  imports: [CommonModule],
  template: `
    <span [class]="badgeClasses">
      @if (dot) {
        <span class="badge-dot"></span>
      }
      <ng-content></ng-content>
    </span>
  `,
  styleUrls: ['./badge.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BadgeComponent {
  @Input() variant: BadgeVariant = 'default';
  @Input() size: BadgeSize = 'md';
  @Input() dot = false;
  @Input() outlined = false;

  get badgeClasses(): string {
    return [
      'fs-badge',
      `variant-${this.variant}`,
      `size-${this.size}`,
      this.outlined ? 'outlined' : '',
      this.dot ? 'has-dot' : '',
    ]
      .filter(Boolean)
      .join(' ');
  }
}

