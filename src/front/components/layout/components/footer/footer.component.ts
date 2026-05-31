import { Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../../../services/auth.service';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.css']
})
export class FooterComponent implements OnInit {
  seccionAbierta: string | null = null;

  constructor(public servicioAuth: AuthService) {
  }

  ngOnInit(): void {
    this.servicioAuth.clearExpiredSession();
  }

  get autenticado(): boolean {
    return this.servicioAuth.estaAutenticado();
  }

  alternarSeccion(seccion: string): void {
    this.seccionAbierta = this.seccionAbierta === seccion ? null : seccion;
  }

  seccionEstaAbierta(seccion: string): boolean {
    return this.seccionAbierta === seccion;
  }
}
