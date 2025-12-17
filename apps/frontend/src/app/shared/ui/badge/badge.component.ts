import { CommonModule } from '@angular/common';
import {
    ChangeDetectionStrategy,
    Component,
    EventEmitter,
    Input,
    Output,
} from '@angular/core';

@Component({
  selector: 'flow-badge',
  standalone: true,
  imports: [CommonModule],
  template: `
    <span
      [class]="badgeClasses"
      [attr.aria-label]="ariaLabel"
      [attr.role]="clickable ? 'button' : undefined"
      [tabindex]="clickable ? 0 : -1"
      (click)="handleClick($event)"
      (keydown.enter)="handleKeyDown($any($event))"
      (keydown.space)="handleKeyDown($any($event))">
      @if (iconLeft) {
        <span class="badge-icon icon-left" [attr.aria-hidden]="true">
          <ng-content select="[icon-left]"></ng-content>
        </span>
      }
      <span class="badge-content">
        <ng-content></ng-content>
      </span>
      @if (iconRight) {
        <span class="badge-icon icon-right" [attr.aria-hidden]="true">
          <ng-content select="[icon-right]"></ng-content>
        </span>
      }
      @if (dismissible) {
        <button
          type="button"
          class="badge-dismiss"
          [attr.aria-label]="'Remove ' + (ariaLabel || 'badge')"
          (click)="handleDismiss($event)"
          tabindex="-1">
          <ng-content select="[icon-dismiss]"></ng-content>
        </button>
      }
    </span>
  `,
  styles: [
    `
      :host {
        display: inline-block;
      }

      span.badge {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        gap: var(--space-xs);
        font-family: var(--font-family);
        font-weight: var(--font-weight-medium);
        border-radius: var(--radius-full);
        transition: all var(--transition-fast);
        white-space: nowrap;
      }

      span.badge.clickable {
        cursor: pointer;
      }

      span.badge.clickable:hover:not(.disabled) {
        opacity: 0.8;
        transform: scale(1.05);
      }

      span.badge.clickable:active:not(.disabled) {
        transform: scale(0.95);
      }

      span.badge.clickable:focus-visible {
        outline: 2px solid var(--color-primary);
        outline-offset: 2px;
      }

      .badge-content {
        display: inline-flex;
        align-items: center;
      }

      .badge-icon {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
      }

      .badge-dismiss {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        padding: 0;
        margin-left: var(--space-xs);
        background: transparent;
        border: none;
        border-radius: var(--radius-full);
        cursor: pointer;
        opacity: 0.7;
        transition: all var(--transition-fast);
        flex-shrink: 0;
      }

      .badge-dismiss:hover {
        opacity: 1;
        background-color: rgba(0, 0, 0, 0.1);
      }

      .badge.size-xs {
        padding: 2px var(--space-xs);
        font-size: var(--font-size-xs);
        line-height: 1.2;
        min-height: 16px;
      }

      .badge.size-sm {
        padding: var(--space-xs) var(--space-sm);
        font-size: var(--font-size-xs);
        line-height: 1.3;
        min-height: 20px;
      }

      .badge.size-md {
        padding: var(--space-xs) var(--space-md);
        font-size: var(--font-size-sm);
        line-height: 1.4;
        min-height: 24px;
      }

      .badge.size-lg {
        padding: var(--space-sm) var(--space-md);
        font-size: var(--font-size-md);
        line-height: 1.5;
        min-height: 28px;
      }

      .badge.variant-default {
        background-color: var(--color-muted);
        color: var(--color-text-primary);
      }

      .badge.variant-primary {
        background-color: var(--color-primary);
        color: var(--color-text-inverse);
      }

      .badge.variant-success {
        background-color: var(--color-success);
        color: var(--color-text-inverse);
      }

      .badge.variant-info {
        background-color: var(--color-info);
        color: var(--color-text-inverse);
      }

      .badge.variant-warning {
        background-color: var(--color-warning);
        color: var(--color-text-inverse);
      }

      .badge.variant-error {
        background-color: var(--color-error);
        color: var(--color-text-inverse);
      }

      .badge.variant-outline {
        background-color: transparent;
        border: 1px solid var(--color-border);
        color: var(--color-text-primary);
      }

      .badge.variant-outline.variant-primary {
        border-color: var(--color-primary);
        color: var(--color-primary);
      }

      .badge.variant-outline.variant-success {
        border-color: var(--color-success);
        color: var(--color-success);
      }

      .badge.variant-outline.variant-info {
        border-color: var(--color-info);
        color: var(--color-info);
      }

      .badge.variant-outline.variant-warning {
        border-color: var(--color-warning);
        color: var(--color-warning);
      }

      .badge.variant-outline.variant-error {
        border-color: var(--color-error);
        color: var(--color-error);
      }

      .badge.disabled {
        opacity: 0.5;
        cursor: not-allowed;
        pointer-events: none;
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
    | 'error'
    | 'outline' = 'default';
  @Input() size: 'xs' | 'sm' | 'md' | 'lg' = 'md';
  @Input() dismissible = false;
  @Input() clickable = false;
  @Input() disabled = false;
  @Input() iconLeft = false;
  @Input() iconRight = false;
  @Input() ariaLabel?: string;

  @Output() dismissed = new EventEmitter<void>();
  @Output() clicked = new EventEmitter<MouseEvent>();

  get badgeClasses(): string {
    const classes = [
      'badge',
      `variant-${this.variant}`,
      `size-${this.size}`,
      this.clickable ? 'clickable' : '',
      this.disabled ? 'disabled' : '',
    ];
    return classes.filter((c) => c).join(' ');
  }

  handleClick(event: MouseEvent) {
    if (this.clickable && !this.disabled) {
      this.clicked.emit(event);
    }
  }

  handleKeyDown(event: KeyboardEvent) {
    if (this.clickable && !this.disabled) {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        this.clicked.emit(event as unknown as MouseEvent);
      }
    }
  }

  handleDismiss(event: MouseEvent) {
    event.stopPropagation();
    if (!this.disabled) {
      this.dismissed.emit();
    }
  }
}
