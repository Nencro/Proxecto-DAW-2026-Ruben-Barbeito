import { Component } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';

export interface CriteriosBusqueda {
  destino: string;
  fechaIda: string;
  fechaVuelta: string;
}

@Component({
  selector: 'app-search',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.css']
})
export class SearchComponent {
  criterios: CriteriosBusqueda = {
    destino: '',
    fechaIda: '',
    fechaVuelta: ''
  };

  constructor(private readonly route: ActivatedRoute) {
    this.route.queryParamMap.subscribe((params) => {
      this.criterios = {
        destino: params.get('destino') || '',
        fechaIda: params.get('fechaIda') || '',
        fechaVuelta: params.get('fechaVuelta') || ''
      };
    });
  }
}
