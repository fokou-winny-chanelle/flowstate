import { CommonModule } from '@angular/common';
import {
    ChangeDetectionStrategy,
    Component,
    EventEmitter,
    Input,
    Output,
} from '@angular/core';

@Component({
  selector: 'flow-button',
  standalone: true,
  imports: [CommonModule],
  template: `
    <button
      [class]="buttonClasses"
      [disabled]="disabled || loading"
      [attr.aria-label]="ariaLabel"
      [attr.type]="type"
      (click)="clicked.emit($event)">
      @if (loading) {
        <span class="loading-spinner"></span>
      }
      @if (icon && iconPosition === 'left' && !loading) {
        <span class="icon-left" [innerHTML]="icon"></span>
      }
      <ng-content></ng-content>
      @if (icon && iconPosition === 'right' && !loading) {
        <span class="icon-right" [innerHTML]="icon"></span>
      }
    </button>
  `,
  styles: [
    `
      :host {
        display: inline-block;
      }

      button {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        gap: var(--space-sm);
        font-family: var(--font-family);
        font-weight: 600;
        border: none;
        border-radius: var(--radius-full);
        cursor: pointer;
        transition: all var(--transition-fast);
        outline: none;
      }

      button:focus-visible {
        outline: 2px solid var(--color-primary);
        outline-offset: 2px;
      }

      button.size-sm {
        padding: var(--space-xs) var(--space-md);
        font-size: var(--font-size-sm);
      }

      button.size-md {
        padding: var(--space-sm) var(--space-lg);
        font-size: var(--font-size-md);
      }

      button.size-lg {
        padding: var(--space-md) var(--space-xl);
        font-size: var(--font-size-lg);
      }

      button.variant-solid {
        background-color: var(--color-primary);
        color: white;
      }

      button.variant-solid:hover:not(:disabled) {
        background-color: var(--color-primary-dark);
        transform: translateY(-1px);
        box-shadow: var(--shadow-md);
      }

      button.variant-outline {
        background-color: transparent;
        color: var(--color-primary);
        border: 2px solid var(--color-primary);
      }

      button.variant-outline:hover:not(:disabled) {
        background-color: var(--color-primary);
        color: white;
      }

      button.variant-ghost {
        background-color: transparent;
        color: var(--color-primary);
      }

      button.variant-ghost:hover:not(:disabled) {
        background-color: var(--color-primary-light);
        opacity: 0.8;
      }

      button:disabled,
      button.loading {
        opacity: 0.5;
        cursor: not-allowed;
      }

      button.full-width {
        width: 100%;
      }

      .loading-spinner {
        width: 16px;
        height: 16px;
        border: 2px solid rgba(255, 255, 255, 0.3);
        border-radius: 50%;
        border-top-color: white;
        animation: spin 0.8s linear infinite;
      }

      @keyframes spin {
        to {
          transform: rotate(360deg);
        }
      }

      .icon-left,
      .icon-right {
        display: inline-flex;
        align-items: center;
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ButtonComponent {
  @Input() size: 'sm' | 'md' | 'lg' = 'md';
  @Input() variant: 'solid' | 'outline' | 'ghost' = 'solid';
  @Input() disabled = false;
  @Input() loading = false;
  @Input() icon?: string;
  @Input() iconPosition: 'left' | 'right' = 'left';
  @Input() ariaLabel?: string;
  @Input() type: 'button' | 'submit' | 'reset' = 'button';
  @Input() fullWidth = false;

  @Output() clicked = new EventEmitter<MouseEvent>();

  get buttonClasses(): string {
    const classes = [
      `size-${this.size}`,
      `variant-${this.variant}`,
      this.disabled ? 'disabled' : '',
      this.loading ? 'loading' : '',
      this.fullWidth ? 'full-width' : '',
    ];
    return classes.filter((c) => c).join(' ');
  }
}

