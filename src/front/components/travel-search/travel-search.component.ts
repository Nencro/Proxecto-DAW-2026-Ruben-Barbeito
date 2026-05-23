import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { OverlayModule } from '@angular/cdk/overlay';
import { ActivatedRoute, Router } from '@angular/router';
import { forkJoin, Subscription } from 'rxjs';
import { ApiService, TravelpayoutsReferenceItem } from '../../services/api.service';

export interface DatosBusqueda {
  origen: string;
  destino: string;
  fechaIda: string;
  fechaVuelta: string;
  viajeros: number;
}

export interface DatosBusquedaHotel {
  destino: string;
  fechaEntrada: string;
  fechaSalida: string;
  huespedes: number;
  habitaciones: number;
}

@Component({
  selector: 'app-travel-search',
  standalone: true,
  imports: [FormsModule, OverlayModule],
  templateUrl: './travel-search.component.html',
  styleUrls: ['./travel-search.component.css']
})
export class TravelSearchComponent implements OnInit, OnDestroy {
  pestanaActiva: 'vuelos' | 'hoteles' = 'vuelos';
  aeropuertos: TravelpayoutsReferenceItem[] = [];
  ciudadesHotel: TravelpayoutsReferenceItem[] = [];
  aeropuertosOrigen: TravelpayoutsReferenceItem[] = [];
  aeropuertosDestino: TravelpayoutsReferenceItem[] = [];
  ciudadesDestinoHotel: TravelpayoutsReferenceItem[] = [];
  textoOrigen = '';
  textoDestino = '';
  textoHotelDestino = '';
  panelAbierto: 'origen' | 'destino' | 'hotelDestino' | null = null;
  cargandoReferencias = false;
  errorReferencias = '';
  private temporizadorBusqueda?: number;
  private queryParamsSubscription?: Subscription;

  datosBusqueda: DatosBusqueda = {
    origen: '',
    destino: '',
    fechaIda: '',
    fechaVuelta: '',
    viajeros: 1,
  };

  datosBusquedaHotel: DatosBusquedaHotel = {
    destino: '',
    fechaEntrada: '',
    fechaSalida: '',
    huespedes: 1,
    habitaciones: 1,
  };

  constructor(
    private readonly apiService: ApiService,
    private readonly router: Router,
    private readonly route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.rellenarDesdeUrl();
    this.cargarReferencias();
  }

  ngOnDestroy(): void {
    this.queryParamsSubscription?.unsubscribe();
  }

  cambiarPestana(pestana: 'vuelos' | 'hoteles'): void {
    this.pestanaActiva = pestana;
  }

  handleSubmit(): void {
    if (!this.datosBusqueda.origen || !this.datosBusqueda.destino || !this.datosBusqueda.fechaIda) {
      return;
    }

    this.router.navigate(['/fly/search'], {
      queryParams: {
        origin: this.datosBusqueda.origen,
        destination: this.datosBusqueda.destino,
        departDate: this.datosBusqueda.fechaIda,
        returnDate: this.datosBusqueda.fechaVuelta || null,
        travelers: this.datosBusqueda.viajeros
      }
    });
  }

  handleHotelSubmit(): void {
    if (!this.datosBusquedaHotel.destino || !this.datosBusquedaHotel.fechaEntrada || !this.datosBusquedaHotel.fechaSalida) {
      return;
    }

    this.router.navigate(['/hotel/search'], {
      queryParams: {
        location: this.datosBusquedaHotel.destino,
        checkIn: this.datosBusquedaHotel.fechaEntrada,
        checkOut: this.datosBusquedaHotel.fechaSalida,
        adults: this.datosBusquedaHotel.huespedes,
        rooms: this.datosBusquedaHotel.habitaciones
      }
    });
  }

  abrirPanel(panel: 'origen' | 'destino' | 'hotelDestino'): void {
    this.panelAbierto = panel;
  }

  cerrarPanel(): void {
    window.setTimeout(() => {
      this.panelAbierto = null;
    }, 150);
  }

  buscarOpciones(panel: 'origen' | 'destino' | 'hotelDestino'): void {
    if (this.temporizadorBusqueda) {
      window.clearTimeout(this.temporizadorBusqueda);
    }

    this.limpiarValorSeleccionado(panel);

    const texto = panel === 'origen' ? this.textoOrigen 
                : panel === 'destino' ? this.textoDestino 
                : this.textoHotelDestino;

    if (texto.length < 3) {
      if (panel === 'origen') this.aeropuertosOrigen = this.aeropuertos;
      else if (panel === 'destino') this.aeropuertosDestino = this.aeropuertos;
      else if (panel === 'hotelDestino') this.ciudadesDestinoHotel = this.ciudadesHotel;
      return;
    }

    this.temporizadorBusqueda = window.setTimeout(() => {
      if (panel === 'hotelDestino') {
        this.buscarCiudades(texto);
        return;
      }

      this.buscarAeropuertos(panel, texto);
    }, 250);
  }

  seleccionarAeropuerto(panel: 'origen' | 'destino', aeropuerto: TravelpayoutsReferenceItem): void {
    const valor = this.getValorAeropuerto(aeropuerto);
    const etiqueta = this.getEtiquetaReferencia(aeropuerto);

    if (!valor) {
      return;
    }

    if (panel === 'origen') {
      this.datosBusqueda.origen = valor;
      this.textoOrigen = etiqueta;
    } else {
      this.datosBusqueda.destino = valor;
      this.textoDestino = etiqueta;
    }

    this.panelAbierto = null;
  }

  seleccionarCiudad(ciudad: TravelpayoutsReferenceItem): void {
    const valor = this.getValorCiudad(ciudad);

    if (!valor) {
      return;
    }

    this.datosBusquedaHotel.destino = valor;
    this.textoHotelDestino = this.getEtiquetaReferencia(ciudad);
    this.panelAbierto = null;
  }

  getValorAeropuerto(aeropuerto: TravelpayoutsReferenceItem): string {
    return aeropuerto.airport_code || aeropuerto.iata_code || aeropuerto.code || '';
  }

  getValorCiudad(ciudad: TravelpayoutsReferenceItem): string {
    return ciudad.city_name || ciudad.name || ciudad.name_translations?.['es'] || ciudad.name_translations?.['en'] || ciudad.city_code || ciudad.code || '';
  }

  getEtiquetaReferencia(referencia: TravelpayoutsReferenceItem): string {
    const ciudad = referencia.city_name || referencia.city_name_translations?.['es'] || referencia.city_name_translations?.['en'];
    const aeropuerto = referencia.airport_name || referencia.main_airport_name || referencia.name || referencia.name_translations?.['es'] || referencia.name_translations?.['en'] || '';
    const nombre = ciudad && aeropuerto && ciudad !== aeropuerto ? `${ciudad} - ${aeropuerto}` : ciudad || aeropuerto;
    const codigo = referencia.airport_code || referencia.iata_code || referencia.code || referencia.city_code || '';
    const pais = referencia.country_name || referencia.country_code;
    const etiquetaPais = pais ? `, ${pais}` : '';

    if (nombre && codigo) {
      return `${nombre} (${codigo})${etiquetaPais}`;
    }

    return `${nombre || codigo}${etiquetaPais}`;
  }

  getTrackReferencia(referencia: TravelpayoutsReferenceItem, indice: number): string {
    const id = referencia.airport_id || referencia.id;
    const codigo = referencia.airport_code || referencia.iata_code || referencia.code || referencia.city_code;
    const nombre = referencia.airport_name || referencia.name || referencia.city_name;

    return `${id || codigo || nombre || 'referencia'}-${indice}`;
  }

  private cargarReferencias(): void {
    this.cargandoReferencias = true;
    this.errorReferencias = '';

    forkJoin({
      aeropuertos: this.apiService.getTravelpayoutsAirports('', 'es', 50),
      ciudades: this.apiService.getTravelpayoutsCities('', 'es', 50)
    }).subscribe({
      next: ({ aeropuertos, ciudades }) => {
        this.aeropuertos = aeropuertos.filter((aeropuerto) => !!this.getValorAeropuerto(aeropuerto));
        this.ciudadesHotel = ciudades.filter((ciudad) => !!this.getValorCiudad(ciudad));
        this.aeropuertosOrigen = this.aeropuertos;
        this.aeropuertosDestino = this.aeropuertos;
        this.ciudadesDestinoHotel = this.ciudadesHotel;
      },
      error: () => {
        this.errorReferencias = 'No se pudieron cargar los datos de Travelpayouts.';
        this.cargandoReferencias = false;
      },
      complete: () => {
        this.cargandoReferencias = false;
      }
    });
  }

  private rellenarDesdeUrl(): void {
    this.queryParamsSubscription = this.route.queryParamMap.subscribe((params) => {
      const origin = params.get('origin') || params.get('origen') || '';
      const destination = params.get('destination') || params.get('destino') || '';
      const departDate = params.get('departDate') || params.get('fechaIda') || '';
      const returnDate = params.get('returnDate') || params.get('fechaVuelta') || '';
      const travelers = Number(params.get('travelers') || params.get('viajeros') || 1);
      const hotelLocation = params.get('location') || params.get('hotelDestino') || '';
      const checkIn = params.get('checkIn') || params.get('fechaEntrada') || '';
      const checkOut = params.get('checkOut') || params.get('fechaSalida') || '';
      const adults = Number(params.get('adults') || params.get('huespedes') || 1);
      const rooms = Number(params.get('rooms') || params.get('habitaciones') || 1);

      this.datosBusqueda = {
        origen: origin,
        destino: destination,
        fechaIda: departDate,
        fechaVuelta: returnDate,
        viajeros: Number.isFinite(travelers) && travelers > 0 ? travelers : 1
      };

      this.textoOrigen = origin;
      this.textoDestino = destination;

      this.datosBusquedaHotel = {
        destino: hotelLocation,
        fechaEntrada: checkIn,
        fechaSalida: checkOut,
        huespedes: Number.isFinite(adults) && adults > 0 ? adults : 1,
        habitaciones: Number.isFinite(rooms) && rooms > 0 ? rooms : 1
      };

      this.textoHotelDestino = hotelLocation;
      this.pestanaActiva = this.router.url.startsWith('/hotel/search') ? 'hoteles' : 'vuelos';
    });
  }

  private buscarAeropuertos(panel: 'origen' | 'destino', texto: string): void {
    this.apiService.getTravelpayoutsAirports(texto, 'es', 50).subscribe({
      next: (aeropuertos) => {
        const resultados = aeropuertos.filter((aeropuerto) => !!this.getValorAeropuerto(aeropuerto));

        if (panel === 'origen') {
          this.aeropuertosOrigen = resultados;
        } else {
          this.aeropuertosDestino = resultados;
        }
      },
      error: () => {
        this.errorReferencias = 'No se pudieron cargar los aeropuertos de Travelpayouts.';
      }
    });
  }

  private buscarCiudades(texto: string): void {
    this.apiService.getTravelpayoutsCities(texto, 'es', 50).subscribe({
      next: (ciudades) => {
        this.ciudadesDestinoHotel = ciudades.filter((ciudad) => !!this.getValorCiudad(ciudad));
      },
      error: () => {
        this.errorReferencias = 'No se pudieron cargar las ciudades de Travelpayouts.';
      }
    });
  }

  private limpiarValorSeleccionado(panel: 'origen' | 'destino' | 'hotelDestino'): void {
    if (panel === 'origen') {
      this.datosBusqueda.origen = '';
      return;
    }

    if (panel === 'destino') {
      this.datosBusqueda.destino = '';
      return;
    }

    this.datosBusquedaHotel.destino = '';
  }
}
