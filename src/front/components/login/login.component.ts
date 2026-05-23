import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, RouterLink],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  email = '';
  password = '';
  enviando = false;
  mensajeError = '';

  constructor(
    private readonly servicioAuth: AuthService,
    private readonly router: Router
  ) {
  }

  handleSubmit(): void {
    const email = this.email.trim();
    this.mensajeError = '';

    if (!email || !this.password) {
      return;
    }

    this.enviando = true;

    this.servicioAuth.authenticate({ email, password: this.password }).subscribe({
      next: (respuesta) => {
        this.servicioAuth.login({
          token: respuesta.token,
          usuario: {
            id: String(respuesta.usuario.id),
            userName: respuesta.usuario.userName,
            nombre: respuesta.usuario.nombre,
            email: respuesta.usuario.email,
            apellidos: respuesta.usuario.apellidos,
            fechaRegistro: respuesta.usuario.fechaRegistro,
            roles: respuesta.usuario.roles
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

    if (error.error?.codigo === 4) {
      return 'Email o contrasena incorrectos.';
    }

    if (typeof error.error?.mensaje === 'string') {
      return error.error.mensaje;
    }

    return 'No se pudo iniciar sesion.';
  }
}
