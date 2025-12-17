import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import {
    FormBuilder,
    ReactiveFormsModule,
    Validators,
} from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../../core/services/auth.service';
import { ValidationService } from '../../../../core/services/validation.service';
import { ButtonComponent } from '../../../../shared/ui/button/button.component';
import { FormFieldComponent } from '../../../../shared/ui/form-field/form-field.component';
import { InputComponent } from '../../../../shared/ui/input/input.component';

@Component({
  selector: 'flow-forgot-password',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    ButtonComponent,
    InputComponent,
    FormFieldComponent,
  ],
  template: `
    <div class="forgot-password-page">
      <h2>Reset your password</h2>
      <p class="subtitle">
        Enter your email address and we'll send you a verification code to reset your password.
      </p>

      <form [formGroup]="forgotPasswordForm" (ngSubmit)="onSubmit()" class="forgot-password-form" novalidate>
        <flow-form-field
          label="Email address"
          [required]="true"
          [control]="forgotPasswordForm.get('email')"
          fieldName="Email address"
          [fieldId]="'forgot-password-email'">
          <flow-input
            id="forgot-password-email"
            type="email"
            placeholder="you@example.com"
            formControlName="email"
            [required]="true"
            [error]="getFieldError('email')"
            ariaLabel="Email address" />
        </flow-form-field>

        @if (generalError()) {
          <div class="error-banner" role="alert">
            {{ generalError() }}
          </div>
        }

        @if (successMessage()) {
          <div class="success-banner" role="alert">
            {{ successMessage() }}
          </div>
        }

        <flow-button
          type="submit"
          variant="solid"
          size="lg"
          [disabled]="forgotPasswordForm.invalid || isLoading()"
          [loading]="isLoading()"
          [fullWidth]="true">
          Send verification code
        </flow-button>
      </form>

      <div class="auth-footer">
        <p>
          Remember your password?
          <a routerLink="/auth/login" class="auth-link">Sign in</a>
        </p>
      </div>
    </div>
  `,
  styles: [
    `
      .forgot-password-page {
        width: 100%;
      }

      h2 {
        font-size: var(--font-size-2xl);
        font-weight: var(--font-weight-bold);
        color: var(--color-text-primary);
        margin: 0 0 var(--space-xs) 0;
        text-align: center;
      }

      .subtitle {
        font-size: var(--font-size-sm);
        color: var(--color-text-secondary);
        text-align: center;
        margin: 0 0 var(--space-2xl) 0;
        line-height: var(--line-height-relaxed);
      }

      .forgot-password-form {
        display: flex;
        flex-direction: column;
        gap: var(--space-lg);
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

      .success-banner {
        padding: var(--space-md);
        background-color: var(--color-success-light);
        border: 1px solid var(--color-success);
        border-radius: var(--radius-md);
        color: var(--color-success);
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
export class ForgotPasswordComponent {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);
  private validationService = inject(ValidationService);

  forgotPasswordForm = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
  });

  isLoading = signal(false);
  generalError = signal('');
  successMessage = signal('');

  getFieldError(fieldName: string): string {
    const control = this.forgotPasswordForm.get(fieldName);
    if (!control) return '';

    if (control.invalid && (control.touched || control.dirty)) {
      return this.validationService.getErrorMessage(control, 'Email address');
    }

    return '';
  }

  onSubmit() {
    if (this.forgotPasswordForm.invalid) {
      this.forgotPasswordForm.markAllAsTouched();
      return;
    }

    this.isLoading.set(true);
    this.generalError.set('');
    this.successMessage.set('');

    const email = this.forgotPasswordForm.get('email')?.value;
    if (!email) return;

    this.authService.sendOtp(email, 'reset_password').subscribe({
      next: () => {
        this.isLoading.set(false);
        this.successMessage.set('Verification code sent! Redirecting...');
        setTimeout(() => {
          this.router.navigate(['/auth/verify-otp'], {
            queryParams: { email, type: 'reset_password' },
          });
        }, 1500);
      },
      error: (err) => {
        this.isLoading.set(false);

        const backendErrors = this.validationService.mapBackendErrorToField(err, {
          email: 'email',
        });

        if (backendErrors['email']) {
          this.forgotPasswordForm.get('email')?.setErrors({ backend: true });
        }

        if (err.status === 404) {
          this.generalError.set(
            'No account found with this email address. Please check and try again.',
          );
        } else {
          this.generalError.set(
            err.error?.message || 'Failed to send verification code. Please try again.',
          );
        }
      },
    });
  }
}
