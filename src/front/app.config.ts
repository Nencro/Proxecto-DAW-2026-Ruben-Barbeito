import { ApplicationConfig } from '@angular/core';
import { provideHttpClient } from '@angular/common/http';
import { provideRouter } from '@angular/router';

import { rutas } from './app.routes';

export const configuracionApp: ApplicationConfig = {
  providers: [provideRouter(rutas), provideHttpClient()]
};
