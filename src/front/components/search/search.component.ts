import { Component } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ApiService } from '../../services/api.service';
import { TravelSearchComponent } from '../travel-search/travel-search.component';

export interface CriteriosBusqueda {
  origen: string;
  destino: string;
  fechaIda: string;
  fechaVuelta: string;
}

export interface CriteriosHoteles {
  destino: string;
  fechaEntrada: string;
  fechaSalida: string;
  huespedes: number;
  habitaciones: number;
}

export interface ResultadoVuelo {
  origen: string;
  destino: string;
  precio: number | null;
  moneda: string;
  aerolinea: string;
  numeroVuelo: string;
  proveedor: string;
  escalas: number | null;
  duracion: number | null;
  distancia: number | null;
  salida: string;
  vuelta: string;
  caduca: string;
}

export interface ResultadoHotel {
  nombre: string;
  precio: number | null;
  moneda: string;
  estrellas: number | null;
  direccion: string;
  distancia: number | null;
  proveedor: string;
  hotelId: string;
}

@Component({
  selector: 'app-search',
  standalone: true,
  imports: [RouterLink, TravelSearchComponent],
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.css']
})
export class SearchComponent {
  tipoBusqueda: 'vuelos' | 'hoteles' = 'vuelos';
  criterios: CriteriosBusqueda = {
    origen: '',
    destino: '',
    fechaIda: '',
    fechaVuelta: ''
  };
  criteriosHoteles: CriteriosHoteles = {
    destino: '',
    fechaEntrada: '',
    fechaSalida: '',
    huespedes: 1,
    habitaciones: 1
  };
  resultados: ResultadoVuelo[] = [];
  resultadosHoteles: ResultadoHotel[] = [];
  cargandoResultados = false;
  errorResultados = '';

  constructor(
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    private readonly apiService: ApiService
  ) {
    this.route.queryParamMap.subscribe((params) => {
      this.tipoBusqueda = this.router.url.startsWith('/hotel/search') ? 'hoteles' : 'vuelos';
      this.criterios = {
        origen: params.get('origin') || params.get('origen') || '',
        destino: params.get('destination') || params.get('destino') || '',
        fechaIda: params.get('departDate') || params.get('fechaIda') || '',
        fechaVuelta: params.get('returnDate') || params.get('fechaVuelta') || ''
      };
      this.criteriosHoteles = {
        destino: params.get('location') || params.get('hotelDestino') || '',
        fechaEntrada: params.get('checkIn') || params.get('fechaEntrada') || '',
        fechaSalida: params.get('checkOut') || params.get('fechaSalida') || '',
        huespedes: this.numero(params.get('adults') || params.get('huespedes')) || 1,
        habitaciones: this.numero(params.get('rooms') || params.get('habitaciones')) || 1
      };

      if (this.tipoBusqueda === 'hoteles') {
        this.buscarHoteles();
      } else {
        this.buscarVuelos();
      }
    });
  }

  private buscarVuelos(): void {
    this.resultados = [];
    this.resultadosHoteles = [];
    this.errorResultados = '';

    this.cargandoResultados = true;

    this.apiService.searchTravelpayoutsFlights({
      origin: this.criterios.origen || undefined,
      destination: this.criterios.destino || undefined,
      departDate: this.criterios.fechaIda || undefined,
      returnDate: this.criterios.fechaVuelta || undefined,
      currency: 'EUR',
      limit: 50
    }).subscribe({
      next: (respuesta) => {
        this.resultados = this.normalizarResultados(respuesta);
      },
      error: () => {
        this.errorResultados = 'No se pudieron cargar los vuelos de Travelpayouts.';
        this.cargandoResultados = false;
      },
      complete: () => {
        this.cargandoResultados = false;
      }
    });
  }

  private buscarHoteles(): void {
    this.resultados = [];
    this.resultadosHoteles = [];
    this.errorResultados = '';

    if (!this.criteriosHoteles.destino || !this.criteriosHoteles.fechaEntrada || !this.criteriosHoteles.fechaSalida) {
      return;
    }

    this.cargandoResultados = true;

    this.apiService.searchTravelpayoutsHotels({
      location: this.criteriosHoteles.destino,
      checkIn: this.criteriosHoteles.fechaEntrada,
      checkOut: this.criteriosHoteles.fechaSalida,
      adults: this.criteriosHoteles.huespedes,
      currency: 'EUR',
      limit: 50
    }).subscribe({
      next: (respuesta) => {
        this.resultadosHoteles = this.normalizarHoteles(respuesta);
      },
      error: () => {
        this.errorResultados = 'No se pudieron cargar los hoteles de Travelpayouts.';
        this.cargandoResultados = false;
      },
      complete: () => {
        this.cargandoResultados = false;
      }
    });
  }

  private normalizarResultados(respuesta: unknown): ResultadoVuelo[] {
    const data = this.esObjeto(respuesta) ? respuesta['data'] : null;
    const moneda = this.esObjeto(respuesta) ? this.texto(respuesta['currency']).toUpperCase() : 'EUR';

    if (Array.isArray(data)) {
      return data
        .filter((oferta): oferta is Record<string, unknown> => this.esObjeto(oferta))
        .map((oferta) => this.mapearOferta(oferta, this.texto(oferta['destination']), moneda));
    }

    if (!this.esObjeto(data)) {
      return [];
    }

    return Object.entries(data).flatMap(([destino, ofertasPorIndice]) => {
      if (!this.esObjeto(ofertasPorIndice)) {
        return [];
      }

      return Object.values(ofertasPorIndice)
        .filter((oferta): oferta is Record<string, unknown> => this.esObjeto(oferta))
        .map((oferta) => this.mapearOferta(oferta, destino, moneda));
    });
  }

  private mapearOferta(oferta: Record<string, unknown>, destinoPorDefecto: string, moneda: string): ResultadoVuelo {
    return {
      origen: this.texto(oferta['origin']),
      destino: this.texto(oferta['destination']) || destinoPorDefecto,
      precio: this.numero(oferta['price']) ?? this.numero(oferta['value']),
      moneda: moneda || 'EUR',
      aerolinea: this.texto(oferta['airline']),
      numeroVuelo: this.texto(oferta['flight_number']),
      proveedor: this.texto(oferta['gate']),
      escalas: this.numero(oferta['number_of_changes']),
      duracion: this.numero(oferta['duration']),
      distancia: this.numero(oferta['distance']),
      salida: this.texto(oferta['departure_at']) || this.texto(oferta['depart_date']),
      vuelta: this.texto(oferta['return_at']) || this.texto(oferta['return_date']),
      caduca: this.texto(oferta['expires_at'])
    };
  }

  private normalizarHoteles(respuesta: unknown): ResultadoHotel[] {
    const moneda = this.esObjeto(respuesta) ? this.texto(respuesta['currency']).toUpperCase() : 'EUR';
    const candidatos = this.extraerArrayHoteles(respuesta);

    return candidatos
      .filter((hotel): hotel is Record<string, unknown> => this.esObjeto(hotel))
      .map((hotel) => this.mapearHotel(hotel, moneda || 'EUR'));
  }

  private extraerArrayHoteles(respuesta: unknown): unknown[] {
    if (Array.isArray(respuesta)) {
      return respuesta;
    }

    if (!this.esObjeto(respuesta)) {
      return [];
    }

    const data = respuesta['data'];
    const result = respuesta['result'];
    const hotels = respuesta['hotels'];

    if (Array.isArray(data)) {
      return data;
    }

    if (Array.isArray(result)) {
      return result;
    }

    if (Array.isArray(hotels)) {
      return hotels;
    }

    if (this.esObjeto(data)) {
      if (Array.isArray(data['hotels'])) {
        return data['hotels'];
      }

      if (Array.isArray(data['result'])) {
        return data['result'];
      }
    }

    return [];
  }

  private mapearHotel(hotel: Record<string, unknown>, moneda: string): ResultadoHotel {
    const priceFrom = this.numero(hotel['priceFrom']);
    const price = this.numero(hotel['price']);
    const priceAvg = this.numero(hotel['priceAvg']);
    const hotelName = this.texto(hotel['hotelName']) || this.texto(hotel['name']);

    return {
      nombre: hotelName || 'Hotel sin nombre',
      precio: priceFrom ?? price ?? priceAvg,
      moneda,
      estrellas: this.numero(hotel['stars']),
      direccion: this.texto(hotel['address']),
      distancia: this.numero(hotel['distance']),
      proveedor: this.texto(hotel['gate']) || this.texto(hotel['provider']),
      hotelId: this.texto(hotel['hotelId']) || this.texto(hotel['id'])
    };
  }

  private esObjeto(valor: unknown): valor is Record<string, unknown> {
    return typeof valor === 'object' && valor !== null && !Array.isArray(valor);
  }

  private texto(valor: unknown): string {
    if (typeof valor === 'string') {
      return valor;
    }

    if (typeof valor === 'number') {
      return String(valor);
    }

    return '';
  }

  private numero(valor: unknown): number | null {
    if (typeof valor === 'number') {
      return valor;
    }

    if (typeof valor === 'string' && valor.trim()) {
      const numero = Number(valor);
      return Number.isFinite(numero) ? numero : null;
    }

    return null;
  }
}
