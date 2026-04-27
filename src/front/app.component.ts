import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { TravelSearchComponent } from './components/travel-search.component';
@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, TravelSearchComponent],
  template: `
    <main>
      <h1>Bienvenido a ExploraMas</h1>
      <app-travel-search></app-travel-search>
    </main>
  `
})
export class AppComponent {
}