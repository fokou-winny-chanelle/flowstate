import { CommonModule } from '@angular/common';
import {
    ChangeDetectionStrategy,
    Component,
    Input
} from '@angular/core';
import { AbstractControl } from '@angular/forms';
import { ValidationService } from '../../../core/services/validation.service';

@Component({
  selector: 'flow-form-field',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="form-field" [class.has-error]="!!errorMessage" [class.has-success]="success">
      @if (label) {
        <label [for]="fieldId" class="form-field-label">
          {{ label }}
          @if (required) {
            <span class="required-indicator" aria-label="required">*</span>
          }
        </label>
      }
      <div class="form-field-control">
        <ng-content></ng-content>
      </div>
      @if (errorMessage) {
        <span [id]="fieldId + '-error'" class="form-field-error" role="alert">
          {{ errorMessage }}
        </span>
      }
      @if (hint && !errorMessage) {
        <span [id]="fieldId + '-hint'" class="form-field-hint">
          {{ hint }}
        </span>
      }
      @if (success && !errorMessage && !hint) {
        <span class="form-field-success">
          {{ successMessage || 'Valid' }}
        </span>
      }
    </div>
  `,
  styles: [
    `
      .form-field {
        display: flex;
        flex-direction: column;
        gap: var(--space-xs);
        width: 100%;
      }

      .form-field-label {
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

      .form-field-control {
        width: 100%;
      }

      .form-field-error {
        font-size: var(--font-size-sm);
        font-weight: var(--font-weight-medium);
        color: var(--color-error);
        display: flex;
        align-items: center;
        gap: var(--space-xs);
      }

      .form-field-hint {
        font-size: var(--font-size-xs);
        color: var(--color-text-secondary);
      }

      .form-field-success {
        font-size: var(--font-size-xs);
        color: var(--color-success);
      }

      .form-field.has-error .form-field-control ::ng-deep flow-input .input-field,
      .form-field.has-error .form-field-control ::ng-deep flow-textarea .textarea-field {
        border-color: var(--color-error);
      }

      .form-field.has-success .form-field-control ::ng-deep flow-input .input-field,
      .form-field.has-success .form-field-control ::ng-deep flow-textarea .textarea-field {
        border-color: var(--color-success);
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FormFieldComponent {
  @Input() label?: string;
  @Input() hint?: string;
  @Input() error?: string;
  @Input() control?: AbstractControl | null;
  @Input() fieldName?: string;
  @Input() required = false;
  @Input() success = false;
  @Input() successMessage?: string;
  @Input() fieldId?: string;

  fieldIdGenerated = `field-${Math.random().toString(36).substr(2, 9)}`;

  constructor(private validationService: ValidationService) {}

  get errorMessage(): string {
    if (this.error) {
      return this.error;
    }

    if (this.control) {
      return this.validationService.getErrorMessage(this.control, this.fieldName || this.label);
    }

    return '';
  }

  get computedFieldId(): string {
    return this.fieldId || this.fieldIdGenerated;
  }
}
