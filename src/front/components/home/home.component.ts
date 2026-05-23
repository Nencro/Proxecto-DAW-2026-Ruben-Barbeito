import { Component } from '@angular/core';
import { CarouselComponent } from '../carousel/carousel.component';
import { TravelSearchComponent } from '../travel-search/travel-search.component';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CarouselComponent, TravelSearchComponent],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent {
}
