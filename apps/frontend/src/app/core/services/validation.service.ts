import { Injectable } from '@angular/core';
import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export interface ValidationMessage {
  key: string;
  message: string;
}

@Injectable({
  providedIn: 'root',
})
export class ValidationService {
  private defaultMessages: Record<string, string> = {
    required: 'This field is required',
    email: 'Please enter a valid email address',
    minlength: 'This field must be at least {minlength} characters',
    maxlength: 'This field must not exceed {maxlength} characters',
    min: 'The minimum value is {min}',
    max: 'The maximum value is {max}',
    pattern: 'Please enter a valid format',
    mustMatch: 'The values do not match',
    passwordStrength: 'Password must contain at least 8 characters with letters and numbers',
    emailExists: 'This email is already registered',
    invalidOtp: 'Invalid or expired verification code',
    invalidCredentials: 'Invalid email or password',
    emailNotVerified: 'Please verify your email address',
    networkError: 'Network error. Please try again.',
    serverError: 'An error occurred. Please try again.',
  };

  getErrorMessage(control: AbstractControl | null, fieldName?: string): string {
    if (!control || !control.errors || !control.touched) {
      return '';
    }

    const errors = control.errors;
    const firstErrorKey = Object.keys(errors)[0];
    const error = errors[firstErrorKey];

    let message = this.defaultMessages[firstErrorKey] || 'Invalid value';

    if (firstErrorKey === 'minlength' && error.requiredLength) {
      message = message.replace('{minlength}', error.requiredLength.toString());
    } else if (firstErrorKey === 'maxlength' && error.requiredLength) {
      message = message.replace('{maxlength}', error.requiredLength.toString());
    } else if (firstErrorKey === 'min' && error.min !== undefined) {
      message = message.replace('{min}', error.min.toString());
    } else if (firstErrorKey === 'max' && error.max !== undefined) {
      message = message.replace('{max}', error.max.toString());
    }

    if (fieldName) {
      message = message.replace('This field', fieldName);
    }

    return message;
  }

  mapBackendErrorToField(
    backendError: any,
    fieldMapping: Record<string, string>,
  ): Record<string, string> {
    const fieldErrors: Record<string, string> = {};

    if (backendError?.message) {
      if (Array.isArray(backendError.message)) {
        backendError.message.forEach((msg: string) => {
          for (const [backendField, frontendField] of Object.entries(fieldMapping)) {
            if (msg.toLowerCase().includes(backendField.toLowerCase())) {
              fieldErrors[frontendField] = msg;
              break;
            }
          }
        });
      } else if (typeof backendError.message === 'string') {
        for (const [backendField, frontendField] of Object.entries(fieldMapping)) {
          if (backendError.message.toLowerCase().includes(backendField.toLowerCase())) {
            fieldErrors[frontendField] = backendError.message;
            break;
          }
        }
      }
    }

    if (backendError?.error?.message) {
      if (Array.isArray(backendError.error.message)) {
        backendError.error.message.forEach((msg: string) => {
          for (const [backendField, frontendField] of Object.entries(fieldMapping)) {
            if (msg.toLowerCase().includes(backendField.toLowerCase())) {
              fieldErrors[frontendField] = msg;
              break;
            }
          }
        });
      }
    }

    return fieldErrors;
  }

  passwordStrengthValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value) {
        return null;
      }

      const value = control.value;
      const hasLetters = /[a-zA-Z]/.test(value);
      const hasNumbers = /[0-9]/.test(value);
      const hasMinLength = value.length >= 8;

      if (!hasMinLength || !hasLetters || !hasNumbers) {
        return { passwordStrength: true };
      }

      return null;
    };
  }

  mustMatchValidator(controlName: string, matchingControlName: string): ValidatorFn {
    return (formGroup: AbstractControl): ValidationErrors | null => {
      const control = formGroup.get(controlName);
      const matchingControl = formGroup.get(matchingControlName);

      if (!control || !matchingControl) {
        return null;
      }

      if (matchingControl.errors && !matchingControl.errors['mustMatch']) {
        return null;
      }

      if (control.value !== matchingControl.value) {
        matchingControl.setErrors({ mustMatch: true });
        return { mustMatch: true };
      } else {
        matchingControl.setErrors(null);
        return null;
      }
    };
  }

  getPasswordStrength(value: string): 'weak' | 'medium' | 'strong' {
    if (!value) {
      return 'weak';
    }

    let strength = 0;

    if (value.length >= 8) strength++;
    if (value.length >= 12) strength++;
    if (/[a-z]/.test(value) && /[A-Z]/.test(value)) strength++;
    if (/[0-9]/.test(value)) strength++;
    if (/[^a-zA-Z0-9]/.test(value)) strength++;

    if (strength <= 2) return 'weak';
    if (strength <= 3) return 'medium';
    return 'strong';
  }
}
