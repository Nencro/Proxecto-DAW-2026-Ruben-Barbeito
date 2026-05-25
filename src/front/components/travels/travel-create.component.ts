import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { ApiService, DuffelReferenceItem, RestCountryResponse, TravelCreateRequest } from '../../services/api.service';
import { AuthService } from '../../services/auth.service';

interface TravelDestinationSuggestion {
  id: string;
  destino: string;
  pais: string;
  codigoPais: string;
  aeropuerto: string;
}

interface CountrySuggestion {
  code: string;
  name: string;
  label: string;
}

@Component({
  selector: 'app-travel-create',
  standalone: true,
  imports: [FormsModule, RouterLink],
  templateUrl: './travel-create.component.html',
  styleUrls: ['./travel-create.component.css']
})
export class TravelCreateComponent implements OnInit {
  viaje: TravelCreateRequest = {
    destino: '',
    pais: '',
    codigoPais: '',
    descripcion: '',
    fechaInicio: '',
    fechaFin: ''
  };

  enviando = false;
  cargandoSugerencias = false;
  mostrarSugerencias = false;
  mostrarSugerenciasPais = false;
  paisBusqueda = '';
  sugerenciasDestino: TravelDestinationSuggestion[] = [];
  sugerenciasPais: CountrySuggestion[] = [];
  error = '';
  private countries: CountrySuggestion[] = [];
  private countriesByCode = new Map<string, string>();
  private destinoSearchTimeout: ReturnType<typeof setTimeout> | null = null;

  constructor(
    private readonly api: ApiService,
    private readonly auth: AuthService,
    private readonly router: Router
  ) {
  }

  ngOnInit(): void {
    this.api.getRestCountries().subscribe({
      next: (paises) => {
        this.countries = paises
          .map((pais) => {
            const code = pais.cca2.toUpperCase();
            const name = this.getNombrePais(pais);

            return {
              code,
              name,
              label: this.formatearPais(name, code)
            };
          })
          .sort((a, b) => a.name.localeCompare(b.name, 'es'));
        this.countriesByCode = new Map(
          this.countries.map((pais) => [pais.code, pais.name])
        );
      },
      error: () => {
        this.countries = [];
        this.countriesByCode = new Map();
      }
    });
  }

  buscarDestinos(): void {
    if (this.destinoSearchTimeout) {
      clearTimeout(this.destinoSearchTimeout);
    }

    this.destinoSearchTimeout = setTimeout(() => {
      const busqueda = this.viaje.destino.trim();

      if (busqueda.length < 2) {
        this.sugerenciasDestino = [];
        this.mostrarSugerencias = false;
        return;
      }

      this.cargandoSugerencias = true;
      this.mostrarSugerencias = true;

      this.api.getDuffelAirports(busqueda, 20).subscribe({
        next: (referencias) => {
          this.sugerenciasDestino = this.normalizarSugerencias(referencias);
          this.cargandoSugerencias = false;
        },
        error: () => {
          this.sugerenciasDestino = [];
          this.cargandoSugerencias = false;
        }
      });
    }, 250);
  }

  seleccionarDestino(sugerencia: TravelDestinationSuggestion): void {
    this.viaje.destino = sugerencia.destino;
    this.viaje.pais = sugerencia.pais;
    this.viaje.codigoPais = sugerencia.codigoPais;
    this.paisBusqueda = this.formatearPais(sugerencia.pais, sugerencia.codigoPais);
    this.sugerenciasDestino = [];
    this.mostrarSugerencias = false;
  }

  buscarPaises(): void {
    const busqueda = this.normalizarTexto(this.paisBusqueda);
    this.viaje.pais = '';
    this.viaje.codigoPais = '';

    if (busqueda.length < 2) {
      this.sugerenciasPais = [];
      this.mostrarSugerenciasPais = false;
      return;
    }

    this.sugerenciasPais = this.countries
      .filter((pais) => {
        const name = this.normalizarTexto(pais.name);
        const code = this.normalizarTexto(pais.code);

        return name.includes(busqueda) || code.includes(busqueda);
      })
      .slice(0, 8);
    this.mostrarSugerenciasPais = true;
  }

  seleccionarPais(pais: CountrySuggestion): void {
    this.viaje.pais = pais.name;
    this.viaje.codigoPais = pais.code;
    this.paisBusqueda = pais.label;
    this.sugerenciasPais = [];
    this.mostrarSugerenciasPais = false;
  }

  ocultarSugerenciasDestino(): void {
    window.setTimeout(() => {
      this.mostrarSugerencias = false;
    }, 140);
  }

  ocultarSugerenciasPais(): void {
    window.setTimeout(() => {
      this.mostrarSugerenciasPais = false;
    }, 140);
  }

  crearViaje(): void {
    this.error = '';

    if (!this.viaje.destino.trim() || !this.viaje.pais.trim() || !this.viaje.codigoPais?.trim() || !this.viaje.fechaInicio || !this.viaje.fechaFin) {
      this.error = 'Completa destino, país, código de país y fechas para crear el viaje.';
      return;
    }

    if (this.viaje.fechaFin < this.viaje.fechaInicio) {
      this.error = 'La fecha de fin no puede ser anterior a la fecha de inicio.';
      return;
    }

    this.enviando = true;

    this.api.createTravel({
      destino: this.viaje.destino.trim(),
      pais: this.viaje.pais.trim(),
      codigoPais: this.viaje.codigoPais?.trim().toUpperCase(),
      descripcion: this.viaje.descripcion.trim(),
      fechaInicio: this.viaje.fechaInicio,
      fechaFin: this.viaje.fechaFin
    }, this.auth.getToken()).subscribe({
      next: () => {
        this.router.navigate(['/travels']);
      },
      error: () => {
        this.error = 'No se pudo crear el viaje.';
        this.enviando = false;
      }
    });
  }

  private normalizarSugerencias(referencias: DuffelReferenceItem[]): TravelDestinationSuggestion[] {
    const destinos = new Map<string, TravelDestinationSuggestion>();

    for (const referencia of referencias) {
      const destino = this.getCiudadReferencia(referencia);
      const codigoPais = (referencia.country_code || '').toUpperCase();

      if (!destino || !codigoPais) {
        continue;
      }

      const pais = this.countriesByCode.get(codigoPais) || referencia.country_name || codigoPais;
      const key = `${this.normalizarTexto(destino)}-${codigoPais}`;

      if (!destinos.has(key)) {
        destinos.set(key, {
          id: referencia.id || referencia.code || key,
          destino,
          pais,
          codigoPais,
          aeropuerto: referencia.airport_name || referencia.name || referencia.code || ''
        });
      }
    }

    return Array.from(destinos.values()).slice(0, 8);
  }

  private getCiudadReferencia(referencia: DuffelReferenceItem): string {
    return referencia.city_name || referencia.name || referencia.airport_name || '';
  }

  private getNombrePais(pais: RestCountryResponse): string {
    return pais.translations?.spa?.common || pais.name.common || pais.cca2;
  }

  private formatearPais(nombre: string, codigo: string): string {
    return `${nombre} (${codigo})`;
  }

  private normalizarTexto(valor: string): string {
    return valor
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .trim();
  }
}
