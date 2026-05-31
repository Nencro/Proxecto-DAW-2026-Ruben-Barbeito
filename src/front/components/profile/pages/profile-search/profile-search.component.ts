import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ApiService, ProfileResponse } from '../../../../services/api.service';
import { AuthService } from '../../../../services/auth.service';
import { LoadingSpinnerComponent } from '../../../shared/loading-spinner/loading-spinner.component';

@Component({
  selector: 'app-profile-search',
  standalone: true,
  imports: [CommonModule, FormsModule, LoadingSpinnerComponent],
  templateUrl: './profile-search.component.html',
  styleUrls: ['./profile-search.component.css']
})
export class ProfileSearchComponent implements OnInit {
  busqueda = '';
  usuarios: ProfileResponse[] = [];
  cargando = false;
  error = '';
  busquedaRealizada = false;
  private temporizadorBusqueda?: number;

  constructor(
    private readonly api: ApiService,
    private readonly auth: AuthService,
    private readonly router: Router
  ) {}

  ngOnInit(): void {
    this.buscarUsuarios();
  }

  buscarConRetraso(): void {
    if (this.temporizadorBusqueda) {
      window.clearTimeout(this.temporizadorBusqueda);
    }

    this.temporizadorBusqueda = window.setTimeout(() => this.buscarUsuarios(), 250);
  }

  buscarUsuarios(): void {
    this.cargando = true;
    this.error = '';
    this.busquedaRealizada = true;

    this.api.searchProfiles(this.busqueda, this.auth.getToken()).subscribe({
      next: (usuarios) => {
        this.usuarios = usuarios;
        this.cargando = false;
      },
      error: (error: HttpErrorResponse) => {
        this.usuarios = [];
        this.cargando = false;
        this.error = this.getMensajeError(error);
      }
    });
  }

  abrirPerfil(usuario: ProfileResponse): void {
    const userName = usuario.userName || usuario.username || usuario.usuario;

    if (!userName) {
      return;
    }

    this.router.navigate(['/profile', userName]);
  }

  getUserName(usuario: ProfileResponse): string {
    return usuario.userName || usuario.username || usuario.usuario || '';
  }

  getNombreCompleto(usuario: ProfileResponse): string {
    return [usuario.nombre, usuario.apellidos]
      .map((parte) => parte?.trim())
      .filter(Boolean)
      .join(' ') || 'Sin nombre';
  }

  getRoles(usuario: ProfileResponse): string {
    return usuario.roles?.length ? usuario.roles.join(', ') : 'Sin roles';
  }

  private getMensajeError(error: HttpErrorResponse): string {
    if (error.status === 0) {
      return 'No se pudo conectar con el servidor.';
    }

    if (error.status === 401 || error.status === 403) {
      return 'Solo un administrador puede buscar usuarios.';
    }

    return 'No se pudo realizar la busqueda de usuarios.';
  }
}
