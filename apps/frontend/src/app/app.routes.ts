import { Route } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { AppShellComponent } from './layouts/app-shell/app-shell.component';

export const appRoutes: Route[] = [
  {
    path: '',
    redirectTo: '/today',
    pathMatch: 'full',
  },
  {
    path: 'auth',
    loadChildren: () =>
      import('./features/auth/auth.routes').then((m) => m.AUTH_ROUTES),
  },
  {
    path: '',
    component: AppShellComponent,
    canActivate: [authGuard],
    children: [
      {
        path: 'today',
        loadChildren: () =>
          import('./features/today/today.routes').then((m) => m.TODAY_ROUTES),
      },
      {
        path: 'projects',
        loadChildren: () =>
          import('./features/projects/projects.routes').then(
            (m) => m.PROJECTS_ROUTES,
          ),
      },
      {
        path: 'goals',
        loadChildren: () =>
          import('./features/goals/goals.routes').then((m) => m.GOALS_ROUTES),
      },
      {
        path: 'habits',
        loadChildren: () =>
          import('./features/habits/habits.routes').then((m) => m.HABITS_ROUTES),
      },
      {
        path: 'focus',
        loadChildren: () =>
          import('./features/focus/focus.routes').then((m) => m.FOCUS_ROUTES),
      },
    ],
  },
  {
    path: '**',
    redirectTo: '/today',
  },
];
