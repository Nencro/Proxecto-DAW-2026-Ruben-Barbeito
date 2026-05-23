import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { LoadingSpinnerComponent } from '../../../shared/loading-spinner/loading-spinner.component';
import { ResultadoVuelo } from '../../models/search-results.model';

@Component({
  selector: 'app-flight-results',
  standalone: true,
  imports: [CommonModule, LoadingSpinnerComponent],
  templateUrl: './flight-results.component.html',
  styleUrls: ['./flight-results.component.css']
})
export class FlightResultsComponent {
  @Input() vuelos: ResultadoVuelo[] = [];
  @Input() cargando = false;
  @Input() error = '';

  formatearFecha(valor: string): string {
    if (!valor) {
      return 'N/D';
    }

    const fecha = new Date(valor);

    if (Number.isNaN(fecha.getTime())) {
      return valor;
    }

    return new Intl.DateTimeFormat('es-ES', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(fecha);
  }

  formatearDuracion(minutos: number | null): string {
    if (minutos === null || minutos <= 0) {
      return 'Duración N/D';
    }

    const horas = Math.floor(minutos / 60);
    const minutosRestantes = minutos % 60;

    if (horas === 0) {
      return `${minutosRestantes} min`;
    }

    if (minutosRestantes === 0) {
      return `${horas} h`;
    }

    return `${horas} h ${minutosRestantes} min`;
  }
}
