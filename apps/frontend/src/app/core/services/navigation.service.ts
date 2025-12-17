import { inject, Injectable, signal } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs';

export interface NavItem {
  label: string;
  route: string;
  icon?: string;
  badge?: number | null;
  exact?: boolean;
}

@Injectable({
  providedIn: 'root',
})
export class NavigationService {
  private router = inject(Router);
  
  activeRoute = signal<string>('');
  navItems = signal<NavItem[]>([
    {
      label: 'Today',
      route: '/today',
      icon: 'calendar',
      badge: null,
      exact: false,
    },
    {
      label: 'Projects',
      route: '/projects',
      icon: 'folder',
      badge: null,
      exact: false,
    },
    {
      label: 'Goals',
      route: '/goals',
      icon: 'target',
      badge: null,
      exact: false,
    },
    {
      label: 'Habits',
      route: '/habits',
      icon: 'repeat',
      badge: null,
      exact: false,
    },
    {
      label: 'Focus Sessions',
      route: '/focus',
      icon: 'timer',
      badge: null,
      exact: false,
    },
  ]);

  constructor() {
    this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe((event) => {
        const navEnd = event as NavigationEnd;
        this.activeRoute.set(navEnd.urlAfterRedirects);
      });

    this.activeRoute.set(this.router.url);
  }

  isActive(route: string, exact = false): boolean {
    const current = this.activeRoute();
    if (exact) {
      return current === route;
    }
    return current.startsWith(route);
  }

  updateBadge(route: string, count: number | null) {
    this.navItems.update((items) =>
      items.map((item) =>
        item.route === route ? { ...item, badge: count } : item,
      ),
    );
  }
}
