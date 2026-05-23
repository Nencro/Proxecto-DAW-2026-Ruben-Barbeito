import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
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

export interface DuffelReferenceItem {
  id?: string;
  airport_id?: string;
  code?: string;
  airport_code?: string;
  iata_code?: string;
  name?: string;
  airport_name?: string;
  main_airport_name?: string;
  city_code?: string;
  city_name?: string;
  country_code?: string;
  country_name?: string;
  time_zone?: string;
  type?: string;
  latitude?: number;
  longitude?: number;
  coordinates?: {
    lat?: number;
    lon?: number;
  };
  name_translations?: Record<string, string>;
  city_name_translations?: Record<string, string>;
  raw?: unknown;
}

export interface DuffelFlightSearchParams {
  origin?: string;
  destination?: string;
  departDate?: string;
  returnDate?: string;
  adults?: number;
  limit?: number;
  page?: number;
}

export type TravelRole = 'CREADOR' | 'PARTICIPANTE';

export interface TravelResponse {
  id: number;
  destino: string;
  pais: string;
  descripcion: string;
  fechaInicio: string;
  fechaFin: string;
  creadorId: number;
  creadorUserName: string;
  rolEnViaje: TravelRole;
}

export interface TravelCreateRequest {
  destino: string;
  pais: string;
  descripcion: string;
  fechaInicio: string;
  fechaFin: string;
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

  getTravels(token?: string | null): Observable<TravelResponse[]> {
    return this.get<TravelResponse[]>('/travels', token);
  }

  createTravel(data: TravelCreateRequest, token?: string | null): Observable<TravelResponse> {
    return this.post<TravelResponse, TravelCreateRequest>('/travels', data, token);
  }

  getDuffelAirports(
    query = '',
    limit = 50
  ): Observable<DuffelReferenceItem[]> {
    const params = new HttpParams()
      .set('query', query)
      .set('limit', limit);

    return this.get<DuffelReferenceItem[]>(`/duffel/reference/airports?${params.toString()}`);
  }

  searchDuffelFlights(params: DuffelFlightSearchParams): Observable<unknown> {
    let httpParams = new HttpParams();

    if (params.origin) {
      httpParams = httpParams.set('origin', params.origin);
    }

    if (params.destination) {
      httpParams = httpParams.set('destination', params.destination);
    }

    if (params.departDate) {
      httpParams = httpParams.set('departDate', params.departDate);
    }

    if (params.returnDate) {
      httpParams = httpParams.set('returnDate', params.returnDate);
    }

    if (params.adults) {
      httpParams = httpParams.set('adults', params.adults);
    }

    if (params.limit) {
      httpParams = httpParams.set('limit', params.limit);
    }

    if (params.page) {
      httpParams = httpParams.set('page', params.page);
    }

    return this.get<unknown>(`/duffel/fly/search?${httpParams.toString()}`);
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
