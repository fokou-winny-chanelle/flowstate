import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../../core/services/auth.service';
import { ButtonComponent } from '../../../../shared/ui/button/button.component';
import { InputComponent } from '../../../../shared/ui/input/input.component';

@Component({
  selector: 'fs-signup',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    ButtonComponent,
    InputComponent,
  ],
  template: `
    <div class="signup-page">
      <h2>Create your account</h2>
      <p class="subtitle">Start organizing your busy mind</p>

      <form [formGroup]="signupForm" (ngSubmit)="onSubmit()" class="signup-form">
        <fs-input
          type="text"
          label="Full Name"
          placeholder="John Doe"
          formControlName="fullName"
          [error]="
            signupForm.get('fullName')?.invalid &&
            signupForm.get('fullName')?.touched
              ? 'Name is required'
              : undefined
          "
        ></fs-input>

        <fs-input
          type="email"
          label="Email"
          placeholder="you@example.com"
          formControlName="email"
          [error]="
            signupForm.get('email')?.invalid && signupForm.get('email')?.touched
              ? 'Please enter a valid email'
              : undefined
          "
        ></fs-input>

        <fs-input
          type="password"
          label="Password"
          placeholder="At least 8 characters"
          formControlName="password"
          [error]="
            signupForm.get('password')?.invalid &&
            signupForm.get('password')?.touched
              ? 'Password must be at least 8 characters'
              : undefined
          "
        ></fs-input>

        @if (errorMessage) {
          <div class="error-banner">{{ errorMessage }}</div>
        }

        @if (successMessage) {
          <div class="success-banner">{{ successMessage }}</div>
        }

        <fs-button
          type="submit"
          [disabled]="signupForm.invalid"
          [loading]="isLoading"
          fullWidth
        >
          Create account
        </fs-button>
      </form>

      <div class="login-prompt">
        Already have an account?
        <a routerLink="/auth/login">Sign in</a>
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
        font-weight: 600;
        color: var(--color-text-primary);
        margin: 0 0 var(--space-sm) 0;
        text-align: center;
      }

      .subtitle {
        font-size: var(--font-size-sm);
        color: var(--color-text-secondary);
        text-align: center;
        margin: 0 0 var(--space-xl) 0;
      }

      .signup-form {
        display: flex;
        flex-direction: column;
        gap: var(--space-lg);
      }

      .error-banner {
        padding: var(--space-md);
        background-color: #fee;
        border: 1px solid var(--color-error);
        border-radius: var(--radius-sm);
        color: var(--color-error);
        font-size: var(--font-size-sm);
      }

      .success-banner {
        padding: var(--space-md);
        background-color: #efe;
        border: 1px solid var(--color-success);
        border-radius: var(--radius-sm);
        color: var(--color-success);
        font-size: var(--font-size-sm);
      }

      .login-prompt {
        margin-top: var(--space-xl);
        text-align: center;
        font-size: var(--font-size-sm);
        color: var(--color-text-secondary);
      }

      .login-prompt a {
        color: var(--color-primary);
        font-weight: 600;
        text-decoration: none;
      }

      .login-prompt a:hover {
        text-decoration: underline;
      }
    `,
  ],
})
export class SignupComponent {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);

  signupForm = this.fb.group({
    fullName: ['', [Validators.required]],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(8)]],
  });

  isLoading = false;
  errorMessage = '';
  successMessage = '';

  onSubmit() {
    if (this.signupForm.invalid) return;

    this.isLoading = true;
    this.errorMessage = '';
    this.successMessage = '';

    const { fullName, email, password } = this.signupForm.value;
    if (!fullName || !email || !password) return;

    this.authService.signup({ fullName, email, password }).subscribe({
      next: (response) => {
        this.isLoading = false;
        this.successMessage =
          'Account created! Check your email for verification code.';
        setTimeout(() => {
          this.router.navigate(['/auth/verify-otp'], {
            state: { email, type: 'signup' },
          });
        }, 1500);
      },
      error: (err) => {
        this.isLoading = false;
        this.errorMessage =
          err.error?.message || 'Signup failed. Please try again.';
      },
    });
  }
}
