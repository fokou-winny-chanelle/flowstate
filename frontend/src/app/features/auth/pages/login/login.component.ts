import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../../core/services/auth.service';
import { ButtonComponent } from '../../../../shared/ui/button/button.component';
import { InputComponent } from '../../../../shared/ui/input/input.component';

@Component({
  selector: 'fs-login',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    ButtonComponent,
    InputComponent,
  ],
  template: `
    <div class="login-page">
      <h2>Welcome back</h2>

      <form [formGroup]="loginForm" (ngSubmit)="onSubmit()" class="login-form">
        <fs-input
          type="email"
          label="Email"
          placeholder="you@example.com"
          formControlName="email"
          [error]="
            loginForm.get('email')?.invalid && loginForm.get('email')?.touched
              ? 'Please enter a valid email'
              : undefined
          "
        ></fs-input>

        <fs-input
          type="password"
          label="Password"
          placeholder="Enter your password"
          formControlName="password"
          [error]="
            loginForm.get('password')?.invalid &&
            loginForm.get('password')?.touched
              ? 'Password is required'
              : undefined
          "
        ></fs-input>

        <a routerLink="/auth/forgot-password" class="forgot-link"
          >Forgot password?</a
        >

        @if (errorMessage) {
          <div class="error-banner">{{ errorMessage }}</div>
        }

        <fs-button
          type="submit"
          [disabled]="loginForm.invalid"
          [loading]="isLoading"
          fullWidth
        >
          Sign in
        </fs-button>
      </form>

      <div class="signup-prompt">
        Don't have an account?
        <a routerLink="/auth/signup">Sign up</a>
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
        font-weight: 600;
        color: var(--color-text-primary);
        margin: 0 0 var(--space-xl) 0;
        text-align: center;
      }

      .login-form {
        display: flex;
        flex-direction: column;
        gap: var(--space-lg);
      }

      .forgot-link {
        align-self: flex-end;
        font-size: var(--font-size-sm);
        color: var(--color-accent);
        text-decoration: none;
      }

      .forgot-link:hover {
        text-decoration: underline;
      }

      .error-banner {
        padding: var(--space-md);
        background-color: #fee;
        border: 1px solid var(--color-error);
        border-radius: var(--radius-sm);
        color: var(--color-error);
        font-size: var(--font-size-sm);
      }

      .signup-prompt {
        margin-top: var(--space-xl);
        text-align: center;
        font-size: var(--font-size-sm);
        color: var(--color-text-secondary);
      }

      .signup-prompt a {
        color: var(--color-primary);
        font-weight: 600;
        text-decoration: none;
      }

      .signup-prompt a:hover {
        text-decoration: underline;
      }
    `,
  ],
})
export class LoginComponent {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);

  loginForm = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(8)]],
  });

  isLoading = false;
  errorMessage = '';

  onSubmit() {
    if (this.loginForm.invalid) return;

    this.isLoading = true;
    this.errorMessage = '';

    const { email, password } = this.loginForm.value;
    if (!email || !password) return;

    this.authService.login({ email, password }).subscribe({
      next: () => {
        this.router.navigate(['/today']);
      },
      error: (err) => {
        this.isLoading = false;
        this.errorMessage =
          err.error?.message || 'Login failed. Please try again.';
      },
    });
  }
}
