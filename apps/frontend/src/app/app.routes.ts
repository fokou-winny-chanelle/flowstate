import { Route } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';

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
    path: 'today',
    canActivate: [authGuard],
    loadChildren: () =>
      import('./features/today/today.routes').then((m) => m.TODAY_ROUTES),
  },
  {
    path: '**',
    redirectTo: '/today',
  },
];
