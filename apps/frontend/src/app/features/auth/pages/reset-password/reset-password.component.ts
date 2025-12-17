import { CommonModule } from '@angular/common';
import { Component, inject, OnInit, signal } from '@angular/core';
import {
    AbstractControl,
    FormBuilder,
    ReactiveFormsModule,
    ValidationErrors,
    ValidatorFn,
    Validators,
} from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../../core/services/auth.service';
import { ValidationService } from '../../../../core/services/validation.service';
import { ButtonComponent } from '../../../../shared/ui/button/button.component';
import { FormFieldComponent } from '../../../../shared/ui/form-field/form-field.component';
import { InputComponent } from '../../../../shared/ui/input/input.component';
import { OtpInputComponent } from '../../../../shared/ui/otp-input/otp-input.component';
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
  selector: 'flow-reset-password',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    ButtonComponent,
    InputComponent,
    OtpInputComponent,
    FormFieldComponent,
    PasswordStrengthComponent,
  ],
  template: `
    <div class="reset-password-page">
      <h2>Reset your password</h2>
      <p class="subtitle">Enter your verification code and choose a new password</p>

      <form [formGroup]="resetPasswordForm" (ngSubmit)="onSubmit()" class="reset-password-form" novalidate>
        <flow-form-field
          label="Email address"
          [control]="resetPasswordForm.get('email')"
          fieldName="Email address"
          [fieldId]="'reset-password-email'">
          <flow-input
            id="reset-password-email"
            type="email"
            formControlName="email"
            [readonly]="true"
            ariaLabel="Email address" />
        </flow-form-field>

        <flow-form-field
          label="Verification code"
          [required]="true"
          [control]="resetPasswordForm.get('code')"
          fieldName="Verification code"
          [fieldId]="'reset-password-code'"
          [hint]="'Enter the 6-digit code sent to your email'">
          <flow-otp-input
            id="reset-password-code"
            formControlName="code"
            [required]="true"
            [error]="getFieldError('code')"
            [disabled]="isLoading()"
            ariaLabel="Verification code" />
        </flow-form-field>

        <flow-form-field
          label="New password"
          [required]="true"
          [control]="resetPasswordForm.get('password')"
          fieldName="New password"
          [fieldId]="'reset-password-new'"
          [hint]="'At least 8 characters with letters and numbers'">
          <flow-input
            id="reset-password-new"
            type="password"
            placeholder="Enter your new password"
            formControlName="password"
            [required]="true"
            [showPasswordToggle]="true"
            [error]="getFieldError('password')"
            ariaLabel="New password" />
          @if (resetPasswordForm.get('password')?.value) {
            <flow-password-strength
              [password]="resetPasswordForm.get('password')?.value || ''"
              [showLabel]="true" />
          }
        </flow-form-field>

        <flow-form-field
          label="Confirm new password"
          [required]="true"
          [control]="resetPasswordForm.get('confirmPassword')"
          fieldName="Confirm new password"
          [fieldId]="'reset-password-confirm'">
          <flow-input
            id="reset-password-confirm"
            type="password"
            placeholder="Confirm your new password"
            formControlName="confirmPassword"
            [required]="true"
            [showPasswordToggle]="true"
            [error]="getFieldError('confirmPassword')"
            ariaLabel="Confirm new password" />
        </flow-form-field>

        @if (generalError()) {
          <div class="error-banner" role="alert">
            {{ generalError() }}
          </div>
        }

        <flow-button
          type="submit"
          variant="solid"
          size="lg"
          [disabled]="resetPasswordForm.invalid || isLoading()"
          [loading]="isLoading()"
          [fullWidth]="true">
          Reset password
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
      .reset-password-page {
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

      .reset-password-form {
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
export class ResetPasswordComponent implements OnInit {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private validationService = inject(ValidationService);

  email = signal<string>('');
  otpCode = signal<string>('');

  resetPasswordForm = this.fb.group(
    {
      email: [''],
      code: ['', [Validators.required, Validators.pattern(/^\d{6}$/)]],
      password: [
        '',
        [
          Validators.required,
          Validators.minLength(8),
          this.validationService.passwordStrengthValidator(),
        ],
      ],
      confirmPassword: ['', [Validators.required]],
    },
    { validators: passwordMatchValidator() },
  );

  isLoading = signal(false);
  generalError = signal('');

  ngOnInit() {
    const queryParams = this.route.snapshot.queryParams;
    const emailParam = queryParams['email'];
    const codeParam = queryParams['code'];

    if (!emailParam) {
      this.router.navigate(['/auth/forgot-password']);
      return;
    }

    this.email.set(emailParam);
    this.resetPasswordForm.patchValue({ email: emailParam });

    if (codeParam) {
      this.otpCode.set(codeParam);
      this.resetPasswordForm.patchValue({ code: codeParam });
    }
  }

  getFieldError(fieldName: string): string {
    const control = this.resetPasswordForm.get(fieldName);
    if (!control) return '';

    if (control.invalid && (control.touched || control.dirty)) {
      if (fieldName === 'confirmPassword' && control.errors?.['mustMatch']) {
        return 'Passwords do not match';
      }

      if (fieldName === 'code' && control.errors?.['pattern']) {
        return 'Please enter a valid 6-digit code';
      }

      return this.validationService.getErrorMessage(
        control,
        fieldName === 'code'
          ? 'Verification code'
          : fieldName === 'password'
            ? 'New password'
            : 'Confirm new password',
      );
    }

    return '';
  }

  onSubmit() {
    if (this.resetPasswordForm.invalid) {
      this.resetPasswordForm.markAllAsTouched();
      return;
    }

    this.isLoading.set(true);
    this.generalError.set('');

    const { code, password } = this.resetPasswordForm.value;
    if (!code || !password) return;

    this.authService.resetPassword(this.email(), code, password).subscribe({
      next: () => {
        this.router.navigate(['/auth/login'], {
          queryParams: { passwordReset: 'true' },
        });
      },
      error: (err) => {
        this.isLoading.set(false);

        if (err.status === 400) {
          if (err.error?.message?.includes('code') || err.error?.message?.includes('expired')) {
            this.generalError.set(
              'Invalid or expired verification code. Please request a new one.',
            );
            this.resetPasswordForm.get('code')?.setErrors({ invalid: true });
          } else {
            this.generalError.set(
              err.error?.message || 'Failed to reset password. Please try again.',
            );
          }
        } else {
          this.generalError.set(
            err.error?.message || 'An error occurred. Please try again.',
          );
        }
      },
    });
  }
}
