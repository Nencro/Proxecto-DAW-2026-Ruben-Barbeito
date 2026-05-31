import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CarouselComponent } from '../../components/carousel/carousel.component';
import { TravelSearchComponent } from '../../../search/components/travel-search/travel-search.component';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CarouselComponent, RouterLink, TravelSearchComponent],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent {
}
