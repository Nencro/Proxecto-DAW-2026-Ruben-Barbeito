import { ApplicationConfig } from '@angular/core';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideRouter } from '@angular/router';

import { rutas } from './app.routes';
import { authExpiredInterceptor } from './interceptors/auth-expired.interceptor';

export const configuracionApp: ApplicationConfig = {
  providers: [provideRouter(rutas), provideHttpClient(withInterceptors([authExpiredInterceptor]))]
};
