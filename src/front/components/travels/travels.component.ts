import { Component, OnInit } from '@angular/core';
import { CdkTableModule } from '@angular/cdk/table';
import { RouterLink } from '@angular/router';
import { ApiService, TravelResponse } from '../../services/api.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-travels',
  standalone: true,
  imports: [CdkTableModule, RouterLink],
  templateUrl: './travels.component.html',
  styleUrls: ['./travels.component.css']
})
export class TravelsComponent implements OnInit {
  readonly columnas = ['id', 'destino', 'pais', 'fechas', 'creador', 'rol'];

  viajes: TravelResponse[] = [];
  cargando = false;
  error = '';

  constructor(
    private readonly api: ApiService,
    private readonly auth: AuthService
  ) {
  }

  ngOnInit(): void {
    this.cargarViajes();
  }

  cargarViajes(): void {
    this.cargando = true;
    this.error = '';

    this.api.getTravels(this.auth.getToken()).subscribe({
      next: (viajes) => {
        this.viajes = viajes;
        this.cargando = false;
      },
      error: () => {
        this.error = 'No se pudieron cargar tus viajes.';
        this.cargando = false;
      }
    });
  }

  getRolLegible(viaje: TravelResponse): string {
    return viaje.rolEnViaje === 'CREADOR' ? 'Creador' : 'Participante';
  }

  getFechas(viaje: TravelResponse): string {
    const inicio = this.formatearFecha(viaje.fechaInicio);
    const fin = this.formatearFecha(viaje.fechaFin);

    if (!inicio && !fin) {
      return '-';
    }

    if (inicio === fin || !fin) {
      return inicio;
    }

    return `${inicio} - ${fin}`;
  }

  private formatearFecha(valor: string): string {
    if (!valor) {
      return '';
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
}
