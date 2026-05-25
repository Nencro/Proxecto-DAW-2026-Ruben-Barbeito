import { DIALOG_DATA, DialogRef } from '@angular/cdk/dialog';
import { Component, Inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ApiService, ExperienceResponse, TravelResponse } from '../../services/api.service';
import { AuthService } from '../../services/auth.service';
import { LoadingSpinnerComponent } from '../shared/loading-spinner/loading-spinner.component';

interface TravelOptionState {
  fecha: string;
  hora: string;
  guardando: boolean;
  mensaje: string;
  error: string;
}

@Component({
  selector: 'app-add-experiencia',
  standalone: true,
  imports: [FormsModule, LoadingSpinnerComponent],
  templateUrl: './add-experiencia.component.html',
  styleUrls: ['./add-experiencia.component.css']
})
export class AddExperienciaComponent implements OnInit {
  viajes: TravelResponse[] = [];
  estados = new Map<number, TravelOptionState>();
  cargando = false;
  error = '';

  constructor(
    @Inject(DIALOG_DATA) public readonly experience: ExperienceResponse,
    private readonly dialogRef: DialogRef<void>,
    private readonly api: ApiService,
    private readonly auth: AuthService
  ) {
  }

  ngOnInit(): void {
    if (!this.auth.validateSession()) {
      this.error = 'Inicia sesión para añadir experiencias a tus viajes.';
      return;
    }

    this.cargando = true;
    this.api.getTravels(this.auth.getToken()).subscribe({
      next: (viajes) => {
        this.viajes = viajes.filter((viaje) => this.esViajeValido(viaje));
        this.viajes.forEach((viaje) => {
          this.estados.set(viaje.id, {
            fecha: this.getDiasViaje(viaje)[0] || viaje.fechaInicio,
            hora: '',
            guardando: false,
            mensaje: '',
            error: ''
          });
        });
        this.cargando = false;
      },
      error: () => {
        this.error = 'No se pudieron cargar tus viajes.';
        this.cargando = false;
      }
    });
  }

  cerrar(): void {
    this.dialogRef.close();
  }

  getEstado(viaje: TravelResponse): TravelOptionState {
    let estado = this.estados.get(viaje.id);

    if (!estado) {
      estado = {
        fecha: viaje.fechaInicio,
        hora: '',
        guardando: false,
        mensaje: '',
        error: ''
      };
      this.estados.set(viaje.id, estado);
    }

    return estado;
  }

  getDiasViaje(viaje: TravelResponse): string[] {
    const inicio = new Date(`${viaje.fechaInicio}T00:00:00`);
    const fin = new Date(`${viaje.fechaFin}T00:00:00`);

    if (Number.isNaN(inicio.getTime()) || Number.isNaN(fin.getTime()) || fin < inicio) {
      return viaje.fechaInicio ? [viaje.fechaInicio] : [];
    }

    const dias: string[] = [];
    const diaActual = new Date(inicio);

    while (diaActual <= fin) {
      dias.push(this.formatearFechaInput(diaActual));
      diaActual.setDate(diaActual.getDate() + 1);
    }

    return dias;
  }

  anadirExperiencia(viaje: TravelResponse): void {
    const estado = this.getEstado(viaje);
    estado.error = '';
    estado.mensaje = '';

    if (!estado.fecha || !estado.hora) {
      estado.error = 'Selecciona fecha y hora.';
      return;
    }

    estado.guardando = true;
    this.api.createTravelActivity(viaje.id, {
      fecha: estado.fecha,
      hora: estado.hora,
      coste: this.experience.precio,
      descripcion: this.experience.nombre
    }, this.auth.getToken()).subscribe({
      next: () => {
        estado.guardando = false;
        estado.mensaje = 'Experiencia añadida al viaje.';
        this.dialogRef.close();
      },
      error: () => {
        estado.guardando = false;
        estado.error = 'No se pudo añadir la experiencia.';
      }
    });
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

  private esViajeValido(viaje: TravelResponse): boolean {
    const hoy = this.formatearFechaInput(new Date());
    return viaje.codigoPais === this.experience.codigoPais && viaje.fechaInicio >= hoy;
  }

  private formatearFechaInput(fecha: Date): string {
    const year = fecha.getFullYear();
    const month = String(fecha.getMonth() + 1).padStart(2, '0');
    const day = String(fecha.getDate()).padStart(2, '0');

    return `${year}-${month}-${day}`;
  }
}
