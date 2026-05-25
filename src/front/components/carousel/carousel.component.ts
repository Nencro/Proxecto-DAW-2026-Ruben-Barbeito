import { Component, OnDestroy, OnInit } from '@angular/core';

interface DiapositivaCarrusel {
  src: string;
  alt: string;
  titulo: string;
}

@Component({
  selector: 'app-carousel',
  standalone: true,
  templateUrl: './carousel.component.html',
  styleUrls: ['./carousel.component.css']
})
export class CarouselComponent implements OnInit, OnDestroy {
  readonly diapositivas: DiapositivaCarrusel[] = [
    {
      src: 'assets/carrusel1.png',
      alt: 'Destino destacado de ExploraMas',
      titulo: 'El mundo es tuyo'
    },
    {
      src: 'assets/carrusel2.png',
      alt: 'Experiencia de viaje con ExploraMas',
      titulo: 'MAS QUE VIAJES\nVIVE EXPERIENCIAS'
    },
    {
      src: 'assets/carrusel3.png',
      alt: 'Paisaje recomendado por ExploraMas',
      titulo: 'PLANIFICA CON NOSOTROS'
    }
  ];

  diapositivaActiva = 0;

  private idIntervalo: number | null = null;

  ngOnInit(): void {
    this.iniciarIntervalo();
  }

  ngOnDestroy(): void {
    this.limpiarIntervalo();
  }

  nextSlide(reiniciarIntervalo = true): void {
    this.diapositivaActiva = (this.diapositivaActiva + 1) % this.diapositivas.length;

    if (reiniciarIntervalo) {
      this.reiniciarIntervalo();
    }
  }

  previousSlide(): void {
    this.diapositivaActiva = (this.diapositivaActiva - 1 + this.diapositivas.length) % this.diapositivas.length;
    this.reiniciarIntervalo();
  }

  setSlide(indice: number): void {
    this.diapositivaActiva = indice;
    this.reiniciarIntervalo();
  }

  private iniciarIntervalo(): void {
    this.idIntervalo = window.setInterval(() => {
      this.nextSlide(false);
    }, 10000);
  }

  private limpiarIntervalo(): void {
    if (this.idIntervalo !== null) {
      window.clearInterval(this.idIntervalo);
      this.idIntervalo = null;
    }
  }

  private reiniciarIntervalo(): void {
    this.limpiarIntervalo();
    this.iniciarIntervalo();
  }
}
