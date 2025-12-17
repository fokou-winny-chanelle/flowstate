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
  selector: 'flow-textarea',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="textarea-container">
      @if (label) {
        <label [for]="textareaId" class="textarea-label">
          {{ label }}
          @if (required) {
            <span class="required-indicator" aria-label="required">*</span>
          }
        </label>
      }
      <div class="textarea-wrapper" [class.has-error]="!!error" [class.has-success]="success">
        <textarea
          #textareaRef
          [id]="textareaId"
          [placeholder]="placeholder"
          [value]="value"
          [disabled]="disabled"
          [readonly]="readonly"
          [required]="required"
          [rows]="rows"
          [attr.maxlength]="maxlength"
          [attr.aria-label]="ariaLabel || label"
          [attr.aria-describedby]="getAriaDescribedBy()"
          [attr.aria-invalid]="!!error"
          [attr.aria-required]="required"
          (input)="onInput($event)"
          (blur)="onBlur()"
          (focus)="onFocus()"
          class="textarea-field"
          [class.has-error]="!!error"
          [class.has-success]="success"
          [class.focused]="focused"
          [style.height.px]="autoResize ? computedHeight : undefined"
          [style.resize]="autoResize ? 'none' : 'vertical'"></textarea>
        @if (maxlength && showCounter) {
          <div class="textarea-counter">
            {{ value.length }} / {{ maxlength }}
          </div>
        }
      </div>
      @if (error) {
        <span [id]="textareaId + '-error'" class="textarea-error" role="alert">
          {{ error }}
        </span>
      }
      @if (hint && !error) {
        <span [id]="textareaId + '-hint'" class="textarea-hint">
          {{ hint }}
        </span>
      }
      @if (success && !error && !hint) {
        <span class="textarea-success">
          {{ successMessage || 'Valid' }}
        </span>
      }
    </div>
  `,
  styles: [
    `
      .textarea-container {
        display: flex;
        flex-direction: column;
        gap: var(--space-xs);
        width: 100%;
      }

      .textarea-label {
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

      .textarea-wrapper {
        position: relative;
        display: flex;
        flex-direction: column;
        width: 100%;
      }

      .textarea-wrapper.has-error .textarea-field {
        border-color: var(--color-error);
      }

      .textarea-wrapper.has-error .textarea-field:focus {
        border-color: var(--color-error);
        box-shadow: 0 0 0 3px var(--color-error-light);
      }

      .textarea-wrapper.has-success .textarea-field {
        border-color: var(--color-success);
      }

      .textarea-field {
        width: 100%;
        padding: var(--space-sm) var(--space-md);
        font-family: var(--font-family);
        font-size: var(--font-size-md);
        font-weight: var(--font-weight-normal);
        line-height: var(--line-height-relaxed);
        color: var(--color-text-primary);
        background-color: var(--color-surface);
        border: 1px solid var(--color-border);
        border-radius: var(--radius-md);
        transition: all var(--transition-fast);
        outline: none;
        min-height: 100px;
        overflow-y: auto;
      }

      .textarea-field::placeholder {
        color: var(--color-text-tertiary);
      }

      .textarea-field:focus {
        border-color: var(--color-primary);
        box-shadow: 0 0 0 3px var(--color-primary-light);
      }

      .textarea-field.focused:not(.has-error) {
        border-color: var(--color-primary);
      }

      .textarea-field.has-error {
        border-color: var(--color-error);
      }

      .textarea-field.has-error:focus {
        border-color: var(--color-error);
        box-shadow: 0 0 0 3px var(--color-error-light);
      }

      .textarea-field.has-success:not(.has-error) {
        border-color: var(--color-success);
      }

      .textarea-field:disabled {
        background-color: var(--color-muted);
        color: var(--color-text-disabled);
        cursor: not-allowed;
        opacity: 0.7;
      }

      .textarea-field:readonly {
        background-color: var(--color-background);
        cursor: default;
      }

      .textarea-counter {
        position: absolute;
        bottom: var(--space-xs);
        right: var(--space-sm);
        font-size: var(--font-size-xs);
        color: var(--color-text-tertiary);
        background-color: var(--color-surface);
        padding: 2px var(--space-xs);
        border-radius: var(--radius-xs);
      }

      .textarea-error {
        font-size: var(--font-size-sm);
        font-weight: var(--font-weight-medium);
        color: var(--color-error);
        display: flex;
        align-items: center;
        gap: var(--space-xs);
      }

      .textarea-hint {
        font-size: var(--font-size-xs);
        color: var(--color-text-secondary);
      }

      .textarea-success {
        font-size: var(--font-size-xs);
        color: var(--color-success);
      }
    `,
  ],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => TextareaComponent),
      multi: true,
    },
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TextareaComponent implements ControlValueAccessor {
  @ViewChild('textareaRef') textareaRef?: ElementRef<HTMLTextAreaElement>;

  @Input() label?: string;
  @Input() placeholder = '';
  @Input() error?: string;
  @Input() hint?: string;
  @Input() success = false;
  @Input() successMessage?: string;
  @Input() disabled = false;
  @Input() readonly = false;
  @Input() required = false;
  @Input() rows = 4;
  @Input() maxlength?: number;
  @Input() showCounter = true;
  @Input() autoResize = false;
  @Input() ariaLabel?: string;

  value = '';
  textareaId = `textarea-${Math.random().toString(36).substr(2, 9)}`;
  focused = false;
  computedHeight = 100;

  private onChange: (value: string) => void = () => {};
  private onTouched: () => void = () => {};

  onInput(event: Event) {
    const value = (event.target as HTMLTextAreaElement).value;
    this.value = value;
    this.onChange(value);

    if (this.autoResize && this.textareaRef?.nativeElement) {
      this.adjustHeight();
    }
  }

  onBlur() {
    this.focused = false;
    this.onTouched();
  }

  onFocus() {
    this.focused = true;
  }

  adjustHeight() {
    if (this.textareaRef?.nativeElement) {
      const textarea = this.textareaRef.nativeElement;
      textarea.style.height = 'auto';
      this.computedHeight = Math.max(100, textarea.scrollHeight);
      textarea.style.height = this.computedHeight + 'px';
    }
  }

  getAriaDescribedBy(): string {
    const ids: string[] = [];
    if (this.error) {
      ids.push(this.textareaId + '-error');
    }
    if (this.hint && !this.error) {
      ids.push(this.textareaId + '-hint');
    }
    return ids.length > 0 ? ids.join(' ') : '';
  }

  writeValue(value: string): void {
    this.value = value || '';
    if (this.autoResize) {
      setTimeout(() => this.adjustHeight(), 0);
    }
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
    this.textareaRef?.nativeElement?.focus();
  }

  blur(): void {
    this.textareaRef?.nativeElement?.blur();
  }
}
