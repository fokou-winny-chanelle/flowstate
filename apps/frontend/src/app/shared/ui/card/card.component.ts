import { CommonModule } from '@angular/common';
import {
    ChangeDetectionStrategy,
    Component,
    ContentChild,
    EventEmitter,
    Input,
    Output,
    TemplateRef,
} from '@angular/core';

@Component({
  selector: 'flow-card',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div
      [class]="cardClasses"
      [tabindex]="clickable ? 0 : -1"
      [attr.role]="clickable ? 'button' : undefined"
      [attr.aria-label]="clickable ? ariaLabel || title : undefined"
      (click)="handleClick($event)"
      (keydown.enter)="handleKeyDown($any($event))"
      (keydown.space)="handleKeyDown($any($event))">
      @if (title || headerTemplate || headerActions) {
        <div class="card-header">
          <div class="card-header-content">
            @if (title) {
              <h3 class="card-title">{{ title }}</h3>
            }
            @if (subtitle) {
              <p class="card-subtitle">{{ subtitle }}</p>
            }
            @if (headerTemplate) {
              <ng-container *ngTemplateOutlet="headerTemplate"></ng-container>
            }
          </div>
          @if (headerActions) {
            <div class="card-header-actions">
              <ng-container *ngTemplateOutlet="headerActions"></ng-container>
            </div>
          }
        </div>
      }
      <div class="card-body" [class.no-padding]="noPadding">
        <ng-content></ng-content>
      </div>
      @if (footerTemplate || footerActions) {
        <div class="card-footer">
          @if (footerTemplate) {
            <ng-container *ngTemplateOutlet="footerTemplate"></ng-container>
          }
          @if (footerActions) {
            <div class="card-footer-actions">
              <ng-container *ngTemplateOutlet="footerActions"></ng-container>
            </div>
          }
        </div>
      }
    </div>
  `,
  styles: [
    `
      .card {
        background-color: var(--color-surface);
        border-radius: var(--radius-lg);
        transition: all var(--transition-fast);
        display: flex;
        flex-direction: column;
        overflow: hidden;
      }

      .card.variant-default {
        border: 1px solid var(--color-border);
      }

      .card.variant-outlined {
        border: 2px solid var(--color-border);
      }

      .card.variant-elevated {
        box-shadow: var(--shadow-md);
        border: none;
      }

      .card.variant-flat {
        background-color: var(--color-background);
        border: none;
      }

      .card.variant-elevated:hover:not(.disabled) {
        box-shadow: var(--shadow-lg);
      }

      .card.clickable {
        cursor: pointer;
      }

      .card.clickable:hover:not(.disabled) {
        transform: translateY(-2px);
        box-shadow: var(--shadow-md);
      }

      .card.clickable:active:not(.disabled) {
        transform: translateY(0);
        box-shadow: var(--shadow-sm);
      }

      .card.clickable:focus-visible {
        outline: 2px solid var(--color-primary);
        outline-offset: 2px;
      }

      .card.disabled {
        opacity: 0.6;
        cursor: not-allowed;
        pointer-events: none;
      }

      .card-header {
        padding: var(--space-lg);
        border-bottom: 1px solid var(--color-border);
        display: flex;
        align-items: flex-start;
        justify-content: space-between;
        gap: var(--space-md);
      }

      .card-header-content {
        flex: 1;
        display: flex;
        flex-direction: column;
        gap: var(--space-xs);
      }

      .card-header-actions {
        display: flex;
        align-items: center;
        gap: var(--space-sm);
        flex-shrink: 0;
      }

      .card-title {
        margin: 0;
        font-size: var(--font-size-lg);
        font-weight: var(--font-weight-semibold);
        color: var(--color-text-primary);
        line-height: var(--line-height-tight);
      }

      .card-subtitle {
        margin: 0;
        font-size: var(--font-size-sm);
        font-weight: var(--font-weight-normal);
        color: var(--color-text-secondary);
        line-height: var(--line-height-normal);
      }

      .card-body {
        padding: var(--space-lg);
        flex: 1;
      }

      .card-body.no-padding {
        padding: 0;
      }

      .card-footer {
        padding: var(--space-lg);
        border-top: 1px solid var(--color-border);
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: var(--space-md);
      }

      .card-footer-actions {
        display: flex;
        align-items: center;
        gap: var(--space-sm);
        margin-left: auto;
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CardComponent {
  @Input() title?: string;
  @Input() subtitle?: string;
  @Input() variant: 'default' | 'outlined' | 'elevated' | 'flat' = 'default';
  @Input() clickable = false;
  @Input() disabled = false;
  @Input() noPadding = false;
  @Input() ariaLabel?: string;
  @ContentChild('header') headerTemplate?: TemplateRef<unknown>;
  @ContentChild('headerActions') headerActions?: TemplateRef<unknown>;
  @ContentChild('footer') footerTemplate?: TemplateRef<unknown>;
  @ContentChild('footerActions') footerActions?: TemplateRef<unknown>;
  @Output() clicked = new EventEmitter<MouseEvent>();

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

  get cardClasses(): string {
    const classes = [
      'card',
      `variant-${this.variant}`,
      this.clickable ? 'clickable' : '',
      this.disabled ? 'disabled' : '',
      this.noPadding ? 'no-padding' : '',
    ];
    return classes.filter((c) => c).join(' ');
  }
}

