import { CommonModule } from '@angular/common';
import {
  Component,
  effect,
  EventEmitter,
  Input,
  Output,
  signal,
  WritableSignal,
} from '@angular/core';

@Component({
  selector: 'flow-modal',
  standalone: true,
  imports: [CommonModule],
  template: `
    @if (_isOpen()) {
      <div 
        class="modal-overlay" 
        (click)="handleOverlayClick($event)"
        (keydown.escape)="close()"
        role="dialog"
        aria-modal="true"
        [attr.aria-labelledby]="title ? 'modal-title' : null">
        <div class="modal-container" [class]="'size-' + size" (click)="$event.stopPropagation()">
          <div class="modal-header">
            @if (title) {
              <h2 class="modal-title" id="modal-title">{{ title }}</h2>
            }
            <ng-content select="[modal-header]"></ng-content>
            <button
              type="button"
              class="modal-close"
              (click)="close()"
              [attr.aria-label]="'Close modal'">
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </div>
          <div class="modal-body">
            <ng-content></ng-content>
          </div>
          @if (showFooter) {
            <div class="modal-footer">
              <ng-content select="[modal-footer]"></ng-content>
            </div>
          }
        </div>
      </div>
    }
  `,
  styles: [
    `
      .modal-overlay {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background-color: rgba(0, 0, 0, 0.5);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 1000;
        padding: var(--space-md);
        animation: fadeIn 0.2s ease-out;
      }

      @keyframes fadeIn {
        from {
          opacity: 0;
        }
        to {
          opacity: 1;
        }
      }

      .modal-container {
        background-color: var(--color-surface);
        border-radius: var(--radius-lg);
        box-shadow: var(--shadow-lg);
        max-width: 90vw;
        max-height: 90vh;
        min-height: 200px;
        width: 100%;
        display: flex;
        flex-direction: column;
        animation: slideUp 0.3s ease-out;
        overflow: hidden;
      }

      @keyframes slideUp {
        from {
          transform: translateY(20px);
          opacity: 0;
        }
        to {
          transform: translateY(0);
          opacity: 1;
        }
      }

      .modal-container.size-sm {
        width: 100%;
        max-width: 400px;
        min-height: 300px;
      }

      .modal-container.size-md {
        width: 100%;
        max-width: 600px;
        min-height: 630px;
      }

      .modal-container.size-lg {
        width: 100%;
        max-width: 800px;
        min-height: 500px;
      }

      .modal-container.size-xl {
        width: 100%;
        max-width: 1000px;
        min-height: 600px;
      }

      .modal-container.size-full {
        width: 100%;
        max-width: 95vw;
        height: 95vh;
      }

      .modal-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: var(--space-lg);
        border-bottom: 1px solid var(--color-border);
        flex-shrink: 0;
      }

      .modal-title {
        font-size: var(--font-size-xl);
        font-weight: 600;
        color: var(--color-text-primary);
        margin: 0;
      }

      .modal-close {
        background: none;
        border: none;
        cursor: pointer;
        padding: var(--space-xs);
        display: flex;
        align-items: center;
        justify-content: center;
        color: var(--color-text-secondary);
        border-radius: var(--radius-sm);
        transition: all var(--transition-fast);
        margin-left: var(--space-md);
      }

      .modal-close:hover {
        background-color: var(--color-muted);
        color: var(--color-text-primary);
      }

      .modal-body {
        padding: var(--space-lg);
        overflow-y: auto;
        flex: 1 1 auto;
        min-height: 400px;
        display: block;
      }

      .modal-footer {
        display: flex;
        align-items: center;
        justify-content: flex-end;
        gap: var(--space-sm);
        padding: var(--space-lg);
        border-top: 1px solid var(--color-border);
        flex-shrink: 0;
      }

      @media (max-width: 768px) {
        .modal-container {
          max-width: 95vw;
          max-height: 95vh;
        }

        .modal-header,
        .modal-body,
        .modal-footer {
          padding: var(--space-md);
        }
      }
    `,
  ],
})
export class ModalComponent {
  @Input() title?: string;
  @Input() size: 'sm' | 'md' | 'lg' | 'xl' | 'full' = 'md';
  @Input() showFooter = true;
  @Input() closeOnOverlayClick = true;
  @Input() set isOpen(value: WritableSignal<boolean>) {
    this._isOpen = value;
  }
  get isOpen() {
    return this._isOpen;
  }
  protected _isOpen: WritableSignal<boolean> = signal(false);

  @Output() closed = new EventEmitter<void>();

  constructor() {
    effect(() => {
      if (this._isOpen()) {
        document.body.style.overflow = 'hidden';
      } else {
        document.body.style.overflow = '';
      }
    });
  }

  close() {
    this._isOpen.set(false);
    this.closed.emit();
  }

  handleOverlayClick(event: MouseEvent) {
    if (this.closeOnOverlayClick && event.target === event.currentTarget) {
      this.close();
    }
  }
}

