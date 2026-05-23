import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [FormsModule, RouterLink],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent {
  textoBusqueda = '';
  menuMovilAbierto = false;

  constructor(
    public servicioAuth: AuthService,
    private readonly router: Router
  ) {
  }

  search(): void {
    const query = this.textoBusqueda.trim();

    if (!this.servicioAuth.estaAutenticado() || !query) {
      return;
    }

    this.router.navigate(['/search'], {
      queryParams: {
        query
      }
    });

    this.cerrarMenuMovil();
  }

  alternarMenuMovil(): void {
    this.menuMovilAbierto = !this.menuMovilAbierto;
  }

  cerrarMenuMovil(): void {
    this.menuMovilAbierto = false;
  }
}
