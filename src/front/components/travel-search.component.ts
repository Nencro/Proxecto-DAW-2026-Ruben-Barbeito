import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';

export interface SearchData {
  destination: string;
  startDate: string;
  endDate: string;
  travelers: number;
}

@Component({
  selector: 'app-travel-search',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './TravelSearch.html',
  styleUrls: ['./TravelSearch.css']
})
export class TravelSearchComponent {
  searchData: SearchData = {
    destination: '',
    startDate: '',
    endDate: '',
    travelers: 1,
  };

  handleSubmit(): void {
    console.log('Buscando viajes con los siguientes datos:', this.searchData);
  }
}