import { CommonModule } from '@angular/common';
import {
    ChangeDetectionStrategy,
    Component,
    forwardRef,
    Input,
} from '@angular/core';
import {
    ControlValueAccessor,
    FormsModule,
    NG_VALUE_ACCESSOR,
} from '@angular/forms';

@Component({
  selector: 'flow-input',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="input-container">
      @if (label) {
        <label [for]="inputId" class="input-label">{{ label }}</label>
      }
      <div class="input-wrapper">
        @if (icon) {
          <span class="input-icon" [innerHTML]="icon"></span>
        }
        <input
          [id]="inputId"
          [type]="type"
          [placeholder]="placeholder"
          [value]="value"
          [disabled]="disabled"
          [readonly]="readonly"
          (input)="onInput($event)"
          (blur)="onBlur()"
          class="input-field"
          [class.has-icon]="!!icon"
          [class.has-error]="!!error" />
      </div>
      @if (error) {
        <span class="input-error">{{ error }}</span>
      }
      @if (hint && !error) {
        <span class="input-hint">{{ hint }}</span>
      }
    </div>
  `,
  styles: [
    `
      .input-container {
        display: flex;
        flex-direction: column;
        gap: var(--space-xs);
      }

      .input-label {
        font-size: var(--font-size-sm);
        font-weight: 500;
        color: var(--color-text-primary);
      }

      .input-wrapper {
        position: relative;
        display: flex;
        align-items: center;
      }

      .input-icon {
        position: absolute;
        left: var(--space-md);
        color: var(--color-text-secondary);
        pointer-events: none;
      }

      .input-field {
        width: 100%;
        padding: var(--space-sm) var(--space-md);
        padding-left: var(--space-md);
        font-family: var(--font-family);
        font-size: var(--font-size-md);
        color: var(--color-text-primary);
        background-color: var(--color-surface);
        border: 1px solid var(--color-muted);
        border-radius: var(--radius-md);
        transition: all var(--transition-fast);
        outline: none;
      }

      .input-field.has-icon {
        padding-left: calc(var(--space-md) + 20px + var(--space-sm));
      }

      .input-field:focus {
        border-color: var(--color-primary);
        box-shadow: 0 0 0 3px var(--color-primary-light);
      }

      .input-field.has-error {
        border-color: var(--color-error);
      }

      .input-field:disabled {
        opacity: 0.5;
        cursor: not-allowed;
      }

      .input-error {
        font-size: var(--font-size-sm);
        color: var(--color-error);
      }

      .input-hint {
        font-size: var(--font-size-xs);
        color: var(--color-text-secondary);
      }
    `,
  ],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => InputComponent),
      multi: true,
    },
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InputComponent implements ControlValueAccessor {
  @Input() label?: string;
  @Input() placeholder = '';
  @Input() type = 'text';
  @Input() error?: string;
  @Input() hint?: string;
  @Input() icon?: string;
  @Input() disabled = false;
  @Input() readonly = false;

  value = '';
  inputId = `input-${Math.random().toString(36).substr(2, 9)}`;

  private onChange: (value: string) => void = () => {
    // ControlValueAccessor onChange callback
  };
  private onTouched: () => void = () => {
    // ControlValueAccessor onTouched callback
  };

  onInput(event: Event) {
    const value = (event.target as HTMLInputElement).value;
    this.value = value;
    this.onChange(value);
  }

  onBlur() {
    this.onTouched();
  }

  writeValue(value: string): void {
    this.value = value || '';
  }

  registerOnChange(fn: (value: string) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }
}

