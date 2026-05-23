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

export interface TravelpayoutsReferenceItem {
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

export interface TravelpayoutsFlightSearchParams {
  origin?: string;
  destination?: string;
  departDate?: string;
  returnDate?: string;
  currency?: string;
  limit?: number;
  page?: number;
}

export interface TravelpayoutsHotelSearchParams {
  location?: string;
  checkIn?: string;
  checkOut?: string;
  adults?: number;
  limit?: number;
  currency?: string;
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

  getTravelpayoutsAirports(
    query = '',
    language = 'es',
    limit = 50
  ): Observable<TravelpayoutsReferenceItem[]> {
    const params = new HttpParams()
      .set('language', language)
      .set('query', query)
      .set('limit', limit);

    return this.get<TravelpayoutsReferenceItem[]>(`/travelpayouts/reference/airports?${params.toString()}`);
  }

  getTravelpayoutsCities(
    query = '',
    language = 'es',
    limit = 50
  ): Observable<TravelpayoutsReferenceItem[]> {
    const params = new HttpParams()
      .set('language', language)
      .set('query', query)
      .set('limit', limit);

    return this.get<TravelpayoutsReferenceItem[]>(`/travelpayouts/reference/cities?${params.toString()}`);
  }

  searchTravelpayoutsFlights(params: TravelpayoutsFlightSearchParams): Observable<unknown> {
    let httpParams = new HttpParams()
      .set('currency', params.currency || 'EUR');

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

    if (params.limit) {
      httpParams = httpParams.set('limit', params.limit);
    }

    if (params.page) {
      httpParams = httpParams.set('page', params.page);
    }

    return this.get<unknown>(`/travelpayouts/fly/search?${httpParams.toString()}`);
  }

  searchTravelpayoutsHotels(params: TravelpayoutsHotelSearchParams): Observable<unknown> {
    let httpParams = new HttpParams()
      .set('currency', params.currency || 'EUR')
      .set('limit', params.limit || 50);

    if (params.location) {
      httpParams = httpParams.set('location', params.location);
    }

    if (params.checkIn) {
      httpParams = httpParams.set('checkIn', params.checkIn);
    }

    if (params.checkOut) {
      httpParams = httpParams.set('checkOut', params.checkOut);
    }

    if (params.adults) {
      httpParams = httpParams.set('adults', params.adults);
    }

    return this.get<unknown>(`/travelpayouts/hotel/search?${httpParams.toString()}`);
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
