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
      (click)="handleClick($event)"
      (keyup.enter)="handleKeyUp($event)"
      (keyup.space)="handleKeyUp($event)">
      @if (title || headerTemplate) {
        <div class="card-header">
          @if (title) {
            <h3 class="card-title">{{ title }}</h3>
          }
          @if (headerTemplate) {
            <ng-container *ngTemplateOutlet="headerTemplate"></ng-container>
          }
        </div>
      }
      <div class="card-body">
        <ng-content></ng-content>
      </div>
      @if (footerTemplate) {
        <div class="card-footer">
          <ng-container *ngTemplateOutlet="footerTemplate"></ng-container>
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
      }

      .card.variant-default {
        border: 1px solid var(--color-muted);
      }

      .card.variant-outlined {
        border: 2px solid var(--color-muted);
      }

      .card.variant-elevated {
        box-shadow: var(--shadow-md);
      }

      .card.variant-elevated:hover {
        box-shadow: var(--shadow-lg);
      }

      .card.clickable {
        cursor: pointer;
      }

      .card.clickable:hover {
        transform: translateY(-2px);
        box-shadow: var(--shadow-md);
      }

      .card-header {
        padding: var(--space-lg);
        border-bottom: 1px solid var(--color-muted);
      }

      .card-title {
        margin: 0;
        font-size: var(--font-size-lg);
        font-weight: 600;
        color: var(--color-text-primary);
      }

      .card-body {
        padding: var(--space-lg);
      }

      .card.no-padding .card-body {
        padding: 0;
      }

      .card-footer {
        padding: var(--space-lg);
        border-top: 1px solid var(--color-muted);
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CardComponent {
  @Input() title?: string;
  @Input() variant: 'default' | 'outlined' | 'elevated' = 'default';
  @Input() clickable = false;
  @Input() noPadding = false;
  @ContentChild('header') headerTemplate?: TemplateRef<unknown>;
  @ContentChild('footer') footerTemplate?: TemplateRef<unknown>;
  @Output() clicked = new EventEmitter<MouseEvent>();

  handleClick(event: MouseEvent) {
    if (this.clickable) {
      this.clicked.emit(event);
    }
  }

  handleKeyUp(event: Event) {
    if (this.clickable) {
      const keyboardEvent = event as KeyboardEvent;
      if (keyboardEvent.key === 'Enter' || keyboardEvent.key === ' ') {
        keyboardEvent.preventDefault();
        this.clicked.emit(keyboardEvent as unknown as MouseEvent);
      }
    }
  }

  get cardClasses(): string {
    const classes = [
      'card',
      `variant-${this.variant}`,
      this.clickable ? 'clickable' : '',
      this.noPadding ? 'no-padding' : '',
    ];
    return classes.filter((c) => c).join(' ');
  }
}

