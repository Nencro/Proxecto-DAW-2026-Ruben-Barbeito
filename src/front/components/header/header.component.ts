import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [FormsModule, RouterLink],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent {
  destino = '';
  fechaIda = '';
  fechaVuelta = '';

  constructor(
    public servicioAuth: AuthService,
    private readonly router: Router
  ) {
  }

  search(): void {
    this.router.navigate(['/search'], {
      queryParams: {
        destino: this.destino || null,
        fechaIda: this.fechaIda || null,
        fechaVuelta: this.fechaVuelta || null
      }
    });
  }
}
