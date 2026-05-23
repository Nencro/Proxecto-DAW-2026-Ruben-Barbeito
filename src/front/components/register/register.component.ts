import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [FormsModule, RouterLink],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent {
  usuario = '';
  email = '';
  password = '';
  confirmarPassword = '';
  passwordNoCoincide = false;
  enviando = false;
  mensajeError = '';

  constructor(
    private readonly servicioAuth: AuthService,
    private readonly router: Router
  ) {
    if (this.servicioAuth.estaAutenticado()) {
      this.router.navigate(['/profile']);
    }
  }

  handleSubmit(): void {
    const userName = this.usuario.trim();
    const email = this.email.trim();
    this.passwordNoCoincide = this.password !== this.confirmarPassword;
    this.mensajeError = '';

    if (!userName || !email || !this.password || this.passwordNoCoincide) {
      return;
    }

    this.enviando = true;

    this.servicioAuth.register({ userName, email, password: this.password }).subscribe({
      next: (usuarioRegistrado) => {
        this.servicioAuth.login({
          token: usuarioRegistrado.token,
          usuario: {
            id: String(usuarioRegistrado.id),
            userName: usuarioRegistrado.userName,
            nombre: usuarioRegistrado.nombre,
            email: usuarioRegistrado.email,
            apellidos: usuarioRegistrado.apellidos,
            fechaRegistro: usuarioRegistrado.fechaRegistro,
            roles: usuarioRegistrado.roles
          }
        });

        this.router.navigate(['/profile']);
      },
      error: (error: HttpErrorResponse) => {
        this.enviando = false;
        this.mensajeError = this.getErrorMessage(error);
      }
    });
  }

  private getErrorMessage(error: HttpErrorResponse): string {
    if (error.status === 0) {
      return 'No se pudo conectar con el servidor.';
    }

    if (error.error?.codigo === 2) {
      return 'El usuario ya existe.';
    }

    if (error.error?.codigo === 3) {
      return 'El email ya esta registrado.';
    }

    if (error.error?.codigo === 1 && error.error?.errores && typeof error.error.errores === 'object') {
      return Object.values(error.error.errores).join(' ');
    }

    if (typeof error.error?.mensaje === 'string') {
      if (typeof error.error?.detalle === 'string') {
        return `${error.error.mensaje} ${error.error.detalle}`;
      }

      return error.error.mensaje;
    }

    if (error.error && typeof error.error === 'object') {
      return Object.values(error.error).join(' ');
    }

    return 'No se pudo completar el registro.';
  }
}
