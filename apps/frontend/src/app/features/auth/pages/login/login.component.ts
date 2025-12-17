import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import {
  FormBuilder,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../../core/services/auth.service';
import { ValidationService } from '../../../../core/services/validation.service';
import { ButtonComponent } from '../../../../shared/ui/button/button.component';
import { FormFieldComponent } from '../../../../shared/ui/form-field/form-field.component';
import { InputComponent } from '../../../../shared/ui/input/input.component';

@Component({
  selector: 'flow-login',
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
    <div class="login-page">
      <h2>Welcome back</h2>
      <p class="subtitle">Sign in to your account</p>

      <form [formGroup]="loginForm" (ngSubmit)="onSubmit()" class="login-form" novalidate>
        <flow-form-field
          label="Email address"
          [required]="true"
          [control]="loginForm.get('email')"
          fieldName="Email address"
          [fieldId]="'login-email'">
          <flow-input
            id="login-email"
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
          [control]="loginForm.get('password')"
          fieldName="Password"
          [fieldId]="'login-password'">
          <flow-input
            id="login-password"
            type="password"
            placeholder="Enter your password"
            formControlName="password"
            [required]="true"
            [showPasswordToggle]="true"
            [error]="getFieldError('password')"
            ariaLabel="Password" />
        </flow-form-field>

        <div class="form-actions">
          <a routerLink="/auth/forgot-password" class="forgot-password-link">
            Forgot password?
          </a>
        </div>

        @if (generalError) {
          <div class="error-banner" role="alert">
            {{ generalError }}
            @if (generalError.includes('not verified')) {
              <button type="button" class="resend-link" (click)="resendVerification()">
                Resend verification email
              </button>
            }
          </div>
        }

        <flow-button
          type="submit"
          variant="solid"
          size="lg"
          [disabled]="loginForm.invalid || isLoading"
          [loading]="isLoading"
          [fullWidth]="true">
          Sign in
        </flow-button>
      </form>

      <div class="auth-footer">
        <p>
          Don't have an account?
          <a routerLink="/auth/signup" class="auth-link">Sign up</a>
        </p>
      </div>
    </div>
  `,
  styles: [
    `
      .login-page {
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

      .login-form {
        display: flex;
        flex-direction: column;
        gap: var(--space-lg);
      }

      .form-actions {
        display: flex;
        justify-content: flex-end;
        margin-top: calc(var(--space-lg) * -1);
      }

      .forgot-password-link {
        font-size: var(--font-size-sm);
        color: var(--color-accent);
        text-decoration: none;
        transition: color var(--transition-fast);
      }

      .forgot-password-link:hover {
        color: var(--color-accent-hover);
        text-decoration: underline;
      }

      .error-banner {
        padding: var(--space-md);
        background-color: var(--color-error-light);
        border: 1px solid var(--color-error);
        border-radius: var(--radius-md);
        color: var(--color-error);
        font-size: var(--font-size-sm);
        font-weight: var(--font-weight-medium);
        display: flex;
        flex-direction: column;
        gap: var(--space-sm);
        align-items: flex-start;
      }

      .resend-link {
        background: none;
        border: none;
        color: var(--color-error);
        text-decoration: underline;
        cursor: pointer;
        font-size: var(--font-size-sm);
        padding: 0;
        margin-top: var(--space-xs);
      }

      .resend-link:hover {
        color: var(--color-error-dark);
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
export class LoginComponent {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private validationService = inject(ValidationService);

  loginForm = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required]],
  });

  isLoading = false;
  generalError = '';

  getFieldError(fieldName: string): string {
    const control = this.loginForm.get(fieldName);
    if (!control) return '';

    if (control.invalid && (control.touched || control.dirty)) {
      return this.validationService.getErrorMessage(
        control,
        fieldName === 'email' ? 'Email address' : 'Password',
      );
    }

    return '';
  }

  onSubmit() {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    this.isLoading = true;
    this.generalError = '';

    const { email, password } = this.loginForm.value;

    if (!email || !password) return;

    this.authService.login(email, password).subscribe({
      next: () => {
        const returnUrl =
          this.route.snapshot.queryParams['returnUrl'] || '/today';
        this.router.navigate([returnUrl]);
      },
      error: (err) => {
        this.isLoading = false;

        const backendErrors = this.validationService.mapBackendErrorToField(err, {
          email: 'email',
          password: 'password',
        });

        if (backendErrors['email']) {
          this.loginForm.get('email')?.setErrors({ backend: true });
        }
        if (backendErrors['password']) {
          this.loginForm.get('password')?.setErrors({ backend: true });
        }

        if (err.status === 401) {
          this.generalError = 'Invalid email or password. Please check your credentials and try again.';
        } else if (err.status === 400 && err.error?.message?.includes('verified')) {
          this.generalError = 'Your email address has not been verified. Please check your inbox for the verification email.';
        } else {
          this.generalError =
            err.error?.message ||
            'An error occurred. Please try again.';
        }
      },
    });
  }

  resendVerification() {
    const email = this.loginForm.get('email')?.value;
    if (!email) return;

    this.authService.sendOtp(email, 'login').subscribe({
      next: () => {
        this.generalError = '';
        this.router.navigate(['/auth/verify-otp'], {
          queryParams: { email, type: 'login' },
        });
      },
      error: (err) => {
        this.generalError = err.error?.message || 'Failed to send verification email.';
      },
    });
  }
}
