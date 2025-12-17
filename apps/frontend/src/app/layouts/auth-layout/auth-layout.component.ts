import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { LogoComponent } from '../../shared/ui/logo/logo.component';

@Component({
  selector: 'flow-auth-layout',
  standalone: true,
  imports: [CommonModule, RouterModule, LogoComponent],
  template: `
    <div class="auth-layout">
      <div class="auth-content">
        <div class="auth-header">
          <flow-logo size="2xl" [clickable]="false"></flow-logo>
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
        max-width: 480px;
        background-color: var(--color-surface);
        border-radius: var(--radius-xl);
        padding: var(--space-3xl) var(--space-2xl);
        box-shadow: var(--shadow-lg);
        overflow: visible;
      }

      .auth-header {
        text-align: center;
        margin-bottom: var(--space-3xl);
        padding: 0 var(--space-md);
      }

      .auth-header flow-logo {
        display: flex;
        justify-content: center;
        align-items: center;
        margin-bottom: var(--space-2xl);
        width: 100%;
      }

      .auth-header flow-logo .logo {
        max-width: 100%;
        width: 100%;
        display: flex;
        justify-content: center;
      }

      .auth-header flow-logo .logo-image {
        width: auto;
        max-width: 100%;
        height: auto;
        max-height: 220px;
        object-fit: contain;
        image-rendering: -webkit-optimize-contrast;
        image-rendering: crisp-edges;
        image-rendering: high-quality;
      }
    `,
  ],
})
export class AuthLayoutComponent {}
