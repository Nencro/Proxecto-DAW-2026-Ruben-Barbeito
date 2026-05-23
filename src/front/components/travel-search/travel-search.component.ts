import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CarouselComponent } from '../carousel/carousel.component';

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
  imports: [FormsModule, CarouselComponent],
  templateUrl: './travel-search.component.html',
  styleUrls: ['./travel-search.component.css']
})
export class TravelSearchComponent {
  datosBusqueda: DatosBusqueda = {
    origen: '',
    destino: '',
    fechaIda: '',
    fechaVuelta: '',
    viajeros: 1,
  };

  handleSubmit(): void {
    console.log('Buscando viajes con los siguientes datos:', this.datosBusqueda);
  }
}
