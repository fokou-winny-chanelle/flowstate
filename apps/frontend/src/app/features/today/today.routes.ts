import { Route } from '@angular/router';

export const TODAY_ROUTES: Route[] = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/today-page/today-page.component').then(
        (m) => m.TodayPageComponent
      ),
  },
];

