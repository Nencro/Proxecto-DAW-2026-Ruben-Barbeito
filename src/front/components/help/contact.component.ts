import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-contact',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './contact.component.html',
  styleUrls: ['./help-pages.css']
})
export class ContactComponent {
  nombre = '';
  email = '';
  mensaje = '';
  enviado = false;

  enviar(): void {
    this.enviado = true;
  }
}
