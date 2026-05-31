import { Component } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';

@Component({
  selector: 'app-contact',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './contact.component.html',
  styleUrls: ['../help-pages.css']
})
export class ContactComponent {
  nombre = '';
  email = '';
  mensaje = '';
  enviado = false;

  enviar(formulario: NgForm): void {
    if (formulario.invalid) {
      return;
    }

    this.enviado = true;
    formulario.resetForm();
  }
}
