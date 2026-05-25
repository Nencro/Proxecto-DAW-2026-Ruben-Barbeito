import { Component, HostListener, OnInit } from '@angular/core';
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
export class HeaderComponent implements OnInit {
  textoBusqueda = '';
  menuMovilAbierto = false;
  perfilMenuAbierto = false;

  constructor(
    public servicioAuth: AuthService,
    private readonly router: Router
  ) {
  }

  ngOnInit(): void {
    this.servicioAuth.clearExpiredSession();
  }

  get autenticado(): boolean {
    return this.servicioAuth.estaAutenticado();
  }

  get nombreUsuario(): string {
    const usuario = this.servicioAuth.getUser();
    return usuario?.userName || '';
  }

  search(): void {
    const query = this.textoBusqueda.trim();

    if (!this.autenticado || !query) {
      return;
    }

    this.router.navigate(['/travels'], {
      queryParams: {
        query
      }
    });

    this.cerrarMenuMovil();
  }

  alternarMenuMovil(): void {
    this.menuMovilAbierto = !this.menuMovilAbierto;
    this.perfilMenuAbierto = false;
  }

  cerrarMenuMovil(): void {
    this.menuMovilAbierto = false;
  }

  alternarMenuPerfil(): void {
    this.perfilMenuAbierto = !this.perfilMenuAbierto;
    this.menuMovilAbierto = false;
  }

  cerrarMenuPerfil(): void {
    this.perfilMenuAbierto = false;
  }

  logout(): void {
    this.servicioAuth.logout();
    this.perfilMenuAbierto = false;
    this.menuMovilAbierto = false;
    this.router.navigate(['/login']);
  }

  @HostListener('document:click', ['$event'])
  cerrarMenusAlHacerClickFuera(event: MouseEvent): void {
    const target = event.target as HTMLElement | null;

    if (!target) {
      return;
    }

    if (!target.closest('.profile-menu')) {
      this.perfilMenuAbierto = false;
    }
  }
}
