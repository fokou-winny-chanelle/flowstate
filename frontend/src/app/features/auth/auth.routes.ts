import { Route } from '@angular/router';
import { AuthLayoutComponent } from '../../layouts/auth-layout/auth-layout.component';

export const AUTH_ROUTES: Route[] = [
  {
    path: '',
    component: AuthLayoutComponent,
    children: [
      { path: '', redirectTo: 'login', pathMatch: 'full' },
      {
        path: 'login',
        loadComponent: () =>
          import('./pages/login/login.component').then((m) => m.LoginComponent),
      },
      {
        path: 'signup',
        loadComponent: () =>
          import('./pages/signup/signup.component').then((m) => m.SignupComponent),
      },
      {
        path: 'verify-otp',
        loadComponent: () =>
          import('./pages/verify-otp/verify-otp.component').then(
            (m) => m.VerifyOtpComponent
          ),
      },
    ],
  },
];
