import { CommonModule } from '@angular/common';
import {
    ChangeDetectionStrategy,
    Component,
    inject,
    Input,
} from '@angular/core';
import { ValidationService } from '../../../core/services/validation.service';

@Component({
  selector: 'flow-password-strength',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="password-strength" [class]="strengthClass">
      <div class="strength-bars">
        <div
          class="strength-bar"
          [class.active]="strengthLevel >= 1"
          [class.weak]="strength === 'weak'"
          [class.medium]="strength === 'medium'"
          [class.strong]="strength === 'strong'"></div>
        <div
          class="strength-bar"
          [class.active]="strengthLevel >= 2"
          [class.weak]="strength === 'weak'"
          [class.medium]="strength === 'medium'"
          [class.strong]="strength === 'strong'"></div>
        <div
          class="strength-bar"
          [class.active]="strengthLevel >= 3"
          [class.medium]="strength === 'medium'"
          [class.strong]="strength === 'strong'"></div>
        <div
          class="strength-bar"
          [class.active]="strengthLevel >= 4"
          [class.strong]="strength === 'strong'"></div>
      </div>
      @if (showLabel && password) {
        <span class="strength-label">{{ strengthLabel }}</span>
      }
    </div>
  `,
  styles: [
    `
      .password-strength {
        display: flex;
        flex-direction: column;
        gap: var(--space-xs);
        margin-top: var(--space-xs);
      }

      .strength-bars {
        display: flex;
        gap: var(--space-xs);
        height: 4px;
      }

      .strength-bar {
        flex: 1;
        background-color: var(--color-border);
        border-radius: var(--radius-xs);
        transition: all var(--transition-fast);
      }

      .strength-bar.active.weak {
        background-color: var(--color-error);
      }

      .strength-bar.active.medium {
        background-color: var(--color-warning);
      }

      .strength-bar.active.strong {
        background-color: var(--color-success);
      }

      .strength-label {
        font-size: var(--font-size-xs);
        font-weight: var(--font-weight-medium);
        color: var(--color-text-secondary);
      }

      .password-strength.weak .strength-label {
        color: var(--color-error);
      }

      .password-strength.medium .strength-label {
        color: var(--color-warning);
      }

      .password-strength.strong .strength-label {
        color: var(--color-success);
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PasswordStrengthComponent {
  private validationService = inject(ValidationService);
  
  @Input() password = '';
  @Input() showLabel = true;

  get strength(): 'weak' | 'medium' | 'strong' {
    return this.validationService.getPasswordStrength(this.password);
  }

  get strengthLevel(): number {
    if (!this.password) return 0;

    let level = 0;
    const s = this.strength;

    if (s === 'weak') {
      level = this.password.length >= 4 ? 1 : 0;
    } else if (s === 'medium') {
      level = 2;
    } else if (s === 'strong') {
      level = this.password.length >= 12 ? 4 : 3;
    }

    return level;
  }

  get strengthLabel(): string {
    if (!this.password) return '';
    const s = this.strength;
    if (s === 'weak') return 'Weak password';
    if (s === 'medium') return 'Medium strength';
    return 'Strong password';
  }

  get strengthClass(): string {
    return `strength-${this.strength}`;
  }
}
