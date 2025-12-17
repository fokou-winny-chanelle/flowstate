import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import {
    FormBuilder,
    ReactiveFormsModule,
    Validators,
} from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../../core/services/auth.service';
import { ButtonComponent } from '../../../../shared/ui/button/button.component';
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
  ],
  template: `
    <div class="login-page">
      <h2>Welcome back</h2>
      <p class="subtitle">Sign in to continue to FlowState</p>

      <form [formGroup]="loginForm" (ngSubmit)="onSubmit()" class="login-form">
        <flow-input
          type="email"
          label="Email address"
          placeholder="you@example.com"
          formControlName="email"
          [error]="
            loginForm.get('email')?.invalid && loginForm.get('email')?.touched
              ? 'Please enter a valid email'
              : undefined
          "></flow-input>

        <flow-input
          type="password"
          label="Password"
          placeholder="Enter your password"
          formControlName="password"
          [error]="
            loginForm.get('password')?.invalid &&
            loginForm.get('password')?.touched
              ? 'Password is required'
              : undefined
          "></flow-input>

        @if (errorMessage) {
          <div class="error-banner">{{ errorMessage }}</div>
        }

        <flow-button
          type="submit"
          [disabled]="loginForm.invalid"
          [loading]="isLoading"
          [fullWidth]="true">
          Sign in
        </flow-button>
      </form>

      <div class="auth-links">
        <a routerLink="/auth/forgot-password">Forgot password?</a>
        <span>Don't have an account? <a routerLink="/auth/signup">Sign up</a></span>
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
        margin: 0 0 var(--space-sm) 0;
        text-align: center;
      }

      .subtitle {
        font-size: var(--font-size-sm);
        color: var(--color-text-secondary);
        text-align: center;
        margin: 0 0 var(--space-xl) 0;
      }

      .login-form {
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

      .auth-links {
        margin-top: var(--space-xl);
        display: flex;
        flex-direction: column;
        gap: var(--space-sm);
        text-align: center;
        font-size: var(--font-size-sm);
      }

      .auth-links a {
        color: var(--color-accent);
        text-decoration: none;
      }

      .auth-links a:hover {
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
    password: ['', [Validators.required]],
  });

  isLoading = false;
  errorMessage = '';

  onSubmit() {
    if (this.loginForm.invalid) return;

    this.isLoading = true;
    this.errorMessage = '';

    const { email, password } = this.loginForm.value;

    if (!email || !password) return;
    this.authService.login(email, password).subscribe({
      next: () => {
        const returnUrl =
          this.router.parseUrl(this.router.url).queryParams['returnUrl'] ||
          '/today';
        this.router.navigate([returnUrl]);
      },
      error: (err) => {
        this.isLoading = false;
        this.errorMessage =
          err.error?.message || 'Invalid email or password. Please try again.';
      },
    });
  }
}

