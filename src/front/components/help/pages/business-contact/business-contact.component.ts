import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-business-contact',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './business-contact.component.html',
  styleUrls: ['../help-pages.css']
})
export class BusinessContactComponent {
  empresa = '';
  personaContacto = '';
  email = '';
  telefono = '';
  pais = '';
  tipoExperiencia = '';
  descripcion = '';
  enviado = false;
  intentoEnviar = false;

  enviar(formularioValido: boolean | null): void {
    this.intentoEnviar = true;

    if (!formularioValido) {
      this.enviado = false;
      return;
    }

    this.enviado = true;
  }
}
