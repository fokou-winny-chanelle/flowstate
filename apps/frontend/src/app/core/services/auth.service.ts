import { HttpClient } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, tap, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { AuthResponse, User } from '../models/types';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);
  private apiUrl = `${environment.apiUrl}/auth`;

  private _currentUser = signal<User | null>(null);
  private _isAuthenticated = signal<boolean>(false);

  readonly currentUser = this._currentUser.asReadonly();
  readonly isAuthenticated = this._isAuthenticated.asReadonly();

  constructor() {
    this.initializeAuth();
  }

  private initializeAuth() {
    const accessToken = this.getAccessToken();
    const refreshToken = this.getRefreshToken();
    const userStr = localStorage.getItem('user');

    if (accessToken && refreshToken && userStr) {
      try {
        const user = JSON.parse(userStr);
        this._currentUser.set(user);
        this._isAuthenticated.set(true);
      } catch {
        this.clearAuth();
      }
    }
  }

  signup(email: string, fullName: string, password: string): Observable<{ message: string; userId: string }> {
    return this.http.post<{ message: string; userId: string }>(`${this.apiUrl}/signup`, {
      email,
      fullName,
      password,
    });
  }

  sendOtp(email: string, type: 'signup' | 'login' | 'reset_password'): Observable<{ message: string; email: string }> {
    return this.http.post<{ message: string; email: string }>(`${this.apiUrl}/send-otp`, {
      email,
      type,
    });
  }

  verifyOtp(
    email: string,
    code: string,
    type: 'signup' | 'login' | 'reset_password',
  ): Observable<{ message: string; verified: boolean }> {
    return this.http.post<{ message: string; verified: boolean }>(`${this.apiUrl}/verify-otp`, {
      email,
      code,
      type,
    });
  }

  login(email: string, password: string): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/login`, { email, password }).pipe(
      tap((response) => {
        this.setAuth(response);
      }),
      catchError((error) => {
        return throwError(() => error);
      })
    );
  }

  refreshToken(): Observable<AuthResponse> {
    const refreshToken = this.getRefreshToken();
    if (!refreshToken) {
      return throwError(() => new Error('No refresh token available'));
    }

    return this.http.post<AuthResponse>(`${this.apiUrl}/refresh`, { refreshToken }).pipe(
      tap((response) => {
        this.setAuth(response);
      }),
      catchError((error) => {
        this.clearAuth();
        this.router.navigate(['/auth/login']);
        return throwError(() => error);
      })
    );
  }

  logout(): Observable<{ message: string }> {
    const refreshToken = this.getRefreshToken();
    return this.http.post<{ message: string }>(`${this.apiUrl}/logout`, { refreshToken }).pipe(
      tap(() => {
        this.clearAuth();
        this.router.navigate(['/auth/login']);
      }),
      catchError(() => {
        this.clearAuth();
        this.router.navigate(['/auth/login']);
        return throwError(() => new Error('Logout failed'));
      })
    );
  }

  forgotPassword(email: string): Observable<{ message: string; email: string }> {
    return this.http.post<{ message: string; email: string }>(`${this.apiUrl}/forgot-password`, {
      email,
    });
  }

  resetPassword(email: string, code: string, newPassword: string): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(`${this.apiUrl}/reset-password`, {
      email,
      code,
      newPassword,
    });
  }

  getAccessToken(): string | null {
    return localStorage.getItem('accessToken');
  }

  getRefreshToken(): string | null {
    return localStorage.getItem('refreshToken');
  }

  private setAuth(response: AuthResponse) {
    localStorage.setItem('accessToken', response.accessToken);
    localStorage.setItem('refreshToken', response.refreshToken);
    localStorage.setItem('user', JSON.stringify(response.user));
    this._currentUser.set(response.user);
    this._isAuthenticated.set(true);
  }

  private clearAuth() {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    this._currentUser.set(null);
    this._isAuthenticated.set(false);
  }
}

