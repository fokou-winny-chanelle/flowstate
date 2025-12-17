import { Route } from '@angular/router';

export const HABITS_ROUTES: Route[] = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/habits-list/habits-list.component').then(
        (m) => m.HabitsListComponent
      ),
  },
];
