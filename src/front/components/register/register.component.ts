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
  errorUsuario = '';
  errorEmail = '';
  errorPassword = '';
  errorConfirmarPassword = '';

  constructor(
    private readonly servicioAuth: AuthService,
    private readonly router: Router
  ) {
    if (this.servicioAuth.validateSession()) {
      this.router.navigate(['/profile']);
    }
  }

  handleSubmit(): void {
    const userName = this.usuario.trim();
    const email = this.email.trim();
    this.passwordNoCoincide = this.password !== this.confirmarPassword;
    this.mensajeError = '';
    this.errorUsuario = '';
    this.errorEmail = '';
    this.errorPassword = '';
    this.errorConfirmarPassword = '';

    if (!this.validarCampos(userName, email)) {
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
        this.asignarErrorRegistro(error);
      }
    });
  }

  limpiarErrorUsuario(): void {
    this.errorUsuario = '';
  }

  limpiarErrorEmail(): void {
    this.errorEmail = '';
  }

  limpiarErrorPassword(): void {
    this.errorPassword = '';
    this.errorConfirmarPassword = '';
    this.passwordNoCoincide = false;
  }

  private validarCampos(userName: string, email: string): boolean {
    const patronUsuario = /^[A-Za-z0-9._-]{3,50}$/;
    const patronEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const patronPassword = /^(?=.*[A-Za-z])(?=.*\d).{6,100}$/;

    if (!patronUsuario.test(userName)) {
      this.errorUsuario = 'El usuario debe tener entre 3 y 50 caracteres y solo puede usar letras, numeros, puntos, guiones y guiones bajos.';
    }

    if (!patronEmail.test(email)) {
      this.errorEmail = 'Introduce un correo electrónico válido.';
    }

    if (!patronPassword.test(this.password)) {
      this.errorPassword = 'La contraseña debe tener al menos 6 caracteres e incluir una letra y un número.';
    }

    if (!this.confirmarPassword) {
      this.errorConfirmarPassword = 'Repite la contraseña.';
    } else if (this.password !== this.confirmarPassword) {
      this.passwordNoCoincide = true;
      this.errorConfirmarPassword = 'Las contraseñas no coinciden.';
    }

    return !this.errorUsuario && !this.errorEmail && !this.errorPassword && !this.errorConfirmarPassword;
  }

  private asignarErrorRegistro(error: HttpErrorResponse): void {
    if (error.status === 0) {
      this.mensajeError = 'No se pudo conectar con el servidor.';
      return;
    }

    if (error.error?.codigo === 2) {
      this.errorUsuario = 'El usuario ya existe.';
      return;
    }

    if (error.error?.codigo === 3) {
      this.errorEmail = 'El correo electrónico ya está en uso.';
      return;
    }

    if (error.error?.codigo === 1 && error.error?.errores && typeof error.error.errores === 'object') {
      const errores = error.error.errores as Record<string, string>;
      this.errorUsuario = errores['userName'] || errores['usuario'] || '';
      this.errorEmail = errores['email'] || '';
      this.mensajeError = Object.values(errores).filter(Boolean).join(' ');
      return;
    }

    if (typeof error.error?.mensaje === 'string') {
      if (typeof error.error?.detalle === 'string') {
        this.mensajeError = `${error.error.mensaje} ${error.error.detalle}`;
        return;
      }

      this.mensajeError = error.error.mensaje;
      return;
    }

    if (error.error && typeof error.error === 'object') {
      this.mensajeError = Object.values(error.error).join(' ');
      return;
    }

    this.mensajeError = 'No se pudo completar el registro.';
  }
}
