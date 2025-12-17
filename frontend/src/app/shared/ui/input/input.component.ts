import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  forwardRef,
  Input,
  Output,
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

export type InputType = 'text' | 'email' | 'password' | 'number' | 'tel';
export type InputSize = 'sm' | 'md' | 'lg';

@Component({
  selector: 'fs-input',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div [class]="containerClasses">
      @if (label) {
        <label [for]="inputId" class="input-label">
          {{ label }}
          @if (required) {
            <span class="required">*</span>
          }
        </label>
      }
      <div class="input-wrapper">
        @if (prefixIcon) {
          <span class="prefix-icon" [innerHTML]="prefixIcon"></span>
        }
        <input
          [id]="inputId"
          [type]="type"
          [value]="value"
          [placeholder]="placeholder"
          [disabled]="disabled"
          [readonly]="readonly"
          [required]="required"
          [class]="inputClasses"
          (input)="onInput($event)"
          (blur)="onTouched()"
          (focus)="focused.emit($event)"
        />
        @if (suffixIcon) {
          <span class="suffix-icon" [innerHTML]="suffixIcon"></span>
        }
      </div>
      @if (hint && !error) {
        <span class="hint">{{ hint }}</span>
      }
      @if (error) {
        <span class="error-message">{{ error }}</span>
      }
    </div>
  `,
  styleUrls: ['./input.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => InputComponent),
      multi: true,
    },
  ],
})
export class InputComponent implements ControlValueAccessor {
  @Input() type: InputType = 'text';
  @Input() size: InputSize = 'md';
  @Input() label?: string;
  @Input() placeholder = '';
  @Input() hint?: string;
  @Input() error?: string;
  @Input() disabled = false;
  @Input() readonly = false;
  @Input() required = false;
  @Input() prefixIcon?: string;
  @Input() suffixIcon?: string;
  @Input() inputId = `fs-input-${Math.random().toString(36).substr(2, 9)}`;

  @Output() focused = new EventEmitter<FocusEvent>();

  value = '';
  onChange: (value: string) => void = () => {};
  onTouched: () => void = () => {};

  get containerClasses(): string {
    return ['fs-input-container', `size-${this.size}`].filter(Boolean).join(' ');
  }

  get inputClasses(): string {
    return [
      'fs-input',
      this.error ? 'error' : '',
      this.prefixIcon ? 'has-prefix' : '',
      this.suffixIcon ? 'has-suffix' : '',
    ]
      .filter(Boolean)
      .join(' ');
  }

  onInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.value = input.value;
    this.onChange(this.value);
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

