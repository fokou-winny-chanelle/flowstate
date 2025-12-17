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
      [attr.aria-label]="ariaLabel || (iconOnly ? label : undefined)"
      [attr.aria-busy]="loading"
      [attr.type]="type"
      (click)="handleClick($event)"
      (keydown.enter)="handleClick($any($event))"
      (keydown.space)="handleClick($any($event))">
      @if (loading) {
        <span class="loading-spinner" [attr.aria-hidden]="true"></span>
      }
      @if (icon && iconPosition === 'left' && !loading) {
        <span class="icon icon-left" [attr.aria-hidden]="true">
          <ng-content select="[icon-left]"></ng-content>
        </span>
      }
      @if (!iconOnly) {
        <span class="button-content">
          <ng-content></ng-content>
        </span>
      }
      @if (icon && iconPosition === 'right' && !loading) {
        <span class="icon icon-right" [attr.aria-hidden]="true">
          <ng-content select="[icon-right]"></ng-content>
        </span>
      }
    </button>
  `,
  styles: [
    `
      :host {
        display: inline-flex;
        width: auto;
        min-width: auto;
        max-width: none;
      }

      button {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        gap: var(--space-sm);
        font-family: var(--font-family);
        font-weight: var(--font-weight-semibold);
        border: none;
        border-radius: var(--radius-full);
        cursor: pointer;
        transition: all var(--transition-fast);
        outline: none;
        position: relative;
        overflow: visible;
        white-space: nowrap;
        line-height: 1.5;
        width: auto;
        min-width: auto;
        max-width: none;
        box-sizing: border-box;
      }

      button:focus-visible {
        outline: 2px solid var(--color-primary);
        outline-offset: 2px;
      }

      button.size-xs {
        padding: 6px 12px;
        font-size: var(--font-size-xs);
        height: auto;
        min-height: 28px;
        line-height: 1.4;
      }

      button.size-sm {
        padding: 8px 16px;
        font-size: var(--font-size-sm);
        height: auto;
        min-height: 36px;
        line-height: 1.4;
      }

      button.size-md {
        padding: 10px 20px;
        font-size: var(--font-size-md);
        height: auto;
        min-height: 44px;
        line-height: 1.5;
      }

      button.size-lg {
        padding: 12px 24px;
        font-size: var(--font-size-lg);
        height: auto;
        min-height: 52px;
        line-height: 1.5;
      }

      button.size-xl {
        padding: 14px 32px;
        font-size: var(--font-size-xl);
        height: auto;
        min-height: 56px;
        line-height: 1.5;
      }

      button.variant-solid {
        background-color: var(--color-primary);
        color: var(--color-text-inverse);
        box-shadow: var(--shadow-sm);
      }

      button.variant-solid:hover:not(:disabled):not(.loading) {
        background-color: var(--color-primary-hover);
        transform: translateY(-1px);
        box-shadow: var(--shadow-md);
      }

      button.variant-solid:active:not(:disabled):not(.loading) {
        background-color: var(--color-primary-active);
        transform: translateY(0);
        box-shadow: var(--shadow-sm);
      }

      button.variant-outline {
        background-color: transparent;
        color: var(--color-primary);
        border: 2px solid var(--color-primary);
      }

      button.variant-outline:hover:not(:disabled):not(.loading) {
        background-color: var(--color-primary);
        color: var(--color-text-inverse);
        transform: translateY(-1px);
        box-shadow: var(--shadow-sm);
      }

      button.variant-outline:active:not(:disabled):not(.loading) {
        background-color: var(--color-primary-active);
        transform: translateY(0);
      }

      button.variant-ghost {
        background-color: transparent;
        color: var(--color-primary);
      }

      button.variant-ghost:hover:not(:disabled):not(.loading) {
        background-color: var(--color-primary-light);
      }

      button.variant-ghost:active:not(:disabled):not(.loading) {
        background-color: var(--color-muted);
      }

      button.variant-text {
        background-color: transparent;
        color: var(--color-primary);
        padding: var(--space-xs);
      }

      button.variant-text:hover:not(:disabled):not(.loading) {
        background-color: var(--color-primary-light);
        border-radius: var(--radius-md);
      }

      button:disabled,
      button.loading {
        opacity: 0.6;
        cursor: not-allowed;
        pointer-events: none;
      }

      button.full-width {
        width: 100%;
        min-width: 100%;
      }

      button.icon-only {
        aspect-ratio: 1;
        padding: var(--space-sm);
        width: auto;
        min-width: auto;
      }

      .button-content {
        display: inline-flex;
        align-items: center;
        white-space: nowrap;
        overflow: visible;
        flex-shrink: 0;
      }

      .icon {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        width: 1em;
        height: 1em;
        flex-shrink: 0;
      }

      .loading-spinner {
        width: 1em;
        height: 1em;
        border: 2px solid currentColor;
        border-color: currentColor transparent currentColor transparent;
        border-radius: 50%;
        animation: spin 0.8s linear infinite;
        flex-shrink: 0;
      }

      @keyframes spin {
        to {
          transform: rotate(360deg);
        }
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ButtonComponent {
  @Input() size: 'xs' | 'sm' | 'md' | 'lg' | 'xl' = 'md';
  @Input() variant: 'solid' | 'outline' | 'ghost' | 'text' = 'solid';
  @Input() disabled = false;
  @Input() loading = false;
  @Input() icon?: string;
  @Input() iconPosition: 'left' | 'right' = 'left';
  @Input() iconOnly = false;
  @Input() ariaLabel?: string;
  @Input() type: 'button' | 'submit' | 'reset' = 'button';
  @Input() fullWidth = false;
  @Input() label?: string;

  @Output() clicked = new EventEmitter<MouseEvent>();

  get buttonClasses(): string {
    const classes = [
      `size-${this.size}`,
      `variant-${this.variant}`,
      this.disabled ? 'disabled' : '',
      this.loading ? 'loading' : '',
      this.fullWidth ? 'full-width' : '',
      this.iconOnly ? 'icon-only' : '',
    ];
    return classes.filter((c) => c).join(' ');
  }

  handleClick(event: MouseEvent | KeyboardEvent) {
    if (this.disabled || this.loading) {
      event.preventDefault();
      return;
    }
    if (event instanceof KeyboardEvent) {
      event.preventDefault();
    }
    this.clicked.emit(event as MouseEvent);
  }
}

