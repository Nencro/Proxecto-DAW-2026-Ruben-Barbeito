import { Component, OnInit } from '@angular/core';
import { CdkTableModule } from '@angular/cdk/table';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ApiService, TravelResponse } from '../../../../services/api.service';
import { AuthService } from '../../../../services/auth.service';
import { LoadingSpinnerComponent } from '../../../shared/loading-spinner/loading-spinner.component';

@Component({
  selector: 'app-travels',
  standalone: true,
  imports: [CdkTableModule, FormsModule, LoadingSpinnerComponent, RouterLink],
  templateUrl: './travels.component.html',
  styleUrls: ['./travels.component.css']
})
export class TravelsComponent implements OnInit {
  readonly columnas = ['destino', 'pais', 'fechas', 'creador', 'participantes', 'rol'];

  viajes: TravelResponse[] = [];
  busquedaViajes = '';
  cargando = false;
  error = '';

  constructor(
    private readonly api: ApiService,
    private readonly auth: AuthService,
    private readonly router: Router,
    private readonly route: ActivatedRoute
  ) {
  }

  ngOnInit(): void {
    this.route.queryParamMap.subscribe((params) => {
      this.busquedaViajes = params.get('query')?.trim() ?? '';
    });

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

  get viajesFiltrados(): TravelResponse[] {
    const busqueda = this.normalizarTexto(this.busquedaViajes);

    if (!busqueda) {
      return this.viajes;
    }

    return this.viajes.filter((viaje) => {
      const destino = this.normalizarTexto(viaje.destino);
      const pais = this.normalizarTexto(viaje.pais);

      return destino.includes(busqueda) || pais.includes(busqueda);
    });
  }

  abrirDetalle(viaje: TravelResponse): void {
    this.router.navigate(['/travels/details', viaje.id]);
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

  private normalizarTexto(valor: string): string {
    return valor
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .trim();
  }
}
