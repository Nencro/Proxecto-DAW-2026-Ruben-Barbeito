import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const adminGuard: CanActivateFn = () => {
  const servicioAuth = inject(AuthService);
  const router = inject(Router);

  if (!servicioAuth.validateSession()) {
    return router.createUrlTree(['/login']);
  }

  const roles = servicioAuth.getUser()?.roles ?? [];

  if (roles.includes('ADMIN')) {
    return true;
  }

  return router.createUrlTree(['/']);
};
