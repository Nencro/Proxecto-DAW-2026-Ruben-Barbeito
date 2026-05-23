import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { ApiService, TravelCreateRequest } from '../../services/api.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-travel-create',
  standalone: true,
  imports: [FormsModule, RouterLink],
  templateUrl: './travel-create.component.html',
  styleUrls: ['./travel-create.component.css']
})
export class TravelCreateComponent {
  viaje: TravelCreateRequest = {
    destino: '',
    pais: '',
    descripcion: '',
    fechaInicio: '',
    fechaFin: ''
  };

  enviando = false;
  error = '';

  constructor(
    private readonly api: ApiService,
    private readonly auth: AuthService,
    private readonly router: Router
  ) {
  }

  crearViaje(): void {
    this.error = '';

    if (!this.viaje.destino.trim() || !this.viaje.pais.trim() || !this.viaje.fechaInicio || !this.viaje.fechaFin) {
      this.error = 'Completa destino, pais y fechas para crear el viaje.';
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
}
