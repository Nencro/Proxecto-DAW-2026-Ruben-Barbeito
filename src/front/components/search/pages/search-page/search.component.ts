import { Component } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { ApiService } from '../../../../services/api.service';
import { TravelSearchComponent } from '../../components/travel-search/travel-search.component';
import { FlightResultsComponent } from '../../components/flight-results/flight-results.component';
import {
  CriteriosBusqueda,
  ResultadoVuelo
} from '../../models/search-results.model';

@Component({
  selector: 'app-search',
  standalone: true,
  imports: [RouterLink, TravelSearchComponent, FlightResultsComponent],
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.css']
})
export class SearchComponent {
  criterios: CriteriosBusqueda = {
    origen: '',
    destino: '',
    fechaIda: '',
    fechaVuelta: ''
  };
  resultados: ResultadoVuelo[] = [];
  cargandoResultados = false;
  errorResultados = '';
  origenEtiqueta = '';
  destinoEtiqueta = '';

  constructor(
    private readonly route: ActivatedRoute,
    private readonly apiService: ApiService
  ) {
    this.route.queryParamMap.subscribe((params) => {
      this.criterios = {
        origen: params.get('origin') || params.get('origen') || '',
        destino: params.get('destination') || params.get('destino') || '',
        fechaIda: params.get('departDate') || params.get('fechaIda') || '',
        fechaVuelta: params.get('returnDate') || params.get('fechaVuelta') || ''
      };

      this.cargarEtiquetasAeropuertos();
      this.buscarVuelos();
    });
  }

  private buscarVuelos(): void {
    this.resultados = [];
    this.errorResultados = '';
    this.cargandoResultados = true;

    this.apiService.searchDuffelFlights({
      origin: this.criterios.origen || undefined,
      destination: this.criterios.destino || undefined,
      departDate: this.criterios.fechaIda || undefined,
      returnDate: this.criterios.fechaVuelta || undefined,
      adults: 1,
      limit: 50
    }).subscribe({
      next: (respuesta) => {
        this.resultados = this.normalizarResultados(respuesta);
      },
      error: () => {
        this.errorResultados = 'No pudo realizarse la carga de datos.';
        this.cargandoResultados = false;
      },
      complete: () => {
        this.cargandoResultados = false;
      }
    });
  }

  private normalizarResultados(respuesta: unknown): ResultadoVuelo[] {
    const moneda = this.esObjeto(respuesta) ? this.texto(respuesta['currency']).toUpperCase() : 'EUR';
    const data = this.esObjeto(respuesta) ? respuesta['data'] : null;

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
    const slices = Array.isArray(oferta['slices']) ? oferta['slices'] : [];
    const firstSlice: Record<string, unknown> = this.esObjeto(slices[0]) ? slices[0] : {};
    const returnSlice: Record<string, unknown> = slices.length > 1 && this.esObjeto(slices[1]) ? slices[1] : {};
    const segments = Array.isArray(firstSlice['segments']) ? firstSlice['segments'] : [];
    const returnSegments = Array.isArray(returnSlice['segments']) ? returnSlice['segments'] : [];
    const firstSegment: Record<string, unknown> = this.esObjeto(segments[0]) ? segments[0] : {};
    const firstReturnSegment: Record<string, unknown> = this.esObjeto(returnSegments[0]) ? returnSegments[0] : {};
    const marketingCarrier: Record<string, unknown> = this.esObjeto(firstSegment['marketing_carrier'])
      ? firstSegment['marketing_carrier']
      : {};
    const operatingCarrier: Record<string, unknown> = this.esObjeto(firstSegment['operating_carrier'])
      ? firstSegment['operating_carrier']
      : {};
    const owner: Record<string, unknown> = this.esObjeto(oferta['owner']) ? oferta['owner'] : {};
    const origin: Record<string, unknown> = this.esObjeto(firstSlice['origin']) ? firstSlice['origin'] : {};
    const destination: Record<string, unknown> = this.esObjeto(firstSlice['destination']) ? firstSlice['destination'] : {};
    const returnOrigin: Record<string, unknown> = this.esObjeto(returnSlice['origin']) ? returnSlice['origin'] : {};
    const returnDestination: Record<string, unknown> = this.esObjeto(returnSlice['destination']) ? returnSlice['destination'] : {};
    const returnMarketingCarrier: Record<string, unknown> = this.esObjeto(firstReturnSegment['marketing_carrier'])
      ? firstReturnSegment['marketing_carrier']
      : {};
    const totalAmount = this.numero(oferta['total_amount']) ?? this.numero(oferta['base_amount']) ?? this.numero(oferta['price']) ?? this.numero(oferta['value']);
    const flightNumber = this.texto(firstSegment['marketing_carrier_flight_number']) || this.texto(oferta['flight_number']);
    const carrierCode = this.texto(marketingCarrier['iata_code']);
    const returnFlightNumber = this.texto(firstReturnSegment['marketing_carrier_flight_number']);
    const returnCarrierCode = this.texto(returnMarketingCarrier['iata_code']);

    return {
      origen: this.texto(origin['iata_code']) || this.texto(firstSegment['origin']) || this.texto(oferta['origin']),
      destino: this.texto(destination['iata_code']) || this.texto(firstSegment['destination']) || this.texto(oferta['destination']) || destinoPorDefecto,
      codigoPaisDestino: this.texto(destination['country_code']) || this.texto(oferta['destination_country_code']),
      precio: totalAmount,
      moneda: this.texto(oferta['total_currency']) || this.texto(oferta['base_currency']) || moneda || 'EUR',
      aerolinea: this.texto(oferta['airline']) || this.texto(marketingCarrier['name']),
      numeroVuelo: carrierCode && flightNumber ? `${carrierCode} ${flightNumber}` : flightNumber,
      iconoUrl: this.getLogoUrl(marketingCarrier) || this.getLogoUrl(operatingCarrier) || this.getLogoUrl(owner),
      proveedor: this.texto(oferta['gate']) || this.texto(owner['name']),
      escalas: this.numero(oferta['number_of_changes']) ?? Math.max(segments.length - 1, 0),
      duracion: this.numero(oferta['duration']) ?? this.minutosDesdeDuracionIso(this.texto(firstSlice['duration'])),
      distancia: this.numero(oferta['distance']),
      salida: this.texto(firstSegment['departing_at']) || this.texto(oferta['departure_at']) || this.texto(oferta['depart_date']),
      vuelta: this.texto(firstReturnSegment['departing_at']) || this.texto(oferta['return_at']) || this.texto(oferta['return_date']),
      vueltaOrigen: this.texto(returnOrigin['iata_code']) || this.texto(firstReturnSegment['origin']),
      vueltaDestino: this.texto(returnDestination['iata_code']) || this.texto(firstReturnSegment['destination']),
      vueltaNumeroVuelo: returnCarrierCode && returnFlightNumber ? `${returnCarrierCode} ${returnFlightNumber}` : returnFlightNumber,
      vueltaAerolinea: this.texto(returnMarketingCarrier['name']),
      vueltaDuracion: this.minutosDesdeDuracionIso(this.texto(returnSlice['duration'])),
      vueltaEscalas: returnSegments.length ? Math.max(returnSegments.length - 1, 0) : null,
      caduca: this.texto(oferta['expires_at'])
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

  formatearFechaCriterio(valor: string): string {
    if (!valor) {
      return 'Sin fecha';
    }

    const fecha = new Date(`${valor}T00:00:00`);

    if (Number.isNaN(fecha.getTime())) {
      return valor;
    }

    return new Intl.DateTimeFormat('es-ES', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    }).format(fecha);
  }

  private cargarEtiquetasAeropuertos(): void {
    this.origenEtiqueta = this.criterios.origen;
    this.destinoEtiqueta = this.criterios.destino;

    if (this.criterios.origen) {
      this.cargarEtiquetaAeropuerto(this.criterios.origen, 'origen');
    }

    if (this.criterios.destino) {
      this.cargarEtiquetaAeropuerto(this.criterios.destino, 'destino');
    }
  }

  private cargarEtiquetaAeropuerto(valor: string, tipo: 'origen' | 'destino'): void {
    this.apiService.getDuffelAirports(valor, 50).subscribe({
      next: (aeropuertos) => {
        const aeropuerto = aeropuertos.find((item) => {
          return [item.airport_code, item.iata_code, item.code]
            .some((codigo) => codigo?.trim().toLowerCase() === valor.trim().toLowerCase());
        }) || aeropuertos[0];

        const etiqueta = aeropuerto ? this.getCiudadAeropuerto(aeropuerto) : valor;

        if (tipo === 'origen') {
          this.origenEtiqueta = etiqueta || valor;
        } else {
          this.destinoEtiqueta = etiqueta || valor;
        }
      }
    });
  }

  private getCiudadAeropuerto(aeropuerto: { city_name?: string; name?: string; airport_name?: string; main_airport_name?: string }): string {
    return aeropuerto.city_name
      || aeropuerto.name
      || aeropuerto.airport_name
      || aeropuerto.main_airport_name
      || '';
  }

  private minutosDesdeDuracionIso(valor: string): number | null {
    const coincidencia = /^P(?:\d+D)?T(?:(\d+)H)?(?:(\d+)M)?$/i.exec(valor);

    if (!coincidencia) {
      return null;
    }

    const horas = Number(coincidencia[1] || 0);
    const minutos = Number(coincidencia[2] || 0);
    const total = horas * 60 + minutos;

    return total > 0 ? total : null;
  }

  private getLogoUrl(valor: Record<string, unknown>): string {
    return this.texto(valor['logo_symbol_url']) || this.texto(valor['logo_lockup_url']) || this.texto(valor['logo_url']);
  }
}
