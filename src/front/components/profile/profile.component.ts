import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ApiService, PaisResponse, ProfileResponse } from '../../services/api.service';
import { AuthService, AuthUser } from '../../services/auth.service';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit {
  userName = '';
  nombre = '';
  apellidos = '';
  email = '';
  telefono = '';
  paisId: number | null = null;
  fechaRegistro = '';
  paises: PaisResponse[] = [];
  editando = false;
  guardando = false;

  constructor(
    public readonly servicioAuth: AuthService,
    private readonly router: Router,
    private readonly api: ApiService
  ) {
    if (!this.servicioAuth.estaAutenticado()) {
      this.router.navigate(['/login']);
      return;
    }

    this.resetForm();
  }

  ngOnInit(): void {
    this.cargarPaises();
    this.cargarDatosPerfil();
  }

  get nombreMostrado(): string {
    return this.nombre.trim() || 'Usuario';
  }

  get userNameMostrado(): string {
    return this.userName.trim();
  }

  get miembroDesde(): string {
    if (!this.fechaRegistro) {
      return 'Miembro';
    }

    return `Miembro desde ${this.formatearFecha(this.fechaRegistro)}`;
  }

  activarEdicion(): void {
    this.editando = true;
  }

  cancelarEdicion(): void {
    this.resetForm();
    this.editando = false;
  }

  cargarDatosPerfil(): void {
    if (!this.servicioAuth.getUser()) {
      this.router.navigate(['/login']);
      return;
    }

    this.api.getProfile(this.servicioAuth.getToken()).subscribe({
      next: (datos) => {
        this.aplicarPerfil(datos);
      },
      error: (err: HttpErrorResponse) => this.handleProfileError(err, 'Error al obtener los datos del perfil:')
    });
  }

  resetForm(): void {
    const usuarioActual = this.servicioAuth.getUser();

    this.userName = usuarioActual?.userName ?? '';
    this.nombre = usuarioActual?.nombre ?? '';
    this.apellidos = usuarioActual?.apellidos ?? '';
    this.email = usuarioActual?.email ?? '';
    this.telefono = usuarioActual?.telefono ?? '';
    this.paisId = usuarioActual?.paisId ?? null;
    this.fechaRegistro = usuarioActual?.fechaRegistro ?? '';
  }

  saveProfile(): void {
    const usuarioActual = this.servicioAuth.getUser();

    if (!usuarioActual) {
      this.router.navigate(['/login']);
      return;
    }

    this.guardando = true;

    this.api.updateProfile({
      nombre: this.nombre.trim(),
      apellidos: this.apellidos.trim(),
      telefono: this.telefono.trim(),
      paisId: this.paisId
    }, this.servicioAuth.getToken()).subscribe({
      next: (perfilActualizado) => {
        const usuarioActualizado = this.mapProfileToAuthUser(perfilActualizado, usuarioActual);

        this.aplicarPerfil(perfilActualizado);
        this.servicioAuth.updateUser(usuarioActualizado);
        this.guardando = false;
        this.editando = false;
      },
      error: (err) => {
        this.guardando = false;
        this.handleProfileError(err, 'Error al actualizar el perfil:');
      }
    });
  }

  cargarPaises(): void {
    this.api.getPaises().subscribe({
      next: (paises) => {
        this.paises = paises;
      },
      error: (err) => console.error('Error al obtener los paises:', err)
    });
  }

  logout(): void {
    this.servicioAuth.logout();
    this.router.navigate(['/login']);
  }

  private aplicarPerfil(datos: ProfileResponse): void {
    this.userName = datos.userName || datos.username || datos.usuario || this.userName;
    this.nombre = datos.nombre ?? this.nombre;
    this.apellidos = datos.apellidos || this.apellidos;
    this.email = datos.email || this.email;
    this.telefono = datos.telefono || this.telefono;
    this.paisId = datos.paisId ?? this.paisId;
    this.fechaRegistro = datos.fechaRegistro || this.fechaRegistro;
  }

  private mapProfileToAuthUser(datos: ProfileResponse, usuarioActual: AuthUser): AuthUser {
    return {
      ...usuarioActual,
      userName: datos.userName || datos.username || datos.usuario || usuarioActual.userName,
      nombre: datos.nombre ?? usuarioActual.nombre,
      apellidos: datos.apellidos ?? usuarioActual.apellidos,
      email: datos.email || usuarioActual.email,
      telefono: datos.telefono ?? usuarioActual.telefono,
      paisId: datos.paisId ?? usuarioActual.paisId,
      fechaRegistro: datos.fechaRegistro ?? usuarioActual.fechaRegistro
    };
  }

  private handleProfileError(err: HttpErrorResponse, mensaje: string): void {
    if (err.status === 401 || err.error?.codigo === 4) {
      this.servicioAuth.logout();
      this.router.navigate(['/login']);
      return;
    }

    console.error(mensaje, err);
  }

  private formatearFecha(fecha: string): string {
    const fechaParseada = new Date(`${fecha}T00:00:00`);

    if (Number.isNaN(fechaParseada.getTime())) {
      return fecha;
    }

    return fechaParseada.toLocaleDateString('es-ES', {
      month: 'long',
      year: 'numeric'
    });
  }
}
