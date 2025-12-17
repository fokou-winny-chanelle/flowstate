import { CommonModule } from '@angular/common';
import {
    ChangeDetectionStrategy,
    Component,
    ElementRef,
    forwardRef,
    Input,
    ViewChild,
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
        <label [for]="inputId" class="input-label">
          {{ label }}
          @if (required) {
            <span class="required-indicator" aria-label="required">*</span>
          }
        </label>
      }
      <div class="input-wrapper" [class.has-error]="!!error" [class.has-success]="success">
        @if (iconLeft) {
          <span class="input-icon icon-left" [attr.aria-hidden]="true">
            <ng-content select="[icon-left]"></ng-content>
          </span>
        }
        <input
          #inputRef
          [id]="inputId"
          [type]="showPassword ? 'text' : type"
          [placeholder]="placeholder"
          [value]="value"
          [disabled]="disabled"
          [readonly]="readonly"
          [required]="required"
          [attr.aria-label]="ariaLabel || label"
          [attr.aria-describedby]="getAriaDescribedBy()"
          [attr.aria-invalid]="!!error"
          [attr.aria-required]="required"
          (input)="onInput($event)"
          (blur)="onBlur()"
          (focus)="onFocus()"
          class="input-field"
          [class.has-icon-left]="!!iconLeft"
          [class.has-icon-right]="!!iconRight || showPasswordToggle"
          [class.has-error]="!!error"
          [class.has-success]="success"
          [class.focused]="focused" />
        @if (type === 'password' && showPasswordToggle) {
          <button
            type="button"
            class="input-action-button"
            [attr.aria-label]="showPassword ? 'Hide password' : 'Show password'"
            (click)="togglePasswordVisibility()"
            tabindex="-1">
            <ng-content select="[icon-password-toggle]"></ng-content>
          </button>
        }
        @if (iconRight && type !== 'password') {
          <span class="input-icon icon-right" [attr.aria-hidden]="true">
            <ng-content select="[icon-right]"></ng-content>
          </span>
        }
        @if (clearable && value && !disabled) {
          <button
            type="button"
            class="input-action-button clear-button"
            [attr.aria-label]="'Clear input'"
            (click)="clearValue()"
            tabindex="-1">
            <ng-content select="[icon-clear]"></ng-content>
          </button>
        }
      </div>
      @if (error) {
        <span [id]="inputId + '-error'" class="input-error" role="alert">
          {{ error }}
        </span>
      }
      @if (hint && !error) {
        <span [id]="inputId + '-hint'" class="input-hint">
          {{ hint }}
        </span>
      }
      @if (success && !error && !hint) {
        <span class="input-success">
          {{ successMessage || 'Valid' }}
        </span>
      }
    </div>
  `,
  styles: [
    `
      .input-container {
        display: flex;
        flex-direction: column;
        gap: var(--space-xs);
        width: 100%;
      }

      .input-label {
        font-size: var(--font-size-sm);
        font-weight: var(--font-weight-medium);
        color: var(--color-text-primary);
        display: flex;
        align-items: center;
        gap: var(--space-xs);
      }

      .required-indicator {
        color: var(--color-error);
        font-weight: var(--font-weight-bold);
      }

      .input-wrapper {
        position: relative;
        display: flex;
        align-items: center;
        width: 100%;
      }

      .input-wrapper.has-error .input-field {
        border-color: var(--color-error);
      }

      .input-wrapper.has-error .input-field:focus {
        border-color: var(--color-error);
        box-shadow: 0 0 0 3px var(--color-error-light);
      }

      .input-wrapper.has-success .input-field {
        border-color: var(--color-success);
      }

      .input-icon {
        position: absolute;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        color: var(--color-text-secondary);
        pointer-events: none;
        z-index: 1;
      }

      .input-icon.icon-left {
        left: var(--space-md);
      }

      .input-icon.icon-right {
        right: var(--space-md);
      }

      .input-action-button {
        position: absolute;
        right: var(--space-sm);
        display: inline-flex;
        align-items: center;
        justify-content: center;
        width: 32px;
        height: 32px;
        padding: 0;
        background: transparent;
        border: none;
        border-radius: var(--radius-sm);
        color: var(--color-text-secondary);
        cursor: pointer;
        transition: all var(--transition-fast);
        z-index: 2;
      }

      .input-action-button:hover {
        background-color: var(--color-muted);
        color: var(--color-text-primary);
      }

      .input-action-button:active {
        background-color: var(--color-border);
      }

      .input-field {
        width: 100%;
        padding: var(--space-sm) var(--space-md);
        font-family: var(--font-family);
        font-size: var(--font-size-md);
        font-weight: var(--font-weight-normal);
        color: var(--color-text-primary);
        background-color: var(--color-surface);
        border: 1px solid var(--color-border);
        border-radius: var(--radius-md);
        transition: all var(--transition-fast);
        outline: none;
        min-height: 40px;
      }

      .input-field::placeholder {
        color: var(--color-text-tertiary);
      }

      .input-field.has-icon-left {
        padding-left: calc(var(--space-md) + 24px + var(--space-sm));
      }

      .input-field.has-icon-right {
        padding-right: calc(var(--space-md) + 32px);
      }

      .input-field:focus {
        border-color: var(--color-primary);
        box-shadow: 0 0 0 3px var(--color-primary-light);
      }

      .input-field.focused:not(.has-error) {
        border-color: var(--color-primary);
      }

      .input-field.has-error {
        border-color: var(--color-error);
      }

      .input-field.has-error:focus {
        border-color: var(--color-error);
        box-shadow: 0 0 0 3px var(--color-error-light);
      }

      .input-field.has-success:not(.has-error) {
        border-color: var(--color-success);
      }

      .input-field:disabled {
        background-color: var(--color-muted);
        color: var(--color-text-disabled);
        cursor: not-allowed;
        opacity: 0.7;
      }

      .input-field:readonly {
        background-color: var(--color-background);
        cursor: default;
      }

      .input-error {
        font-size: var(--font-size-sm);
        font-weight: var(--font-weight-medium);
        color: var(--color-error);
        display: flex;
        align-items: center;
        gap: var(--space-xs);
      }

      .input-hint {
        font-size: var(--font-size-xs);
        color: var(--color-text-secondary);
      }

      .input-success {
        font-size: var(--font-size-xs);
        color: var(--color-success);
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
  @ViewChild('inputRef') inputRef?: ElementRef<HTMLInputElement>;

  @Input() label?: string;
  @Input() placeholder = '';
  @Input() type:
    | 'text'
    | 'email'
    | 'password'
    | 'number'
    | 'tel'
    | 'url'
    | 'search'
    | 'date'
    | 'time'
    | 'datetime-local' = 'text';
  @Input() error?: string;
  @Input() hint?: string;
  @Input() success = false;
  @Input() successMessage?: string;
  @Input() iconLeft?: boolean;
  @Input() iconRight?: boolean;
  @Input() disabled = false;
  @Input() readonly = false;
  @Input() required = false;
  @Input() clearable = false;
  @Input() showPasswordToggle = true;
  @Input() ariaLabel?: string;
  @Input() autocomplete?: string;
  @Input() maxlength?: number;
  @Input() minlength?: number;
  @Input() pattern?: string;

  value = '';
  inputId = `input-${Math.random().toString(36).substr(2, 9)}`;
  showPassword = false;
  focused = false;

  private onChange: (value: string) => void = () => {};
  private onTouched: () => void = () => {};

  onInput(event: Event) {
    const value = (event.target as HTMLInputElement).value;
    this.value = value;
    this.onChange(value);
  }

  onBlur() {
    this.focused = false;
    this.onTouched();
  }

  onFocus() {
    this.focused = true;
  }

  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
    if (this.inputRef?.nativeElement) {
      this.inputRef.nativeElement.focus();
    }
  }

  clearValue() {
    this.value = '';
    this.onChange('');
    if (this.inputRef?.nativeElement) {
      this.inputRef.nativeElement.focus();
    }
  }

  getAriaDescribedBy(): string {
    const ids: string[] = [];
    if (this.error) {
      ids.push(this.inputId + '-error');
    }
    if (this.hint && !this.error) {
      ids.push(this.inputId + '-hint');
    }
    return ids.length > 0 ? ids.join(' ') : '';
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

  focus(): void {
    this.inputRef?.nativeElement?.focus();
  }

  blur(): void {
    this.inputRef?.nativeElement?.blur();
  }
}

