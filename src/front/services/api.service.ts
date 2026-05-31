import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { APP_RUNTIME_CONFIG } from '../app-runtime-config';

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
  pais?: string;
  codigoPais?: string;
  prefijoPais?: string;
  fechaRegistro?: string;
  roles?: string[];
}

export interface ProfileUpdateRequest {
  nombre: string;
  apellidos: string;
  telefono: string;
  pais: string;
  codigoPais: string;
  prefijoPais: string;
}

export interface PaisResponse {
  id: number;
  nombre: string;
  codigo: string;
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

export interface RestCountryResponse {
  cca2: string;
  flag?: string;
  name: {
    common: string;
    official?: string;
  };
  translations?: {
    spa?: {
      common: string;
      official?: string;
    };
  };
  idd?: {
    root?: string;
    suffixes?: string[];
  };
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
  codigoPais: string;
  descripcion: string;
  fechaInicio: string;
  fechaFin: string;
  costeBillete: number;
  creadorId: number;
  creadorUserName: string;
  numeroParticipantes: number;
  rolEnViaje: TravelRole;
}

export interface TravelCreateRequest {
  destino: string;
  pais: string;
  codigoPais?: string;
  descripcion: string;
  fechaInicio: string;
  fechaFin: string;
  costeBillete: number;
}

export interface TravelUpdateRequest {
  descripcion: string;
  fechaInicio: string;
  fechaFin: string;
  costeBillete: number;
}

export interface TravelInviteResponse {
  viajeId: number;
  token: string;
  fechaExpiracion: string;
}

export interface TravelParticipantResponse {
  id: number;
  userName: string;
  nombre: string;
  apellidos: string;
  email: string;
  rolEnViaje: TravelRole;
}

export interface TravelParticipantsUpdateRequest {
  participantIds: number[];
}

export interface TravelActivityResponse {
  id: number;
  viajeId: number;
  fecha: string;
  hora: string;
  coste: number;
  descripcion: string;
}

export interface TravelActivitySaveRequest {
  fecha: string;
  hora: string;
  coste: number;
  descripcion: string;
}

export interface ExperienceResponse {
  id: number;
  nombre: string;
  localidad: string;
  descripcion: string;
  tamanioMinimo: number;
  tamanioMaximo: number;
  duracionMinutos: number;
  precio: number;
  pais: string;
  codigoPais: string;
  creadorId: number;
  creadorUserName: string;
  imagen: string;
}

export interface ExperienceCreateRequest {
  nombre: string;
  localidad: string;
  descripcion: string;
  tamanioMinimo: number;
  tamanioMaximo: number;
  duracionMinutos: number;
  precio: number;
  pais: string;
  codigoPais: string;
  imagen: string;
  imagenTipo: string;
}

export type ExperienceUpdateRequest = ExperienceCreateRequest;

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  constructor(private readonly http: HttpClient) {}

  getProfile(token?: string | null): Observable<ProfileResponse> {
    return this.get<ProfileResponse>('/profile', token);
  }

  getProfileByUserName(userName: string, token?: string | null): Observable<ProfileResponse> {
    return this.get<ProfileResponse>(`/profile/${encodeURIComponent(userName)}`, token);
  }

  searchProfiles(query = '', token?: string | null): Observable<ProfileResponse[]> {
    const params = new HttpParams().set('query', query.trim());
    return this.get<ProfileResponse[]>(`/profile/search?${params.toString()}`, token);
  }

  getRoles(token?: string | null): Observable<string[]> {
    return this.get<string[]>('/profile/roles', token);
  }

  updateUserRoles(userName: string, roles: string[], token?: string | null): Observable<ProfileResponse> {
    return this.put<ProfileResponse, { roles: string[] }>(
      `/profile/${encodeURIComponent(userName)}/roles`,
      { roles },
      token
    );
  }

  updateProfile(data: ProfileUpdateRequest, token?: string | null): Observable<ProfileResponse> {
    return this.post<ProfileResponse, ProfileUpdateRequest>('/profile', data, token);
  }

  getPaises(): Observable<PaisResponse[]> {
    return this.get<PaisResponse[]>('/paises');
  }

  getRestCountries(): Observable<RestCountryResponse[]> {
    return this.http.get<RestCountryResponse[]>(
      APP_RUNTIME_CONFIG.restCountriesUrl
    );
  }

  getTravels(token?: string | null): Observable<TravelResponse[]> {
    return this.get<TravelResponse[]>('/travels', token);
  }

  getTravel(id: number | string, token?: string | null): Observable<TravelResponse> {
    return this.get<TravelResponse>(`/travels/${id}`, token);
  }

  getTravelActivities(id: number | string, token?: string | null): Observable<TravelActivityResponse[]> {
    return this.get<TravelActivityResponse[]>(`/travel/details/${id}/activitities`, token);
  }

  createTravelActivity(
    id: number | string,
    data: TravelActivitySaveRequest,
    token?: string | null
  ): Observable<TravelActivityResponse> {
    return this.post<TravelActivityResponse, TravelActivitySaveRequest>(
      `/travel/details/${id}/activitities`,
      data,
      token
    );
  }

  replaceTravelActivities(
    id: number | string,
    fecha: string,
    data: TravelActivitySaveRequest[],
    token?: string | null
  ): Observable<TravelActivityResponse[]> {
    const params = new HttpParams().set('fecha', fecha);

    return this.put<TravelActivityResponse[], TravelActivitySaveRequest[]>(
      `/travel/details/${id}/activitities?${params.toString()}`,
      data,
      token
    );
  }

  createTravel(data: TravelCreateRequest, token?: string | null): Observable<TravelResponse> {
    return this.post<TravelResponse, TravelCreateRequest>('/travels', data, token);
  }

  updateTravel(id: number | string, data: TravelUpdateRequest, token?: string | null): Observable<TravelResponse> {
    return this.put<TravelResponse, TravelUpdateRequest>(`/travels/${id}`, data, token);
  }

  deleteTravel(id: number | string, token?: string | null): Observable<void> {
    return this.delete<void>(`/travels/${id}`, token);
  }

  getTravelParticipants(id: number | string, token?: string | null): Observable<TravelParticipantResponse[]> {
    return this.get<TravelParticipantResponse[]>(`/travels/${id}/participants`, token);
  }

  updateTravelParticipants(
    id: number | string,
    data: TravelParticipantsUpdateRequest,
    token?: string | null
  ): Observable<TravelParticipantResponse[]> {
    return this.put<TravelParticipantResponse[], TravelParticipantsUpdateRequest>(
      `/travels/${id}/participants`,
      data,
      token
    );
  }

  createTravelInvite(id: number | string, token?: string | null): Observable<TravelInviteResponse> {
    return this.post<TravelInviteResponse, Record<string, never>>(`/travels/${id}/invite`, {}, token);
  }

  joinTravelByInvite(inviteToken: string, token?: string | null): Observable<TravelResponse> {
    return this.post<TravelResponse, Record<string, never>>(`/travels/invitations/${inviteToken}/join`, {}, token);
  }

  getExperiences(nombre = '', pais = '', mine = false, token?: string | null, localidad = ''): Observable<ExperienceResponse[]> {
    let params = new HttpParams();

    if (nombre.trim()) {
      params = params.set('nombre', nombre.trim());
    }

    if (pais.trim()) {
      params = params.set('pais', pais.trim());
    }

    if (localidad.trim()) {
      params = params.set('localidad', localidad.trim());
    }

    if (mine) {
      params = params.set('mine', true);
    }

    const query = params.toString();
    return this.get<ExperienceResponse[]>(`/experiences${query ? `?${query}` : ''}`, token);
  }

  createExperience(data: ExperienceCreateRequest, token?: string | null): Observable<ExperienceResponse> {
    return this.post<ExperienceResponse, ExperienceCreateRequest>('/experiences', data, token);
  }

  getExperience(id: number | string): Observable<ExperienceResponse> {
    return this.get<ExperienceResponse>(`/experiences/${id}`);
  }

  updateExperience(
    id: number | string,
    data: ExperienceUpdateRequest,
    token?: string | null
  ): Observable<ExperienceResponse> {
    return this.put<ExperienceResponse, ExperienceUpdateRequest>(`/experiences/${id}`, data, token);
  }

  deleteExperience(id: number | string, token?: string | null): Observable<void> {
    return this.delete<void>(`/experiences/${id}`, token);
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
    return `${APP_RUNTIME_CONFIG.apiBaseUrl}${ruta}`;
  }

  private buildHeaders(token?: string | null): HttpHeaders {
    if (!token) {
      return new HttpHeaders();
    }

    return new HttpHeaders().set('Authorization', `Bearer ${token}`);
  }
}
