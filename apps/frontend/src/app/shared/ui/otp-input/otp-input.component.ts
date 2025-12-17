import { CommonModule } from '@angular/common';
import {
    ChangeDetectionStrategy,
    Component,
    ElementRef,
    forwardRef,
    Input,
    QueryList,
    ViewChildren,
} from '@angular/core';
import {
    ControlValueAccessor,
    FormsModule,
    NG_VALUE_ACCESSOR,
} from '@angular/forms';

@Component({
  selector: 'flow-otp-input',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="otp-input-container">
      @if (label) {
        <label [for]="inputIds[0]" class="otp-label">
          {{ label }}
          @if (required) {
            <span class="required-indicator" aria-label="required">*</span>
          }
        </label>
      }
      <div class="otp-inputs" [class.has-error]="!!error">
        @for (i of [0, 1, 2, 3, 4, 5]; track i) {
          <input
            #inputRef
            [id]="inputIds[i]"
            type="text"
            inputmode="numeric"
            pattern="[0-9]*"
            maxlength="1"
            [value]="digits[i] || ''"
            [disabled]="disabled"
            [attr.aria-label]="'Digit ' + (i + 1) + ' of 6'"
            [attr.aria-describedby]="error ? otpId + '-error' : undefined"
            [attr.aria-invalid]="!!error"
            (input)="onInput($event, i)"
            (keydown)="onKeyDown($event, i)"
            (paste)="onPaste($event)"
            (focus)="onFocus(i)"
            class="otp-digit"
            [class.has-error]="!!error"
            [class.focused]="focusedIndex === i" />
        }
      </div>
      @if (error) {
        <span [id]="otpId + '-error'" class="otp-error" role="alert">
          {{ error }}
        </span>
      }
      @if (hint && !error) {
        <span [id]="otpId + '-hint'" class="otp-hint">
          {{ hint }}
        </span>
      }
    </div>
  `,
  styles: [
    `
      .otp-input-container {
        display: flex;
        flex-direction: column;
        gap: var(--space-xs);
        width: 100%;
      }

      .otp-label {
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

      .otp-inputs {
        display: flex;
        gap: var(--space-sm);
        justify-content: center;
        width: 100%;
      }

      .otp-digit {
        width: 48px;
        height: 56px;
        text-align: center;
        font-size: var(--font-size-2xl);
        font-weight: var(--font-weight-semibold);
        font-family: var(--font-family);
        color: var(--color-text-primary);
        background-color: var(--color-surface);
        border: 2px solid var(--color-border);
        border-radius: var(--radius-md);
        transition: all var(--transition-fast);
        outline: none;
      }

      .otp-digit:focus {
        border-color: var(--color-primary);
        box-shadow: 0 0 0 3px var(--color-primary-light);
        transform: scale(1.05);
      }

      .otp-digit.focused {
        border-color: var(--color-primary);
      }

      .otp-digit.has-error {
        border-color: var(--color-error);
      }

      .otp-digit.has-error:focus {
        border-color: var(--color-error);
        box-shadow: 0 0 0 3px var(--color-error-light);
      }

      .otp-digit:disabled {
        background-color: var(--color-muted);
        color: var(--color-text-disabled);
        cursor: not-allowed;
        opacity: 0.7;
      }

      .otp-error {
        font-size: var(--font-size-sm);
        font-weight: var(--font-weight-medium);
        color: var(--color-error);
        text-align: center;
      }

      .otp-hint {
        font-size: var(--font-size-xs);
        color: var(--color-text-secondary);
        text-align: center;
      }

      @media (max-width: 640px) {
        .otp-digit {
          width: 40px;
          height: 48px;
          font-size: var(--font-size-xl);
        }
      }
    `,
  ],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => OtpInputComponent),
      multi: true,
    },
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OtpInputComponent implements ControlValueAccessor {
  @ViewChildren('inputRef') inputRefs?: QueryList<ElementRef<HTMLInputElement>>;

  @Input() label?: string;
  @Input() length = 6;
  @Input() error?: string;
  @Input() hint?: string;
  @Input() disabled = false;
  @Input() required = false;
  @Input() ariaLabel?: string;

  digits: string[] = Array(6).fill('');
  otpId = `otp-${Math.random().toString(36).substr(2, 9)}`;
  inputIds = Array.from({ length: 6 }, (_, i) => `${this.otpId}-${i}`);
  focusedIndex = -1;

  private onChange: (value: string) => void = () => {
    // ControlValueAccessor interface requirement - implemented via registerOnChange
  };
  private onTouched: () => void = () => {
    // ControlValueAccessor interface requirement - implemented via registerOnTouched
  };

  onInput(event: Event, index: number) {
    const input = event.target as HTMLInputElement;
    const value = input.value.replace(/[^0-9]/g, '');

    if (value.length > 1) {
      return;
    }

    this.digits[index] = value;
    input.value = value;

    if (value && index < this.length - 1) {
      this.focusInput(index + 1);
    }

    this.updateValue();
  }

  onKeyDown(event: KeyboardEvent, index: number) {
    if (event.key === 'Backspace' && !this.digits[index] && index > 0) {
      this.focusInput(index - 1);
    } else if (event.key === 'ArrowLeft' && index > 0) {
      event.preventDefault();
      this.focusInput(index - 1);
    } else if (event.key === 'ArrowRight' && index < this.length - 1) {
      event.preventDefault();
      this.focusInput(index + 1);
    }
  }

  onPaste(event: ClipboardEvent) {
    event.preventDefault();
    const pastedData = event.clipboardData?.getData('text') || '';
    const digits = pastedData.replace(/[^0-9]/g, '').slice(0, this.length);

    digits.split('').forEach((digit, i) => {
      if (i < this.length) {
        this.digits[i] = digit;
        const inputElement = this.inputRefs?.get(i)?.nativeElement;
        if (inputElement) {
          inputElement.value = digit;
        }
      }
    });

    this.updateValue();

    const nextEmptyIndex = this.digits.findIndex((d) => !d);
    if (nextEmptyIndex !== -1) {
      this.focusInput(nextEmptyIndex);
    } else {
      this.focusInput(this.length - 1);
    }
  }

  onFocus(index: number) {
    this.focusedIndex = index;
  }

  focusInput(index: number) {
    this.inputRefs?.get(index)?.nativeElement?.focus();
    this.focusedIndex = index;
  }

  updateValue() {
    const value = this.digits.join('');
    this.onChange(value);
  }

  getAriaDescribedBy(): string {
    const ids: string[] = [];
    if (this.error) {
      ids.push(this.otpId + '-error');
    }
    if (this.hint && !this.error) {
      ids.push(this.otpId + '-hint');
    }
    return ids.length > 0 ? ids.join(' ') : '';
  }

  writeValue(value: string): void {
    if (!value) {
      this.digits = Array(6).fill('');
      return;
    }

    const digitsArray = value.replace(/[^0-9]/g, '').slice(0, 6).split('');
    this.digits = [...digitsArray, ...Array(6 - digitsArray.length).fill('')];

    this.inputRefs?.forEach((ref, i) => {
      if (ref.nativeElement) {
        ref.nativeElement.value = this.digits[i] || '';
      }
    });
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
    this.focusInput(0);
  }

  clear(): void {
    this.digits = Array(6).fill('');
    this.inputRefs?.forEach((ref) => {
      if (ref.nativeElement) {
        ref.nativeElement.value = '';
      }
    });
    this.updateValue();
    this.focusInput(0);
  }
}
