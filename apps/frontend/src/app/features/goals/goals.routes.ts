import { Route } from '@angular/router';

export const GOALS_ROUTES: Route[] = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/goals-list/goals-list.component').then(
        (m) => m.GoalsListComponent
      ),
  },
  {
    path: ':id',
    loadComponent: () =>
      import('./pages/goal-detail/goal-detail.component').then(
        (m) => m.GoalDetailComponent
      ),
  },
];
