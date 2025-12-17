import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { ButtonComponent } from '../../shared/ui/button/button.component';

@Component({
  selector: 'flow-app-shell',
  standalone: true,
  imports: [CommonModule, RouterModule, ButtonComponent],
  template: `
    <div class="app-shell">
      <header class="app-header">
        <div class="header-left">
          <h1 class="app-logo">FlowState</h1>
        </div>
        <nav class="header-nav">
          <a routerLink="/today" routerLinkActive="active">Today</a>
          <a routerLink="/projects" routerLinkActive="active">Projects</a>
          <a routerLink="/goals" routerLinkActive="active">Goals</a>
        </nav>
        <div class="header-right">
          <flow-button
            variant="ghost"
            size="sm"
            (clicked)="logout()">
            Logout
          </flow-button>
        </div>
      </header>
      <main class="app-main">
        <router-outlet></router-outlet>
      </main>
    </div>
  `,
  styles: [
    `
      .app-shell {
        display: flex;
        flex-direction: column;
        min-height: 100vh;
        background-color: var(--color-background);
      }

      .app-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: var(--space-md) var(--space-xl);
        background-color: var(--color-surface);
        border-bottom: 1px solid var(--color-muted);
      }

      .app-logo {
        font-size: var(--font-size-xl);
        font-weight: 700;
        color: var(--color-primary);
        margin: 0;
      }

      .header-nav {
        display: flex;
        gap: var(--space-lg);
      }

      .header-nav a {
        padding: var(--space-sm) var(--space-md);
        color: var(--color-text-secondary);
        text-decoration: none;
        border-radius: var(--radius-md);
        transition: all var(--transition-fast);
      }

      .header-nav a:hover,
      .header-nav a.active {
        color: var(--color-primary);
        background-color: var(--color-primary-light);
      }

      .app-main {
        flex: 1;
        padding: var(--space-xl);
        max-width: 1200px;
        width: 100%;
        margin: 0 auto;
      }
    `,
  ],
})
export class AppShellComponent {
  private authService = inject(AuthService);

  logout() {
    this.authService.logout().subscribe();
  }
}

