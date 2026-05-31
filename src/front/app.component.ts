import { Component, HostListener } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { FooterComponent } from './components/layout/components/footer/footer.component';
import { HeaderComponent } from './components/layout/components/header/header.component';
@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, HeaderComponent, FooterComponent],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  mostrarBotonSubir = false;

  @HostListener('window:scroll')
  onScroll(): void {
    this.mostrarBotonSubir = window.scrollY > 320;
  }

  subirInicio(): void {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  }
}
