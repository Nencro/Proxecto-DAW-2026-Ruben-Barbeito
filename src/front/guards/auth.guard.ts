import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const authGuard: CanActivateFn = () => {
  const servicioAuth = inject(AuthService);
  const router = inject(Router);

  if (servicioAuth.estaAutenticado()) {
    return true;
  }

  return router.createUrlTree(['/login']);
};
