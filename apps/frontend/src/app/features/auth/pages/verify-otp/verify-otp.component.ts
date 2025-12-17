import { CommonModule } from '@angular/common';
import { Component, inject, OnDestroy, OnInit, signal } from '@angular/core';
import {
    FormBuilder,
    ReactiveFormsModule,
    Validators,
} from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { interval, Subscription } from 'rxjs';
import { AuthService } from '../../../../core/services/auth.service';
import { ValidationService } from '../../../../core/services/validation.service';
import { ButtonComponent } from '../../../../shared/ui/button/button.component';
import { FormFieldComponent } from '../../../../shared/ui/form-field/form-field.component';
import { OtpInputComponent } from '../../../../shared/ui/otp-input/otp-input.component';

@Component({
  selector: 'flow-verify-otp',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    ButtonComponent,
    OtpInputComponent,
    FormFieldComponent,
  ],
  template: `
    <div class="verify-otp-page">
      <h2>Verify your email</h2>
      <p class="subtitle">
        We've sent a verification code to
        <strong>{{ email() }}</strong>
      </p>

      <form [formGroup]="otpForm" (ngSubmit)="onSubmit()" class="verify-otp-form" novalidate>
        <flow-form-field
          label="Verification code"
          [required]="true"
          [control]="otpForm.get('code')"
          fieldName="Verification code"
          [fieldId]="'verify-otp-code'"
          [hint]="'Enter the 6-digit code sent to your email'">
          <flow-otp-input
            id="verify-otp-code"
            formControlName="code"
            [required]="true"
            [error]="getFieldError('code')"
            [disabled]="isLoading()"
            ariaLabel="Verification code" />
        </flow-form-field>

        <div class="timer-section">
          @if (timerSeconds() > 0) {
            <p class="timer-text">
              Resend code in
              <span class="timer-value">{{ formatTimer(timerSeconds()) }}</span>
            </p>
          } @else {
            <button
              type="button"
              class="resend-button"
              (click)="resendCode()"
              [disabled]="isResending()">
              {{ isResending() ? 'Sending...' : "Didn't receive the code? Resend" }}
            </button>
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
          [disabled]="otpForm.invalid || isLoading()"
          [loading]="isLoading()"
          [fullWidth]="true">
          Verify email
        </flow-button>
      </form>

      <div class="auth-footer">
        <p>
          Wrong email?
          <a routerLink="/auth/{{ otpType() === 'signup' ? 'signup' : 'login' }}" class="auth-link">
            Go back
          </a>
        </p>
      </div>
    </div>
  `,
  styles: [
    `
      .verify-otp-page {
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

      .subtitle strong {
        color: var(--color-text-primary);
        font-weight: var(--font-weight-semibold);
      }

      .verify-otp-form {
        display: flex;
        flex-direction: column;
        gap: var(--space-lg);
      }

      .timer-section {
        text-align: center;
        margin-top: calc(var(--space-lg) * -1);
      }

      .timer-text {
        font-size: var(--font-size-sm);
        color: var(--color-text-secondary);
        margin: 0;
      }

      .timer-value {
        font-weight: var(--font-weight-semibold);
        color: var(--color-primary);
      }

      .resend-button {
        background: none;
        border: none;
        color: var(--color-accent);
        font-size: var(--font-size-sm);
        font-weight: var(--font-weight-medium);
        cursor: pointer;
        padding: 0;
        text-decoration: underline;
        transition: color var(--transition-fast);
      }

      .resend-button:hover:not(:disabled) {
        color: var(--color-accent-hover);
      }

      .resend-button:disabled {
        opacity: 0.6;
        cursor: not-allowed;
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
export class VerifyOtpComponent implements OnInit, OnDestroy {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private validationService = inject(ValidationService);

  email = signal<string>('');
  otpType = signal<'signup' | 'login' | 'reset_password'>('signup');
  userId = signal<string | null>(null);
  timerSeconds = signal<number>(0);
  isLoading = signal(false);
  isResending = signal(false);
  generalError = signal('');

  otpForm = this.fb.group({
    code: ['', [Validators.required, Validators.pattern(/^\d{6}$/)]],
  });

  private timerSubscription?: Subscription;
  private readonly RESEND_TIMEOUT = 60;

  ngOnInit() {
    const queryParams = this.route.snapshot.queryParams;
    const emailParam = queryParams['email'];
    const typeParam = queryParams['type'] as 'signup' | 'login' | 'reset_password';
    const userIdParam = queryParams['userId'];

    if (!emailParam || !typeParam) {
      this.router.navigate(['/auth/login']);
      return;
    }

    this.email.set(emailParam);
    this.otpType.set(typeParam || 'signup');
    if (userIdParam) {
      this.userId.set(userIdParam);
    }

    this.startTimer();
  }

  ngOnDestroy() {
    this.timerSubscription?.unsubscribe();
  }

  startTimer() {
    this.timerSeconds.set(this.RESEND_TIMEOUT);
    this.timerSubscription = interval(1000).subscribe(() => {
      const current = this.timerSeconds();
      if (current > 0) {
        this.timerSeconds.set(current - 1);
      } else {
        this.timerSubscription?.unsubscribe();
      }
    });
  }

  formatTimer(seconds: number): string {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }

  getFieldError(fieldName: string): string {
    const control = this.otpForm.get(fieldName);
    if (!control) return '';

    if (control.invalid && (control.touched || control.dirty)) {
      if (control.errors?.['pattern']) {
        return 'Please enter a valid 6-digit code';
      }
      return this.validationService.getErrorMessage(control, 'Verification code');
    }

    return '';
  }

  onSubmit() {
    if (this.otpForm.invalid) {
      this.otpForm.markAllAsTouched();
      return;
    }

    this.isLoading.set(true);
    this.generalError.set('');

    const code = this.otpForm.get('code')?.value;
    if (!code) return;

    this.authService.verifyOtp(this.email(), code, this.otpType()).subscribe({
      next: () => {
        if (this.otpType() === 'signup') {
          this.router.navigate(['/auth/login'], {
            queryParams: { verified: 'true' },
          });
        } else if (this.otpType() === 'login') {
          this.router.navigate(['/today']);
        } else if (this.otpType() === 'reset_password') {
          this.router.navigate(['/auth/reset-password'], {
            queryParams: { email: this.email(), code },
          });
        }
      },
      error: (err) => {
        this.isLoading.set(false);

        if (err.status === 400) {
          this.generalError.set(
            err.error?.message || 'Invalid or expired verification code. Please request a new one.',
          );
          this.otpForm.get('code')?.setErrors({ invalid: true });
        } else {
          this.generalError.set(
            err.error?.message || 'An error occurred. Please try again.',
          );
        }
      },
    });
  }

  resendCode() {
    if (this.isResending() || this.timerSeconds() > 0) return;

    this.isResending.set(true);
    this.generalError.set('');

    this.authService.sendOtp(this.email(), this.otpType()).subscribe({
      next: () => {
        this.isResending.set(false);
        this.startTimer();
        this.otpForm.get('code')?.reset();
      },
      error: (err) => {
        this.isResending.set(false);
        this.generalError.set(
          err.error?.message || 'Failed to send verification code. Please try again.',
        );
      },
    });
  }
}
