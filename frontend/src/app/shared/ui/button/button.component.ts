import { CommonModule } from '@angular/common';
import {
    ChangeDetectionStrategy,
    Component,
    EventEmitter,
    Input,
    Output,
} from '@angular/core';

export type ButtonVariant = 'solid' | 'outline' | 'ghost';
export type ButtonSize = 'sm' | 'md' | 'lg';

@Component({
  selector: 'fs-button',
  standalone: true,
  imports: [CommonModule],
  template: `
    <button
      [type]="type"
      [disabled]="disabled || loading"
      [class]="buttonClasses"
      (click)="handleClick($event)"
    >
      @if (loading) {
        <span class="loading-spinner"></span>
      }
      @if (iconLeft && !loading) {
        <span class="icon-left" [innerHTML]="iconLeft"></span>
      }
      <ng-content></ng-content>
      @if (iconRight && !loading) {
        <span class="icon-right" [innerHTML]="iconRight"></span>
      }
    </button>
  `,
  styleUrls: ['./button.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ButtonComponent {
  @Input() variant: ButtonVariant = 'solid';
  @Input() size: ButtonSize = 'md';
  @Input() type: 'button' | 'submit' | 'reset' = 'button';
  @Input() disabled = false;
  @Input() loading = false;
  @Input() fullWidth = false;
  @Input() iconLeft?: string;
  @Input() iconRight?: string;

  @Output() clicked = new EventEmitter<MouseEvent>();

  get buttonClasses(): string {
    return [
      'fs-button',
      `variant-${this.variant}`,
      `size-${this.size}`,
      this.fullWidth ? 'full-width' : '',
      this.loading ? 'loading' : '',
      this.disabled ? 'disabled' : '',
    ]
      .filter(Boolean)
      .join(' ');
  }

  handleClick(event: MouseEvent): void {
    if (!this.disabled && !this.loading) {
      this.clicked.emit(event);
    }
  }
}

