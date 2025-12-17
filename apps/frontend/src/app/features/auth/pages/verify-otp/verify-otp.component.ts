import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
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
  selector: 'flow-verify-otp',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    ButtonComponent,
    InputComponent,
  ],
  template: `
    <div class="verify-otp-page">
      <h2>Verify your email</h2>
      <p class="subtitle">
        We sent a 6-digit code to <strong>{{ email }}</strong>
      </p>

      <form [formGroup]="otpForm" (ngSubmit)="onSubmit()" class="otp-form">
        <flow-input
          type="text"
          label="Verification Code"
          placeholder="123456"
          formControlName="code"
          [error]="
            otpForm.get('code')?.invalid && otpForm.get('code')?.touched
              ? 'Please enter the 6-digit code'
              : undefined
          "></flow-input>

        @if (errorMessage) {
          <div class="error-banner">{{ errorMessage }}</div>
        }

        <flow-button
          type="submit"
          [disabled]="otpForm.invalid"
          [loading]="isLoading"
          [fullWidth]="true">
          Verify
        </flow-button>
      </form>

      <button
        (click)="resendCode()"
        class="resend-button"
        [disabled]="isResending">
        {{ isResending ? 'Sending...' : 'Resend code' }}
      </button>
    </div>
  `,
  styles: [
    `
      .verify-otp-page {
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

      .otp-form {
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

      .resend-button {
        margin-top: var(--space-lg);
        padding: var(--space-sm);
        background: none;
        border: none;
        color: var(--color-accent);
        font-size: var(--font-size-sm);
        cursor: pointer;
        text-align: center;
        width: 100%;
      }

      .resend-button:hover:not(:disabled) {
        text-decoration: underline;
      }

      .resend-button:disabled {
        opacity: 0.5;
        cursor: not-allowed;
      }
    `,
  ],
})
export class VerifyOtpComponent implements OnInit {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private authService = inject(AuthService);

  email = '';
  otpType: 'signup' | 'forgot-password' = 'signup';

  otpForm = this.fb.group({
    code: ['', [Validators.required, Validators.pattern(/^\d{6}$/)]],
  });

  isLoading = false;
  isResending = false;
  errorMessage = '';

  ngOnInit() {
    const navigation = this.router.getCurrentNavigation();
    this.email = navigation?.extras?.state?.['email'] || '';
    this.otpType = navigation?.extras?.state?.['type'] || 'signup';

    if (!this.email) {
      this.router.navigate(['/auth/login']);
    }
  }

  onSubmit() {
    if (this.otpForm.invalid) return;

    this.isLoading = true;
    this.errorMessage = '';

    const code = this.otpForm.value.code;
    if (!code) return;

    this.authService.verifyOtp(this.email, code, this.otpType).subscribe({
      next: () => {
        if (this.otpType === 'signup') {
          this.router.navigate(['/auth/login']);
        } else {
          this.router.navigate(['/auth/reset-password'], {
            state: { email: this.email, code },
          });
        }
      },
      error: (err) => {
        this.isLoading = false;
        this.errorMessage =
          err.error?.message || 'Invalid code. Please try again.';
      },
    });
  }

  resendCode() {
    this.isResending = true;
    this.authService.sendOtp(this.email, this.otpType).subscribe({
      next: () => {
        this.isResending = false;
      },
      error: () => {
        this.isResending = false;
      },
    });
  }
}

