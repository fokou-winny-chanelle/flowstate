import { Route } from '@angular/router';
import { AppShellComponent } from '../../layouts/app-shell/app-shell.component';

export const TODAY_ROUTES: Route[] = [
  {
    path: '',
    component: AppShellComponent,
    children: [
      {
        path: '',
        loadComponent: () =>
          import('./pages/today-page/today-page.component').then(
            (m) => m.TodayPageComponent
          ),
      },
    ],
  },
];
