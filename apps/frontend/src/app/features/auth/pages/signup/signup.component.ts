import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import {
    AbstractControl,
    FormBuilder,
    ReactiveFormsModule,
    ValidationErrors,
    ValidatorFn,
    Validators,
} from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../../core/services/auth.service';
import { ValidationService } from '../../../../core/services/validation.service';
import { ButtonComponent } from '../../../../shared/ui/button/button.component';
import { FormFieldComponent } from '../../../../shared/ui/form-field/form-field.component';
import { InputComponent } from '../../../../shared/ui/input/input.component';
import { PasswordStrengthComponent } from '../../../../shared/ui/password-strength/password-strength.component';

function passwordMatchValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const password = control.get('password');
    const confirmPassword = control.get('confirmPassword');

    if (!password || !confirmPassword) {
      return null;
    }

    if (password.value !== confirmPassword.value) {
      confirmPassword.setErrors({ mustMatch: true });
      return { mustMatch: true };
    } else {
      confirmPassword.setErrors(null);
      return null;
    }
  };
}

@Component({
  selector: 'flow-signup',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    ButtonComponent,
    InputComponent,
    FormFieldComponent,
    PasswordStrengthComponent,
  ],
  template: `
    <div class="signup-page">
      <h2>Create your account</h2>
      <p class="subtitle">Start organizing your life with FlowState</p>

      <form [formGroup]="signupForm" (ngSubmit)="onSubmit()" class="signup-form" novalidate>
        <flow-form-field
          label="Full name"
          [required]="true"
          [control]="signupForm.get('fullName')"
          fieldName="Full name"
          [fieldId]="'signup-fullname'">
          <flow-input
            id="signup-fullname"
            type="text"
            placeholder="John Doe"
            formControlName="fullName"
            [required]="true"
            [error]="getFieldError('fullName')"
            ariaLabel="Full name" />
        </flow-form-field>

        <flow-form-field
          label="Email address"
          [required]="true"
          [control]="signupForm.get('email')"
          fieldName="Email address"
          [fieldId]="'signup-email'">
          <flow-input
            id="signup-email"
            type="email"
            placeholder="you@example.com"
            formControlName="email"
            [required]="true"
            [error]="getFieldError('email')"
            ariaLabel="Email address" />
        </flow-form-field>

        <flow-form-field
          label="Password"
          [required]="true"
          [control]="signupForm.get('password')"
          fieldName="Password"
          [fieldId]="'signup-password'"
          [hint]="'At least 8 characters with letters and numbers'">
          <flow-input
            id="signup-password"
            type="password"
            placeholder="Create a strong password"
            formControlName="password"
            [required]="true"
            [showPasswordToggle]="true"
            [error]="getFieldError('password')"
            ariaLabel="Password" />
          @if (signupForm.get('password')?.value) {
            <flow-password-strength
              [password]="signupForm.get('password')?.value || ''"
              [showLabel]="true" />
          }
        </flow-form-field>

        <flow-form-field
          label="Confirm password"
          [required]="true"
          [control]="signupForm.get('confirmPassword')"
          fieldName="Confirm password"
          [fieldId]="'signup-confirm-password'">
          <flow-input
            id="signup-confirm-password"
            type="password"
            placeholder="Confirm your password"
            formControlName="confirmPassword"
            [required]="true"
            [showPasswordToggle]="true"
            [error]="getFieldError('confirmPassword')"
            ariaLabel="Confirm password" />
        </flow-form-field>

        <div class="terms-section">
          <label class="terms-label">
            <input
              type="checkbox"
              formControlName="acceptTerms"
              class="terms-checkbox" />
            <span>
              I agree to the
              <a href="/terms" target="_blank" class="terms-link">Terms of Service</a>
              and
              <a href="/privacy" target="_blank" class="terms-link">Privacy Policy</a>
            </span>
          </label>
          @if (
            signupForm.get('acceptTerms')?.invalid &&
            signupForm.get('acceptTerms')?.touched
          ) {
            <span class="terms-error">You must accept the terms to continue</span>
          }
        </div>

        @if (generalError()) {
          <div class="error-banner" role="alert">
            {{ generalError() }}
          </div>
        }

        <flow-button
          type="submit"
          variant="solid"
          size="lg"
          [disabled]="signupForm.invalid || isLoading()"
          [loading]="isLoading()"
          [fullWidth]="true">
          Create account
        </flow-button>
      </form>

      <div class="auth-footer">
        <p>
          Already have an account?
          <a routerLink="/auth/login" class="auth-link">Sign in</a>
        </p>
      </div>
    </div>
  `,
  styles: [
    `
      .signup-page {
        width: 100%;
      }

      h2 {
        font-size: var(--font-size-2xl);
        font-weight: var(--font-weight-bold);
        color: var(--color-text-primary);
        margin: var(--space-xl) 0 var(--space-md) 0;
        text-align: center;
      }

      .subtitle {
        font-size: var(--font-size-sm);
        color: var(--color-text-secondary);
        text-align: center;
        margin: 0 0 var(--space-2xl) 0;
        line-height: 1.5;
      }

      .signup-form {
        display: flex;
        flex-direction: column;
        gap: var(--space-lg);
      }

      .terms-section {
        display: flex;
        flex-direction: column;
        gap: var(--space-xs);
      }

      .terms-label {
        display: flex;
        align-items: flex-start;
        gap: var(--space-sm);
        font-size: var(--font-size-sm);
        color: var(--color-text-primary);
        cursor: pointer;
        line-height: var(--line-height-relaxed);
      }

      .terms-checkbox {
        margin-top: 2px;
        width: 18px;
        height: 18px;
        cursor: pointer;
        accent-color: var(--color-primary);
        flex-shrink: 0;
      }

      .terms-link {
        color: var(--color-accent);
        text-decoration: none;
        font-weight: var(--font-weight-medium);
      }

      .terms-link:hover {
        text-decoration: underline;
        color: var(--color-accent-hover);
      }

      .terms-error {
        font-size: var(--font-size-xs);
        color: var(--color-error);
        margin-left: calc(18px + var(--space-sm));
      }

      .error-banner {
        padding: var(--space-md);
        background-color: var(--color-error-light);
        border: 1px solid var(--color-error);
        border-radius: var(--radius-md);
        color: var(--color-error);
        font-size: var(--font-size-sm);
        font-weight: var(--font-weight-medium);
      }

      .auth-footer {
        margin-top: var(--space-xl);
        text-align: center;
        font-size: var(--font-size-sm);
        color: var(--color-text-secondary);
      }

      .auth-link {
        color: var(--color-accent);
        font-weight: var(--font-weight-medium);
        text-decoration: none;
        margin-left: var(--space-xs);
      }

      .auth-link:hover {
        text-decoration: underline;
        color: var(--color-accent-hover);
      }
    `,
  ],
})
export class SignupComponent {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);
  private validationService = inject(ValidationService);

  signupForm = this.fb.group(
    {
      fullName: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      password: [
        '',
        [
          Validators.required,
          Validators.minLength(8),
          this.validationService.passwordStrengthValidator(),
        ],
      ],
      confirmPassword: ['', [Validators.required]],
      acceptTerms: [false, [Validators.requiredTrue]],
    },
    { validators: passwordMatchValidator() },
  );

  isLoading = signal(false);
  generalError = signal('');

  getFieldError(fieldName: string): string {
    const control = this.signupForm.get(fieldName);
    if (!control) return '';

    if (control.invalid && (control.touched || control.dirty)) {
      if (fieldName === 'confirmPassword' && control.errors?.['mustMatch']) {
        return 'Passwords do not match';
      }

      return this.validationService.getErrorMessage(
        control,
        fieldName === 'fullName'
          ? 'Full name'
          : fieldName === 'email'
            ? 'Email address'
            : fieldName === 'password'
              ? 'Password'
              : 'Confirm password',
      );
    }

    return '';
  }

  onSubmit() {
    if (this.signupForm.invalid) {
      this.signupForm.markAllAsTouched();
      return;
    }

    this.isLoading.set(true);
    this.generalError.set('');

    const { fullName, email, password } = this.signupForm.value;

    if (!fullName || !email || !password) return;

    this.authService.signup(email, fullName, password).subscribe({
      next: (response) => {
        this.router.navigate(['/auth/verify-otp'], {
          queryParams: { email, type: 'signup', userId: response.userId },
        });
      },
      error: (err) => {
        this.isLoading.set(false);

        const backendErrors = this.validationService.mapBackendErrorToField(err, {
          email: 'email',
          password: 'password',
          fullName: 'fullName',
        });

        if (backendErrors['email']) {
          this.signupForm.get('email')?.setErrors({ backend: true });
        }
        if (backendErrors['password']) {
          this.signupForm.get('password')?.setErrors({ backend: true });
        }
        if (backendErrors['fullName']) {
          this.signupForm.get('fullName')?.setErrors({ backend: true });
        }

        if (err.status === 409) {
          this.generalError.set(
            'An account with this email already exists. Please sign in instead.',
          );
        } else {
          this.generalError.set(
            err.error?.message || 'An error occurred. Please try again.',
          );
        }
      },
    });
  }
}
