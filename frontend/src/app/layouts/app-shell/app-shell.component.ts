import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'fs-app-shell',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="app-shell">
      <header class="app-header">
        <div class="header-left">
          <span class="app-logo">FlowState</span>
        </div>
        <div class="header-center">
          <!-- Date picker, view toggle, etc -->
        </div>
        <div class="header-right">
          <!-- Search, notifications, user menu -->
        </div>
      </header>

      <nav class="app-nav">
        <a routerLink="/today" routerLinkActive="active" class="nav-link">
          <span>Today</span>
        </a>
        <a routerLink="/projects" routerLinkActive="active" class="nav-link">
          <span>Projects</span>
        </a>
        <a routerLink="/goals" routerLinkActive="active" class="nav-link">
          <span>Goals</span>
        </a>
        <a routerLink="/habits" routerLinkActive="active" class="nav-link">
          <span>Habits</span>
        </a>
      </nav>

      <main class="app-content">
        <router-outlet></router-outlet>
      </main>
    </div>
  `,
  styles: [
    `
      .app-shell {
        display: flex;
        flex-direction: column;
        height: 100vh;
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
        font-weight: 600;
        color: var(--color-primary);
      }

      .app-nav {
        display: flex;
        gap: var(--space-md);
        padding: var(--space-md) var(--space-xl);
        background-color: var(--color-surface);
        border-bottom: 1px solid var(--color-muted);
      }

      .nav-link {
        padding: var(--space-sm) var(--space-md);
        border-radius: var(--radius-full);
        color: var(--color-text-secondary);
        text-decoration: none;
        transition: all var(--transition-fast);
      }

      .nav-link:hover {
        background-color: var(--color-primary-light);
        color: var(--color-primary-dark);
      }

      .nav-link.active {
        background-color: var(--color-primary);
        color: white;
      }

      .app-content {
        flex: 1;
        overflow: auto;
        padding: var(--space-xl);
      }
    `,
  ],
})
export class AppShellComponent {}
