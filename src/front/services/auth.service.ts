import { HttpClient } from '@angular/common/http';
import { Injectable, computed, signal } from '@angular/core';
import { Observable } from 'rxjs';
import { APP_RUNTIME_CONFIG } from '../app-runtime-config';

export interface AuthUser {
  id: string;
  userName: string;
  nombre: string;
  email: string;
  apellidos?: string;
  telefono?: string;
  paisId?: number | null;
  pais?: string;
  codigoPais?: string;
  prefijoPais?: string;
  fechaRegistro?: string;
  roles?: string[];
}

export interface LoginData {
  token: string;
  usuario: AuthUser;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface PasswordRecoverRequest {
  userName: string;
  email: string;
  newPassword: string;
}

export interface LoginResponse {
  token: string;
  usuario: {
    id: number;
    userName: string;
    nombre: string;
    apellidos: string;
    email: string;
    fechaRegistro: string;
    roles: string[];
  };
}

export interface RegisterRequest {
  userName: string;
  email: string;
  password: string;
}

export interface RegisterResponse {
  token: string;
  id: number;
  userName: string;
  nombre: string;
  apellidos: string;
  email: string;
  fechaRegistro: string;
  roles: string[];
}

const CLAVE_TOKEN_AUTH = 'exploramas_auth_token';
const CLAVE_USUARIO_AUTH = 'exploramas_auth_user';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly senalToken = signal<string | null>(this.getStoredToken());
  private readonly senalUsuario = signal<AuthUser | null>(this.getStoredUser());

  readonly token = this.senalToken.asReadonly();
  readonly usuario = this.senalUsuario.asReadonly();
  readonly estaAutenticado = computed(() => Boolean(this.senalToken()) && !this.isTokenExpired(this.senalToken()));

  constructor(private readonly http: HttpClient) {}

  register(data: RegisterRequest): Observable<RegisterResponse> {
    return this.http.post<RegisterResponse>(`${APP_RUNTIME_CONFIG.apiBaseUrl}/auth/register`, data);
  }

  authenticate(data: LoginRequest): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${APP_RUNTIME_CONFIG.apiBaseUrl}/auth/login`, data);
  }

  recoverPassword(data: PasswordRecoverRequest): Observable<void> {
    return this.http.post<void>(`${APP_RUNTIME_CONFIG.apiBaseUrl}/auth/password/recover`, data);
  }

  login(data: LoginData): void {
    this.senalToken.set(data.token);
    this.senalUsuario.set(data.usuario);

    localStorage.setItem(CLAVE_TOKEN_AUTH, data.token);
    localStorage.setItem(CLAVE_USUARIO_AUTH, JSON.stringify(data.usuario));
  }

  logout(): void {
    this.clearSession();
  }

  clearExpiredSession(): void {
    if (this.isTokenExpired(this.senalToken())) {
      this.clearSession();
    }
  }

  validateSession(): boolean {
    this.clearExpiredSession();
    return this.estaAutenticado();
  }

  clearSession(): void {
    this.senalToken.set(null);
    this.senalUsuario.set(null);

    localStorage.removeItem(CLAVE_TOKEN_AUTH);
    localStorage.removeItem(CLAVE_USUARIO_AUTH);
  }

  updateUser(usuario: AuthUser): void {
    this.senalUsuario.set(usuario);
    localStorage.setItem(CLAVE_USUARIO_AUTH, JSON.stringify(usuario));
  }

  getToken(): string | null {
    return this.senalToken();
  }

  getUser(): AuthUser | null {
    return this.senalUsuario();
  }

  private getStoredToken(): string | null {
    const tokenGuardado = localStorage.getItem(CLAVE_TOKEN_AUTH);

    if (!tokenGuardado) {
      return null;
    }

    if (!this.hasJwtFormat(tokenGuardado) || this.isTokenExpired(tokenGuardado)) {
      localStorage.removeItem(CLAVE_TOKEN_AUTH);
      localStorage.removeItem(CLAVE_USUARIO_AUTH);
      return null;
    }

    return tokenGuardado;
  }

  private getStoredUser(): AuthUser | null {
    const usuarioGuardado = localStorage.getItem(CLAVE_USUARIO_AUTH);

    if (!usuarioGuardado) {
      return null;
    }

    try {
      return JSON.parse(usuarioGuardado) as AuthUser;
    } catch {
      localStorage.removeItem(CLAVE_USUARIO_AUTH);
      return null;
    }
  }

  private hasJwtFormat(token: string): boolean {
    return token.split('.').length === 3;
  }

  private isTokenExpired(token: string | null): boolean {
    if (!token || !this.hasJwtFormat(token)) {
      return true;
    }

    try {
      const payload = JSON.parse(this.decodeJwtPayload(token)) as { exp?: number };

      if (!payload.exp) {
        return false;
      }

      return payload.exp * 1000 <= Date.now();
    } catch {
      return true;
    }
  }

  private decodeJwtPayload(token: string): string {
    const payload = token.split('.')[1]
      .replace(/-/g, '+')
      .replace(/_/g, '/');
    const paddedPayload = payload.padEnd(Math.ceil(payload.length / 4) * 4, '=');

    return atob(paddedPayload);
  }
}
