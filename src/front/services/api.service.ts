import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

const URL_API = 'http://localhost:8080/api';

export interface ProfileResponse {
  id?: number;
  userName?: string;
  username?: string;
  usuario?: string;
  nombre?: string;
  apellidos?: string;
  email?: string;
  telefono?: string;
  paisId?: number | null;
  fechaRegistro?: string;
}

export interface ProfileUpdateRequest {
  nombre: string;
  apellidos: string;
  telefono: string;
  paisId: number | null;
}

export interface PaisResponse {
  id: number;
  nombre: string;
  prefijo: string;
}

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  constructor(private readonly http: HttpClient) {}

  getProfile(token?: string | null): Observable<ProfileResponse> {
    return this.get<ProfileResponse>('/profile', token);
  }

  updateProfile(data: ProfileUpdateRequest, token?: string | null): Observable<ProfileResponse> {
    return this.post<ProfileResponse, ProfileUpdateRequest>('/profile', data, token);
  }

  getPaises(): Observable<PaisResponse[]> {
    return this.get<PaisResponse[]>('/paises');
  }

  get<T>(endpoint: string, token?: string | null): Observable<T> {
    return this.http.get<T>(this.buildUrl(endpoint), {
      headers: this.buildHeaders(token)
    });
  }

  post<TResponse, TBody = unknown>(
    endpoint: string,
    body: TBody,
    token?: string | null
  ): Observable<TResponse> {
    return this.http.post<TResponse>(this.buildUrl(endpoint), body, {
      headers: this.buildHeaders(token)
    });
  }

  put<TResponse, TBody = unknown>(
    endpoint: string,
    body: TBody,
    token?: string | null
  ): Observable<TResponse> {
    return this.http.put<TResponse>(this.buildUrl(endpoint), body, {
      headers: this.buildHeaders(token)
    });
  }

  delete<T>(endpoint: string, token?: string | null): Observable<T> {
    return this.http.delete<T>(this.buildUrl(endpoint), {
      headers: this.buildHeaders(token)
    });
  }

  private buildUrl(endpoint: string): string {
    const ruta = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
    return `${URL_API}${ruta}`;
  }

  private buildHeaders(token?: string | null): HttpHeaders {
    if (!token) {
      return new HttpHeaders();
    }

    return new HttpHeaders().set('Authorization', `Bearer ${token}`);
  }
}
