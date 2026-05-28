import { DIALOG_DATA, DialogRef } from '@angular/cdk/dialog';
import { Component, Inject, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ApiService, TravelResponse } from '../../../../services/api.service';
import { AuthService } from '../../../../services/auth.service';
import { LoadingSpinnerComponent } from '../../../shared/loading-spinner/loading-spinner.component';
import { ResultadoVuelo } from '../../models/search-results.model';

@Component({
  selector: 'app-add-flight-to-travel',
  standalone: true,
  imports: [LoadingSpinnerComponent, RouterLink],
  templateUrl: './add-flight-to-travel.component.html',
  styleUrls: ['./add-flight-to-travel.component.css']
})
export class AddFlightToTravelComponent implements OnInit {
  viajes: TravelResponse[] = [];
  cargando = false;
  guardandoViajeId: number | null = null;
  error = '';
  codigoPaisDestino = '';
  tieneViajes = false;
  necesitaLogin = false;

  constructor(
    @Inject(DIALOG_DATA) public readonly vuelo: ResultadoVuelo,
    private readonly dialogRef: DialogRef<void>,
    private readonly api: ApiService,
    private readonly auth: AuthService
  ) {
  }

  ngOnInit(): void {
    if (!this.auth.validateSession()) {
      this.necesitaLogin = true;
      return;
    }

    this.codigoPaisDestino = (this.vuelo.codigoPaisDestino || '').toUpperCase();

    if (this.codigoPaisDestino) {
      this.cargarViajes();
      return;
    }

    this.resolverPaisDestino();
  }

  cerrar(): void {
    this.dialogRef.close();
  }

  anadirPrecio(viaje: TravelResponse): void {
    if (this.vuelo.precio === null || this.guardandoViajeId) {
      return;
    }

    this.error = '';
    this.guardandoViajeId = viaje.id;

    this.api.updateTravel(viaje.id, {
      descripcion: viaje.descripcion || '',
      fechaInicio: viaje.fechaInicio,
      fechaFin: viaje.fechaFin,
      costeBillete: this.vuelo.precio
    }, this.auth.getToken()).subscribe({
      next: () => {
        this.dialogRef.close();
      },
      error: () => {
        this.error = 'No pudo completarse la operación.';
        this.guardandoViajeId = null;
      }
    });
  }

  formatearPrecio(): string {
    return this.vuelo.precio !== null
      ? `${this.vuelo.precio} ${this.vuelo.moneda || 'EUR'}`
      : 'Precio no disponible';
  }

  getParametrosCrearViaje(): Record<string, string | number> {
    const parametros: Record<string, string | number> = {
      destino: this.vuelo.destino || '',
      codigoPais: this.codigoPaisDestino,
      fechaInicio: this.formatearFechaConsulta(this.vuelo.salida),
      fechaFin: this.formatearFechaConsulta(this.vuelo.vuelta || this.vuelo.salida)
    };

    if (this.vuelo.precio !== null) {
      parametros['costeBillete'] = this.vuelo.precio;
    }

    return parametros;
  }

  formatearFecha(valor: string): string {
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

  getFechas(viaje: TravelResponse): string {
    const inicio = this.formatearFecha(viaje.fechaInicio);
    const fin = this.formatearFecha(viaje.fechaFin);
    return inicio === fin ? inicio : `${inicio} - ${fin}`;
  }

  private resolverPaisDestino(): void {
    this.cargando = true;
    this.api.getDuffelAirports(this.vuelo.destino, 50).subscribe({
      next: (aeropuertos) => {
        const aeropuerto = aeropuertos.find((item) => {
          return [item.airport_code, item.iata_code, item.code]
            .some((codigo) => codigo?.trim().toUpperCase() === this.vuelo.destino.trim().toUpperCase());
        }) || aeropuertos[0];

        this.codigoPaisDestino = (aeropuerto?.country_code || '').toUpperCase();
        this.cargarViajes();
      },
      error: () => {
        this.error = 'No pudo realizarse la carga de datos.';
        this.cargando = false;
      }
    });
  }

  private cargarViajes(): void {
    this.cargando = true;
    this.api.getTravels(this.auth.getToken()).subscribe({
      next: (viajes) => {
        this.tieneViajes = viajes.length > 0;
        this.viajes = viajes.filter((viaje) => this.esViajeValido(viaje));
        this.cargando = false;
      },
      error: () => {
        this.error = 'No pudo realizarse la carga de datos.';
        this.cargando = false;
      }
    });
  }

  private esViajeValido(viaje: TravelResponse): boolean {
    const hoy = this.formatearFechaInput(new Date());
    return viaje.codigoPais?.toUpperCase() === this.codigoPaisDestino && viaje.fechaInicio >= hoy;
  }

  private formatearFechaInput(fecha: Date): string {
    const year = fecha.getFullYear();
    const month = String(fecha.getMonth() + 1).padStart(2, '0');
    const day = String(fecha.getDate()).padStart(2, '0');

    return `${year}-${month}-${day}`;
  }

  private formatearFechaConsulta(valor: string): string {
    if (!valor) {
      return '';
    }

    const fecha = new Date(valor);

    if (Number.isNaN(fecha.getTime())) {
      return valor.slice(0, 10);
    }

    return this.formatearFechaInput(fecha);
  }
}
