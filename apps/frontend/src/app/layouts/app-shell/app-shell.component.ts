import { CommonModule } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { NavigationService } from '../../core/services/navigation.service';
import { BadgeComponent } from '../../shared/ui/badge/badge.component';
import { ButtonComponent } from '../../shared/ui/button/button.component';
import { LogoComponent } from '../../shared/ui/logo/logo.component';

@Component({
  selector: 'flow-app-shell',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    LogoComponent,
    ButtonComponent,
    BadgeComponent,
  ],
  template: `
    <div
      class="app-shell"
      [class.sidebar-collapsed]="sidebarCollapsed()"
      [class.sidebar-mobile-open]="mobileSidebarOpen()">
      <aside class="sidebar" [class.collapsed]="sidebarCollapsed()">
        <div class="sidebar-header">
          <div class="logo-container">
            <flow-logo size="md" [clickable]="true"></flow-logo>
          </div>
          @if (sidebarCollapsed()) {
            <button
              type="button"
              class="expand-button"
              (click)="toggleSidebar()"
              [attr.aria-label]="'Expand sidebar'"
              title="Expand sidebar">
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round">
                <polyline points="9 18 15 12 9 6"></polyline>
              </svg>
            </button>
          }
        </div>

        <nav class="sidebar-nav">
          @for (item of navItems(); track item.route) {
            <a
              [routerLink]="item.route"
              [routerLinkActive]="'active'"
              [routerLinkActiveOptions]="{ exact: item.exact || false }"
              class="nav-item"
              [attr.aria-label]="item.label"
              [title]="sidebarCollapsed() ? item.label : ''"
              (click)="onNavClick()">
              <span class="nav-icon">
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round">
                  @switch (item.icon) {
                    @case ('calendar') {
                      <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                      <line x1="16" y1="2" x2="16" y2="6"></line>
                      <line x1="8" y1="2" x2="8" y2="6"></line>
                      <line x1="3" y1="10" x2="21" y2="10"></line>
                    }
                    @case ('folder') {
                      <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path>
                    }
                    @case ('target') {
                      <circle cx="12" cy="12" r="10"></circle>
                      <circle cx="12" cy="12" r="6"></circle>
                      <circle cx="12" cy="12" r="2"></circle>
                    }
                    @case ('repeat') {
                      <polyline points="17 1 21 5 17 9"></polyline>
                      <path d="M3 11V9a4 4 0 0 1 4-4h14"></path>
                      <polyline points="7 23 3 19 7 15"></polyline>
                      <path d="M21 13v2a4 4 0 0 1-4 4H3"></path>
                    }
                    @case ('timer') {
                      <circle cx="12" cy="12" r="10"></circle>
                      <polyline points="12 6 12 12 16 14"></polyline>
                    }
                  }
                </svg>
              </span>
              @if (!sidebarCollapsed()) {
                <span class="nav-label">{{ item.label }}</span>
                @if (item.badge !== null && item.badge !== undefined && item.badge > 0) {
                  <flow-badge variant="primary" size="sm" class="nav-badge">
                    {{ item.badge }}
                  </flow-badge>
                }
              }
            </a>
          }
        </nav>

        <div class="sidebar-footer">
          <div class="user-profile" [class.collapsed]="sidebarCollapsed()">
            <div class="user-avatar">
              {{ userInitials() }}
            </div>
            @if (!sidebarCollapsed()) {
              <div class="user-info">
                <p class="user-name">{{ userName() }}</p>
                <p class="user-email">{{ userEmail() }}</p>
              </div>
            }
          </div>
          <flow-button
            variant="ghost"
            size="sm"
            [iconOnly]="sidebarCollapsed()"
            [fullWidth]="!sidebarCollapsed()"
            (clicked)="toggleSidebar()"
            [ariaLabel]="sidebarCollapsed() ? 'Expand sidebar' : 'Collapse sidebar'"
            class="collapse-button">
            @if (sidebarCollapsed()) {
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round">
                <polyline points="9 18 15 12 9 6"></polyline>
              </svg>
            } @else {
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round">
                <polyline points="15 18 9 12 15 6"></polyline>
              </svg>
            }
            @if (!sidebarCollapsed()) {
              <span>Collapse</span>
            }
          </flow-button>
          <flow-button
            variant="ghost"
            size="sm"
            [iconOnly]="sidebarCollapsed()"
            [fullWidth]="!sidebarCollapsed()"
            (clicked)="logout()"
            [ariaLabel]="'Logout'"
            class="logout-button">
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
              <polyline points="16 17 21 12 16 7"></polyline>
              <line x1="21" y1="12" x2="9" y2="12"></line>
            </svg>
            @if (!sidebarCollapsed()) {
              <span>Logout</span>
            }
          </flow-button>
        </div>
      </aside>

      <div class="app-content">
        <header class="app-header">
          <div class="header-left">
            <button
              type="button"
              class="mobile-menu-button"
              (click)="toggleMobileSidebar()"
              [attr.aria-label]="'Toggle menu'">
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round">
                <line x1="3" y1="12" x2="21" y2="12"></line>
                <line x1="3" y1="6" x2="21" y2="6"></line>
                <line x1="3" y1="18" x2="21" y2="18"></line>
              </svg>
            </button>
          </div>
          <div class="header-right">
            <flow-button
              variant="ghost"
              size="sm"
              [iconOnly]="true"
              [ariaLabel]="'Notifications'"
              class="notifications-button">
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round">
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
                <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
              </svg>
            </flow-button>
          </div>
        </header>

        <main class="app-main">
          <router-outlet></router-outlet>
        </main>
      </div>

      @if (mobileSidebarOpen()) {
        <div class="mobile-overlay" (click)="closeMobileSidebar()"></div>
      }
    </div>
  `,
  styles: [
    `
      .app-shell {
        display: flex;
        min-height: 100vh;
        background-color: var(--color-background);
        position: relative;
      }

      .app-shell.sidebar-mobile-open .sidebar {
        transform: translateX(0);
      }

      .sidebar {
        width: 260px;
        background-color: var(--color-surface);
        border-right: 1px solid var(--color-border);
        display: flex;
        flex-direction: column;
        transition: width var(--transition-normal);
        position: fixed;
        left: 0;
        top: 0;
        bottom: 0;
        z-index: 100;
        overflow-y: auto;
        overflow-x: hidden;
      }

      .sidebar.collapsed {
        width: 72px;
      }

      .sidebar-header {
        display: flex;
        align-items: center;
        justify-content: center;
        padding: var(--space-lg) var(--space-md);
        border-bottom: 1px solid var(--color-border);
        min-height: 64px;
        position: relative;
        overflow: visible;
      }

      .logo-container {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 100%;
        height: 100%;
        padding: var(--space-sm);
        overflow: visible;
        box-sizing: border-box;
      }

      .sidebar-header flow-logo {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 100%;
        max-width: 100%;
      }

      .sidebar-header flow-logo .logo {
        max-width: 100%;
        width: 100%;
        display: flex;
        justify-content: center;
        align-items: center;
      }

      .sidebar-header flow-logo .logo-image {
        width: auto;
        max-width: 100%;
        max-height: 51px;
        height: auto;
        object-fit: contain;
        object-position: center;
        image-rendering: -webkit-optimize-contrast;
        image-rendering: crisp-edges;
      }

      .expand-button {
        position: absolute;
        top: 50%;
        right: var(--space-xs);
        transform: translateY(-50%);
        display: flex;
        align-items: center;
        justify-content: center;
        width: 32px;
        height: 32px;
        padding: 0;
        background-color: var(--color-surface);
        border: 1px solid var(--color-border);
        border-radius: var(--radius-md);
        cursor: pointer;
        color: var(--color-text-secondary);
        transition: all var(--transition-fast);
        z-index: 10;
      }

      .expand-button:hover {
        background-color: var(--color-background);
        color: var(--color-text-primary);
        border-color: var(--color-primary);
      }

      .expand-button:active {
        transform: translateY(-50%) scale(0.95);
      }

      .sidebar.collapsed .sidebar-header {
        padding: var(--space-lg) var(--space-xs);
        min-height: 64px;
      }

      .sidebar.collapsed .logo-container {
        padding: var(--space-sm);
      }

      .sidebar.collapsed .sidebar-header flow-logo .logo-image {
        max-height: 41px;
      }

      .sidebar.collapsed .sidebar-header flow-logo.size-md .logo-image {
        max-height: 51px;
      }


      .sidebar-nav {
        flex: 1;
        padding: var(--space-md);
        display: flex;
        flex-direction: column;
        gap: var(--space-xs);
        overflow-y: auto;
      }

      .nav-item {
        display: flex;
        align-items: center;
        gap: var(--space-md);
        padding: var(--space-sm) var(--space-md);
        color: var(--color-text-secondary);
        text-decoration: none;
        border-radius: var(--radius-md);
        transition: all var(--transition-fast);
        position: relative;
        white-space: nowrap;
      }

      .nav-item:hover {
        background-color: var(--color-muted);
        color: var(--color-text-primary);
      }

      .nav-item.active {
        background-color: var(--color-primary-light);
        color: var(--color-primary);
        font-weight: var(--font-weight-semibold);
      }

      .nav-item.active::before {
        content: '';
        position: absolute;
        left: 0;
        top: 50%;
        transform: translateY(-50%);
        width: 3px;
        height: 60%;
        background-color: var(--color-primary);
        border-radius: 0 var(--radius-sm) var(--radius-sm) 0;
      }

      .nav-icon {
        display: flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
        width: 20px;
        height: 20px;
      }

      .nav-label {
        flex: 1;
        font-size: var(--font-size-sm);
      }

      .sidebar.collapsed .nav-label {
        opacity: 0;
        width: 0;
        overflow: hidden;
      }

      .nav-badge {
        margin-left: auto;
      }

      .sidebar.collapsed .nav-badge {
        display: none;
      }

      .sidebar-footer {
        padding: var(--space-md);
        border-top: 1px solid var(--color-border);
        display: flex;
        flex-direction: column;
        gap: var(--space-sm);
      }

      .user-profile {
        display: flex;
        align-items: center;
        gap: var(--space-md);
        padding: var(--space-sm);
        border-radius: var(--radius-md);
        transition: all var(--transition-fast);
      }

      .user-profile.collapsed {
        justify-content: center;
      }

      .user-avatar {
        width: 40px;
        height: 40px;
        border-radius: var(--radius-full);
        background-color: var(--color-primary);
        color: var(--color-text-inverse);
        display: flex;
        align-items: center;
        justify-content: center;
        font-weight: var(--font-weight-semibold);
        font-size: var(--font-size-sm);
        flex-shrink: 0;
      }

      .user-info {
        flex: 1;
        min-width: 0;
      }

      .sidebar.collapsed .user-info {
        opacity: 0;
        width: 0;
        overflow: hidden;
      }

      .user-name {
        margin: 0;
        font-size: var(--font-size-sm);
        font-weight: var(--font-weight-semibold);
        color: var(--color-text-primary);
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }

      .user-email {
        margin: 0;
        font-size: var(--font-size-xs);
        color: var(--color-text-secondary);
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }

      .collapse-button,
      .logout-button {
        justify-content: flex-start;
      }

      .app-content {
        flex: 1;
        display: flex;
        flex-direction: column;
        margin-left: 260px;
        transition: margin-left var(--transition-normal);
        min-width: 0;
      }

      .app-shell.sidebar-collapsed .app-content {
        margin-left: 72px;
      }

      .app-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: var(--space-md) var(--space-xl);
        background-color: var(--color-surface);
        border-bottom: 1px solid var(--color-border);
        min-height: 64px;
        position: sticky;
        top: 0;
        z-index: 10;
      }

      .mobile-menu-button {
        display: none;
        background: none;
        border: none;
        padding: var(--space-sm);
        cursor: pointer;
        color: var(--color-text-primary);
        border-radius: var(--radius-sm);
        transition: background-color var(--transition-fast);
      }

      .mobile-menu-button:hover {
        background-color: var(--color-muted);
      }

      .header-right {
        display: flex;
        align-items: center;
        gap: var(--space-sm);
      }

      .app-main {
        flex: 1;
        padding: var(--space-xl);
        overflow-y: auto;
      }

      .mobile-overlay {
        display: none;
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background-color: rgba(0, 0, 0, 0.5);
        z-index: 99;
      }

      @media (max-width: 1024px) {
        .sidebar {
          transform: translateX(-100%);
        }

        .app-shell.sidebar-mobile-open .sidebar {
          transform: translateX(0);
        }

        .app-content {
          margin-left: 0;
        }

        .mobile-menu-button {
          display: block;
        }

        .mobile-overlay {
          display: block;
        }
      }

      @media (max-width: 768px) {
        .app-main {
          padding: var(--space-md);
        }
      }
    `,
  ],
})
export class AppShellComponent {
  private authService = inject(AuthService);
  private router = inject(Router);
  private navigationService = inject(NavigationService);

  sidebarCollapsed = signal(false);
  mobileSidebarOpen = signal(false);
  navItems = this.navigationService.navItems;

  user = computed(() => this.authService.currentUser());

  userName = computed(() => {
    const u = this.user();
    return u?.fullName || u?.email?.split('@')[0] || 'User';
  });

  userEmail = computed(() => {
    const u = this.user();
    return u?.email || '';
  });

  userInitials = computed(() => {
    const name = this.userName();
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  });

  constructor() {
    if (typeof window !== 'undefined') {
      const checkMobile = () => {
        if (window.innerWidth <= 1024) {
          this.mobileSidebarOpen.set(false);
        }
      };
      window.addEventListener('resize', checkMobile);
      checkMobile();
    }
  }

  toggleSidebar() {
    if (window.innerWidth > 1024) {
      this.sidebarCollapsed.update((v) => !v);
    } else {
      this.toggleMobileSidebar();
    }
  }

  toggleMobileSidebar() {
    this.mobileSidebarOpen.update((v) => !v);
  }

  closeMobileSidebar() {
    this.mobileSidebarOpen.set(false);
  }

  onNavClick() {
    if (window.innerWidth <= 1024) {
      this.closeMobileSidebar();
    }
  }

  logout() {
    this.authService.logout().subscribe({
      next: () => {
        this.router.navigate(['/auth/login']);
      },
    });
  }
}
