import { HttpClient } from '@angular/common/http';
import { Injectable, computed, signal } from '@angular/core';
import { Observable } from 'rxjs';

export interface AuthUser {
  id: string;
  userName: string;
  nombre: string;
  email: string;
  apellidos?: string;
  telefono?: string;
  paisId?: number | null;
  pais?: string;
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
const URL_API = 'http://localhost:8080/api';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly senalToken = signal<string | null>(this.getStoredToken());
  private readonly senalUsuario = signal<AuthUser | null>(this.getStoredUser());

  readonly token = this.senalToken.asReadonly();
  readonly usuario = this.senalUsuario.asReadonly();
  readonly estaAutenticado = computed(() => Boolean(this.senalToken()));

  constructor(private readonly http: HttpClient) {}

  register(data: RegisterRequest): Observable<RegisterResponse> {
    return this.http.post<RegisterResponse>(`${URL_API}/auth/register`, data);
  }

  authenticate(data: LoginRequest): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${URL_API}/auth/login`, data);
  }

  login(data: LoginData): void {
    this.senalToken.set(data.token);
    this.senalUsuario.set(data.usuario);

    localStorage.setItem(CLAVE_TOKEN_AUTH, data.token);
    localStorage.setItem(CLAVE_USUARIO_AUTH, JSON.stringify(data.usuario));
  }

  logout(): void {
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

    if (!this.hasJwtFormat(tokenGuardado)) {
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
}
