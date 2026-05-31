import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { AuthService } from '../../../../services/auth.service';

type CampoLogin = 'email' | 'password';

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
  private formularioEnviado = false;
  private camposModificados = new Set<CampoLogin>();
  private erroresServidor: Partial<Record<CampoLogin, string>> = {};

  constructor(
    private readonly servicioAuth: AuthService,
    private readonly router: Router,
    private readonly route: ActivatedRoute
  ) {
  }

  handleSubmit(): void {
    const email = this.email.trim();
    this.mensajeError = '';
    this.formularioEnviado = true;
    this.marcarCampo('email');
    this.marcarCampo('password');

    if (!this.formularioValido()) {
      return;
    }

    this.enviando = true;
    this.erroresServidor = {};

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

        this.router.navigateByUrl(this.route.snapshot.queryParamMap.get('returnUrl') || '/profile');
      },
      error: (error: HttpErrorResponse) => {
        this.enviando = false;
        this.aplicarErroresServidor(error);
      }
    });
  }

  marcarCampo(campo: CampoLogin): void {
    this.camposModificados.add(campo);
    delete this.erroresServidor[campo];
    this.mensajeError = '';
  }

  campoInvalido(campo: CampoLogin): boolean {
    return Boolean(this.getErrorCampo(campo));
  }

  getErrorCampo(campo: CampoLogin): string {
    const errorCliente = this.getErrorCliente(campo);

    if (errorCliente) {
      return errorCliente;
    }

    return this.erroresServidor[campo] || '';
  }

  private formularioValido(): boolean {
    return !this.getErrorCliente('email', true) && !this.getErrorCliente('password', true);
  }

  private getErrorCliente(campo: CampoLogin, forzar = false): string {
    if (!forzar && !this.debeValidarCampo(campo)) {
      return '';
    }

    if (campo === 'email') {
      const email = this.email.trim();

      if (!email) {
        return 'El email es obligatorio.';
      }

      if (!this.emailValido(email)) {
        return 'El email no tiene un formato valido.';
      }

      return '';
    }

    if (!this.password.trim()) {
      return 'La contrasena es obligatoria.';
    }

    return '';
  }

  private debeValidarCampo(campo: CampoLogin): boolean {
    return this.formularioEnviado || this.camposModificados.has(campo);
  }

  private emailValido(email: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  private aplicarErroresServidor(error: HttpErrorResponse): void {
    const errores = error.error?.errores;

    if (errores && typeof errores === 'object') {
      this.erroresServidor = {
        email: typeof errores.email === 'string' ? errores.email : undefined,
        password: typeof errores.password === 'string' ? errores.password : undefined
      };

      if (this.erroresServidor.email || this.erroresServidor.password) {
        return;
      }
    }

    const mensaje = this.getErrorMessage(error);

    if (error.error?.codigo === 4) {
      this.erroresServidor.password = mensaje;
      return;
    }

    this.mensajeError = mensaje;
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
