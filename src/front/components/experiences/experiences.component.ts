import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ApiService, ExperienceResponse } from '../../services/api.service';
import { AuthService } from '../../services/auth.service';
import { LoadingSpinnerComponent } from '../shared/loading-spinner/loading-spinner.component';

@Component({
  selector: 'app-experiences',
  standalone: true,
  imports: [FormsModule, LoadingSpinnerComponent, RouterLink],
  templateUrl: './experiences.component.html',
  styleUrls: ['./experiences.component.css']
})
export class ExperiencesComponent implements OnInit {
  experiences: ExperienceResponse[] = [];
  nombre = '';
  localidad = '';
  pais = '';
  soloMias = false;
  cargando = false;
  error = '';

  constructor(
    private readonly api: ApiService,
    private readonly auth: AuthService
  ) {
  }

  ngOnInit(): void {
    this.buscar();
  }

  get puedeCrearExperiencias(): boolean {
    const roles = this.auth.getUser()?.roles ?? [];
    return roles.includes('EMPRESA') || roles.includes('ADMIN');
  }

  buscar(): void {
    this.cargando = true;
    this.error = '';

    this.api.getExperiences(this.nombre, this.pais, this.soloMias, this.auth.getToken(), this.localidad).subscribe({
      next: (experiences) => {
        this.experiences = experiences;
        this.cargando = false;
      },
      error: () => {
        this.error = 'No pudo realizarse la carga de datos.';
        this.cargando = false;
      }
    });
  }

  limpiar(): void {
    this.nombre = '';
    this.localidad = '';
    this.pais = '';
    this.soloMias = false;
    this.buscar();
  }

  getImage(experience: ExperienceResponse): string {
    return experience.imagen || 'assets/sin_imagen.png';
  }

  getGroupSize(experience: ExperienceResponse): string {
    if (experience.tamanioMinimo === experience.tamanioMaximo) {
      return `${experience.tamanioMinimo} personas`;
    }

    return `${experience.tamanioMinimo} - ${experience.tamanioMaximo} personas`;
  }

  getPrice(experience: ExperienceResponse): string {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR'
    }).format(experience.precio);
  }

  getDuration(experience: ExperienceResponse): string {
    const minutes = experience.duracionMinutos;
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;

    if (!hours) {
      return `${minutes} min`;
    }

    if (!remainingMinutes) {
      return `${hours} h`;
    }

    return `${hours} h ${remainingMinutes} min`;
  }

}
