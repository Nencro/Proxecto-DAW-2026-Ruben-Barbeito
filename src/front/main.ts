import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app.component';
import { configuracionApp } from './app.config';

bootstrapApplication(AppComponent, configuracionApp)
  .catch((error) => console.error(error));
