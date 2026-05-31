import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-help-center',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './help-center.component.html',
  styleUrls: ['../help-pages.css']
})
export class HelpCenterComponent {
}
