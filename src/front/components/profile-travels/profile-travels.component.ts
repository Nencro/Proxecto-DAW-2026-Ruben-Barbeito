import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

interface ViajePerfil {
  id: string;
  destino: string;
  fechas: string;
  estado: string;
}

@Component({
  selector: 'app-profile-travels',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './profile-travels.component.html',
  styleUrls: ['./profile-travels.component.css']
})
export class ProfileTravelsComponent {
  viajes: ViajePerfil[] = [
    {
      id: 'EXP-1024',
      destino: 'Lisboa',
      fechas: '12 jun. 2026 - 16 jun. 2026',
      estado: 'Reservado'
    },
    {
      id: 'EXP-0987',
      destino: 'Roma',
      fechas: '02 ago. 2026 - 08 ago. 2026',
      estado: 'Pendiente'
    }
  ];
}
