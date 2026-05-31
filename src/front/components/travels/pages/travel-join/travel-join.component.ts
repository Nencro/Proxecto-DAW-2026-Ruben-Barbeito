import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { LoadingSpinnerComponent } from '../../../shared/loading-spinner/loading-spinner.component';
import { ApiService } from '../../../../services/api.service';
import { AuthService } from '../../../../services/auth.service';

@Component({
  selector: 'app-travel-join',
  standalone: true,
  imports: [LoadingSpinnerComponent, RouterLink],
  templateUrl: './travel-join.component.html',
  styleUrls: ['./travel-join.component.css']
})
export class TravelJoinComponent implements OnInit {
  cargando = false;
  error = '';

  constructor(
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    private readonly api: ApiService,
    private readonly auth: AuthService
  ) {
  }

  ngOnInit(): void {
    const token = this.route.snapshot.paramMap.get('token');

    if (!token) {
      this.error = 'La invitacion no es valida.';
      return;
    }

    if (!this.auth.validateSession()) {
      this.router.navigate(['/login'], {
        queryParams: {
          returnUrl: `/travels/join/${token}`
        }
      });
      return;
    }

    this.cargando = true;

    this.api.joinTravelByInvite(token, this.auth.getToken()).subscribe({
      next: (viaje) => {
        this.router.navigate(['/travels/details', viaje.id]);
      },
      error: () => {
        this.error = 'No se pudo usar la invitacion. Puede que haya caducado.';
        this.cargando = false;
      }
    });
  }
}
