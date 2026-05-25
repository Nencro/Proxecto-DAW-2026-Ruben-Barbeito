import { CommonModule } from '@angular/common';
import { Dialog, DialogModule } from '@angular/cdk/dialog';
import { Component, Input } from '@angular/core';
import { LoadingSpinnerComponent } from '../../../shared/loading-spinner/loading-spinner.component';
import { ResultadoVuelo } from '../../models/search-results.model';
import { AddFlightToTravelComponent } from '../add-flight-to-travel/add-flight-to-travel.component';

@Component({
  selector: 'app-flight-results',
  standalone: true,
  imports: [CommonModule, DialogModule, LoadingSpinnerComponent],
  templateUrl: './flight-results.component.html',
  styleUrls: ['./flight-results.component.css']
})
export class FlightResultsComponent {
  @Input() vuelos: ResultadoVuelo[] = [];
  @Input() cargando = false;
  @Input() error = '';

  constructor(private readonly dialog: Dialog) {
  }

  abrirModalAnadir(vuelo: ResultadoVuelo): void {
    this.dialog.open(AddFlightToTravelComponent, {
      data: vuelo,
      width: 'min(calc(100vw - 32px), 760px)',
      maxHeight: '86vh',
      hasBackdrop: true,
      panelClass: 'add-flight-dialog-panel',
      backdropClass: 'add-experience-dialog-backdrop'
    });
  }

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
