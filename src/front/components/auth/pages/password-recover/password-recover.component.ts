import { HttpErrorResponse } from '@angular/common/http';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../../services/auth.service';

@Component({
  selector: 'app-password-recover',
  standalone: true,
  imports: [FormsModule, RouterLink],
  templateUrl: './password-recover.component.html',
  styleUrls: ['./password-recover.component.css']
})
export class PasswordRecoverComponent {
  userName = '';
  email = '';
  newPassword = '';
  repeatPassword = '';
  enviando = false;
  mensajeError = '';
  mensajeExito = '';

  constructor(
    private readonly auth: AuthService,
    private readonly router: Router
  ) {
  }

  get passwordsNoCoinciden(): boolean {
    return Boolean(this.newPassword && this.repeatPassword && this.newPassword !== this.repeatPassword);
  }

  recuperar(): void {
    this.mensajeError = '';
    this.mensajeExito = '';

    if (!this.userName.trim() || !this.email.trim() || !this.newPassword || !this.repeatPassword) {
      this.mensajeError = 'Completa todos los campos.';
      return;
    }

    if (this.passwordsNoCoinciden) {
      this.mensajeError = 'Las contraseñas no coinciden.';
      return;
    }

    this.enviando = true;
    this.auth.recoverPassword({
      userName: this.userName.trim(),
      email: this.email.trim().toLowerCase(),
      newPassword: this.newPassword
    }).subscribe({
      next: () => {
        this.mensajeExito = 'Contraseña actualizada. Ya puedes iniciar sesión.';
        window.setTimeout(() => this.router.navigate(['/login']), 1200);
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

    if (typeof error.error?.mensaje === 'string') {
      return error.error.mensaje;
    }

    return 'No se pudo recuperar la contraseña.';
  }
}
