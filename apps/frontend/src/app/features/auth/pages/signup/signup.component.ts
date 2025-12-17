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
  selector: 'flow-signup',
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
      <p class="subtitle">Start organizing your tasks and achieving your goals</p>

      <form [formGroup]="signupForm" (ngSubmit)="onSubmit()" class="signup-form">
        <flow-input
          type="text"
          label="Full name"
          placeholder="John Doe"
          formControlName="fullName"
          [error]="
            signupForm.get('fullName')?.invalid &&
            signupForm.get('fullName')?.touched
              ? 'Name is required'
              : undefined
          "></flow-input>

        <flow-input
          type="email"
          label="Email address"
          placeholder="you@example.com"
          formControlName="email"
          [error]="
            signupForm.get('email')?.invalid && signupForm.get('email')?.touched
              ? 'Please enter a valid email'
              : undefined
          "></flow-input>

        <flow-input
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
          [hint]="
            signupForm.get('password')?.value &&
            (signupForm.get('password')?.value?.length ?? 0) < 8
              ? 'Password must be at least 8 characters'
              : ''
          "></flow-input>

        @if (errorMessage) {
          <div class="error-banner">{{ errorMessage }}</div>
        }

        <flow-button
          type="submit"
          [disabled]="signupForm.invalid"
          [loading]="isLoading"
          [fullWidth]="true">
          Create account
        </flow-button>
      </form>

      <div class="auth-links">
        <span>Already have an account? <a routerLink="/auth/login">Sign in</a></span>
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

      .auth-links {
        margin-top: var(--space-xl);
        text-align: center;
        font-size: var(--font-size-sm);
        color: var(--color-text-secondary);
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

  onSubmit() {
    if (this.signupForm.invalid) return;

    this.isLoading = true;
    this.errorMessage = '';

    const { email, fullName, password } = this.signupForm.value;
    if (!email || !fullName || !password) return;

    this.authService.signup(email, fullName, password).subscribe({
      next: () => {
        this.router.navigate(['/auth/verify-otp'], {
          state: { email: email, type: 'signup' },
        });
      },
      error: (err) => {
        this.isLoading = false;
        this.errorMessage =
          err.error?.message || 'Failed to create account. Please try again.';
      },
    });
  }
}

