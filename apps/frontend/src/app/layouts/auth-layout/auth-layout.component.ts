import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'flow-auth-layout',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="auth-layout">
      <div class="auth-content">
        <div class="auth-header">
          <h1 class="logo">FlowState</h1>
          <p class="tagline">The calm place for your busy mind</p>
        </div>
        <router-outlet></router-outlet>
      </div>
    </div>
  `,
  styles: [
    `
      .auth-layout {
        display: flex;
        align-items: center;
        justify-content: center;
        min-height: 100vh;
        background: linear-gradient(
          135deg,
          var(--color-primary-light) 0%,
          var(--color-background) 100%
        );
        padding: var(--space-lg);
      }

      .auth-content {
        width: 100%;
        max-width: 400px;
        background-color: var(--color-surface);
        border-radius: var(--radius-xl);
        padding: var(--space-2xl);
        box-shadow: var(--shadow-lg);
      }

      .auth-header {
        text-align: center;
        margin-bottom: var(--space-2xl);
      }

      .logo {
        font-size: var(--font-size-3xl);
        font-weight: 700;
        color: var(--color-primary);
        margin: 0 0 var(--space-sm) 0;
      }

      .tagline {
        font-size: var(--font-size-sm);
        color: var(--color-text-secondary);
        margin: 0;
      }
    `,
  ],
})
export class AuthLayoutComponent {}

