import { Route } from '@angular/router';

export const FOCUS_ROUTES: Route[] = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/focus-sessions-list/focus-sessions-list.component').then(
        (m) => m.FocusSessionsListComponent
      ),
  },
];
