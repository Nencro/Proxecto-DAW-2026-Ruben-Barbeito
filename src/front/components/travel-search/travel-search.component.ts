import { OverlayModule } from '@angular/cdk/overlay';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { ApiService, DuffelReferenceItem } from '../../services/api.service';

export interface DatosBusqueda {
  origen: string;
  destino: string;
  fechaIda: string;
  fechaVuelta: string;
  viajeros: number;
}

@Component({
  selector: 'app-travel-search',
  standalone: true,
  imports: [FormsModule, OverlayModule],
  templateUrl: './travel-search.component.html',
  styleUrls: ['./travel-search.component.css']
})
export class TravelSearchComponent implements OnInit, OnDestroy {
  aeropuertosOrigen: DuffelReferenceItem[] = [];
  aeropuertosDestino: DuffelReferenceItem[] = [];
  textoOrigen = '';
  textoDestino = '';
  panelAbierto: 'origen' | 'destino' | null = null;
  cargandoReferencias = false;
  errorReferencias = '';
  intentoBuscarVuelos = false;
  private temporizadorBusqueda?: number;
  private queryParamsSubscription?: Subscription;

  datosBusqueda: DatosBusqueda = {
    origen: '',
    destino: '',
    fechaIda: '',
    fechaVuelta: '',
    viajeros: 1
  };

  constructor(
    private readonly apiService: ApiService,
    private readonly router: Router,
    private readonly route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.rellenarDesdeUrl();
  }

  ngOnDestroy(): void {
    this.queryParamsSubscription?.unsubscribe();
  }

  handleSubmit(): void {
    this.intentoBuscarVuelos = true;

    if (!this.datosBusqueda.origen || !this.datosBusqueda.destino || !this.datosBusqueda.fechaIda || this.fechaVueltaAnteriorAIda()) {
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

  campoVueloInvalido(campo: 'origen' | 'destino' | 'fechaIda' | 'fechaVuelta'): boolean {
    if (!this.intentoBuscarVuelos) {
      return false;
    }

    if (campo === 'origen') {
      return !this.datosBusqueda.origen;
    }

    if (campo === 'destino') {
      return !this.datosBusqueda.destino;
    }

    if (campo === 'fechaIda') {
      return !this.datosBusqueda.fechaIda || this.fechaVueltaAnteriorAIda();
    }

    return this.fechaVueltaAnteriorAIda();
  }

  abrirPanel(panel: 'origen' | 'destino'): void {
    this.panelAbierto = panel;
  }

  reiniciarCampoSeleccionado(panel: 'origen' | 'destino'): void {
    if (!this.tieneValorSeleccionado(panel)) {
      return;
    }

    if (panel === 'origen') {
      this.textoOrigen = '';
      this.aeropuertosOrigen = [];
    } else {
      this.textoDestino = '';
      this.aeropuertosDestino = [];
    }

    this.limpiarValorSeleccionado(panel);
  }

  cerrarPanel(): void {
    window.setTimeout(() => {
      this.panelAbierto = null;
    }, 150);
  }

  buscarOpciones(panel: 'origen' | 'destino'): void {
    if (this.temporizadorBusqueda) {
      window.clearTimeout(this.temporizadorBusqueda);
    }

    this.limpiarValorSeleccionado(panel);

    const texto = panel === 'origen' ? this.textoOrigen : this.textoDestino;

    if (texto.length < 3) {
      if (panel === 'origen') {
        this.aeropuertosOrigen = [];
      } else {
        this.aeropuertosDestino = [];
      }
      return;
    }

    this.temporizadorBusqueda = window.setTimeout(() => {
      this.buscarAeropuertos(panel, texto);
    }, 250);
  }

  seleccionarAeropuerto(panel: 'origen' | 'destino', aeropuerto: DuffelReferenceItem): void {
    const valor = this.getValorAeropuerto(aeropuerto);
    const etiqueta = this.getEtiquetaAeropuertoSeleccionado(aeropuerto) || this.getEtiquetaReferencia(aeropuerto);

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

    this.intentoBuscarVuelos = false;
    this.panelAbierto = null;
  }

  getValorAeropuerto(aeropuerto: DuffelReferenceItem): string {
    return aeropuerto.airport_code || aeropuerto.iata_code || aeropuerto.code || '';
  }

  getEtiquetaReferencia(referencia: DuffelReferenceItem): string {
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

  getCiudadReferencia(referencia: DuffelReferenceItem): string {
    return referencia.city_name
      || referencia.city_name_translations?.['es']
      || referencia.city_name_translations?.['en']
      || referencia.name
      || '';
  }

  getEtiquetaAeropuertoSeleccionado(referencia: DuffelReferenceItem): string {
    const ciudad = this.getCiudadReferencia(referencia);
    const codigo = referencia.airport_code || referencia.iata_code || referencia.code || '';

    if (ciudad && codigo) {
      return `${ciudad} (${codigo})`;
    }

    return ciudad || codigo;
  }

  getTrackReferencia(referencia: DuffelReferenceItem, indice: number): string {
    const id = referencia.airport_id || referencia.id;
    const codigo = referencia.airport_code || referencia.iata_code || referencia.code || referencia.city_code;
    const nombre = referencia.airport_name || referencia.name || referencia.city_name;

    return `${id || codigo || nombre || 'referencia'}-${indice}`;
  }

  fechaVueltaAnteriorAIda(): boolean {
    if (!this.datosBusqueda.fechaIda || !this.datosBusqueda.fechaVuelta) {
      return false;
    }

    return this.datosBusqueda.fechaVuelta < this.datosBusqueda.fechaIda;
  }

  private rellenarDesdeUrl(): void {
    this.queryParamsSubscription = this.route.queryParamMap.subscribe((params) => {
      const origin = params.get('origin') || params.get('origen') || '';
      const destination = params.get('destination') || params.get('destino') || '';
      const departDate = params.get('departDate') || params.get('fechaIda') || '';
      const returnDate = params.get('returnDate') || params.get('fechaVuelta') || '';
      const travelers = Number(params.get('travelers') || params.get('viajeros') || 1);

      this.datosBusqueda = {
        origen: origin,
        destino: destination,
        fechaIda: departDate,
        fechaVuelta: returnDate,
        viajeros: Number.isFinite(travelers) && travelers > 0 ? travelers : 1
      };

      this.textoOrigen = origin;
      this.textoDestino = destination;
      this.rellenarReferenciasDesdeUrl(origin, destination);
    });
  }

  private rellenarReferenciasDesdeUrl(origin: string, destination: string): void {
    if (origin) {
      this.cargarAeropuertoSeleccionado('origen', origin);
    }

    if (destination) {
      this.cargarAeropuertoSeleccionado('destino', destination);
    }
  }

  private buscarAeropuertos(panel: 'origen' | 'destino', texto: string): void {
    this.apiService.getDuffelAirports(texto, 50).subscribe({
      next: (aeropuertos) => {
        const resultados = aeropuertos.filter((aeropuerto) => !!this.getValorAeropuerto(aeropuerto));

        if (panel === 'origen') {
          this.aeropuertosOrigen = resultados;
        } else {
          this.aeropuertosDestino = resultados;
        }
      },
      error: () => {
        this.errorReferencias = 'No pudo realizarse la carga de datos.';
      }
    });
  }

  private cargarAeropuertoSeleccionado(panel: 'origen' | 'destino', valorActual: string): void {
    this.apiService.getDuffelAirports(valorActual, 50).subscribe({
      next: (aeropuertos) => {
        const resultados = aeropuertos.filter((aeropuerto) => !!this.getValorAeropuerto(aeropuerto));
        const seleccionado = this.buscarReferenciaExacta(resultados, valorActual) || resultados[0];

        if (panel === 'origen') {
          this.aeropuertosOrigen = resultados;
        } else {
          this.aeropuertosDestino = resultados;
        }

        if (!seleccionado) {
          return;
        }

        const valor = this.getValorAeropuerto(seleccionado);
        const etiqueta = this.getEtiquetaReferencia(seleccionado);

        if (panel === 'origen') {
          this.datosBusqueda.origen = valor || valorActual;
          this.textoOrigen = this.getEtiquetaAeropuertoSeleccionado(seleccionado) || etiqueta || valorActual;
        } else {
          this.datosBusqueda.destino = valor || valorActual;
          this.textoDestino = this.getEtiquetaAeropuertoSeleccionado(seleccionado) || etiqueta || valorActual;
        }
      },
      error: () => {
        this.errorReferencias = 'No pudo realizarse la carga de datos.';
      }
    });
  }

  private limpiarValorSeleccionado(panel: 'origen' | 'destino'): void {
    if (panel === 'origen') {
      this.datosBusqueda.origen = '';
      return;
    }

    this.datosBusqueda.destino = '';
  }

  private tieneValorSeleccionado(panel: 'origen' | 'destino'): boolean {
    if (panel === 'origen') {
      return !!this.datosBusqueda.origen;
    }

    return !!this.datosBusqueda.destino;
  }

  private buscarReferenciaExacta(referencias: DuffelReferenceItem[], valor: string): DuffelReferenceItem | undefined {
    const valorNormalizado = valor.trim().toLowerCase();

    return referencias.find((referencia) => {
      return [
        referencia.airport_code,
        referencia.iata_code,
        referencia.code,
        referencia.city_code,
        referencia.city_name,
        referencia.name,
        referencia.airport_name,
        referencia.main_airport_name
      ].some((campo) => campo?.trim().toLowerCase() === valorNormalizado);
    });
  }
}
