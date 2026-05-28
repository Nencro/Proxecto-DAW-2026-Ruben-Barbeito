import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { ApiService, ExperienceCreateRequest, RestCountryResponse } from '../../services/api.service';
import { AuthService } from '../../services/auth.service';

interface CountrySuggestion {
  code: string;
  name: string;
  label: string;
}

@Component({
  selector: 'app-experience-create',
  standalone: true,
  imports: [FormsModule, RouterLink],
  templateUrl: './experience-create.component.html',
  styleUrls: ['./experience-create.component.css']
})
export class ExperienceCreateComponent implements OnInit {
  readonly maxOriginalImageBytes = 5 * 1024 * 1024;
  readonly maxCompressedImageBytes = 900 * 1024;
  readonly maxImageSide = 1200;

  experiencia: ExperienceCreateRequest = this.getEmptyExperience();
  paisBusqueda = '';
  sugerenciasPais: CountrySuggestion[] = [];
  mostrarSugerenciasPais = false;
  enviando = false;
  comprimiendoImagen = false;
  error = '';
  imagenInfo = '';

  private countries: CountrySuggestion[] = [];

  constructor(
    private readonly api: ApiService,
    private readonly auth: AuthService,
    private readonly router: Router
  ) {
  }

  ngOnInit(): void {
    if (!this.puedeCrearExperiencias) {
      this.router.navigate(['/experiences']);
      return;
    }

    this.api.getRestCountries().subscribe({
      next: (paises) => {
        this.countries = paises
          .map((pais) => {
            const code = pais.cca2.toUpperCase();
            const name = this.getNombrePais(pais);

            return {
              code,
              name,
              label: this.formatearPais(name, code)
            };
          })
          .sort((a, b) => a.name.localeCompare(b.name, 'es'));
      },
      error: () => {
        this.countries = [];
      }
    });
  }

  get puedeCrearExperiencias(): boolean {
    const roles = this.auth.getUser()?.roles ?? [];
    return roles.includes('EMPRESA') || roles.includes('ADMIN');
  }

  buscarPaises(): void {
    const busqueda = this.normalizarTexto(this.paisBusqueda);
    this.experiencia.pais = '';
    this.experiencia.codigoPais = '';

    if (busqueda.length < 2) {
      this.sugerenciasPais = [];
      this.mostrarSugerenciasPais = false;
      return;
    }

    this.sugerenciasPais = this.countries
      .filter((pais) => {
        const name = this.normalizarTexto(pais.name);
        const code = this.normalizarTexto(pais.code);

        return name.includes(busqueda) || code.includes(busqueda);
      })
      .slice(0, 8);
    this.mostrarSugerenciasPais = true;
  }

  seleccionarPais(pais: CountrySuggestion): void {
    this.experiencia.pais = pais.name;
    this.experiencia.codigoPais = pais.code;
    this.paisBusqueda = pais.label;
    this.sugerenciasPais = [];
    this.mostrarSugerenciasPais = false;
  }

  ocultarSugerenciasPais(): void {
    window.setTimeout(() => {
      this.mostrarSugerenciasPais = false;
    }, 140);
  }

  cargarImagen(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    this.error = '';
    this.imagenInfo = '';

    if (!file) {
      this.experiencia.imagen = '';
      this.experiencia.imagenTipo = '';
      return;
    }

    if (!file.type.startsWith('image/')) {
      this.error = 'Selecciona un archivo de imagen válido.';
      input.value = '';
      return;
    }

    if (file.size > this.maxOriginalImageBytes) {
      this.error = 'La imagen no puede superar 5 MB antes de comprimir.';
      input.value = '';
      return;
    }

    this.comprimiendoImagen = true;
    this.compressImage(file)
      .then((result) => {
        if (result.bytes > this.maxCompressedImageBytes) {
          this.error = 'La imagen comprimida sigue siendo demasiado grande. Usa una imagen más ligera.';
          this.experiencia.imagen = '';
          this.experiencia.imagenTipo = '';
          input.value = '';
          return;
        }

        this.experiencia.imagen = result.dataUrl;
        this.experiencia.imagenTipo = result.type;
        this.imagenInfo = `Imagen comprimida a ${Math.round(result.bytes / 1024)} KB.`;
      })
      .catch(() => {
        this.error = 'No se pudo procesar la imagen.';
        input.value = '';
      })
      .finally(() => {
        this.comprimiendoImagen = false;
      });
  }

  crearExperiencia(): void {
    this.error = '';

    if (!this.experiencia.pais || !this.experiencia.codigoPais) {
      this.error = 'Selecciona un país válido de la lista.';
      return;
    }

    if (this.experiencia.tamanioMaximo < this.experiencia.tamanioMinimo) {
      this.error = 'El tamaño máximo no puede ser menor que el tamaño mínimo.';
      return;
    }

    if (this.comprimiendoImagen) {
      this.error = 'Espera a que termine la compresión de la imagen.';
      return;
    }

    this.enviando = true;
    this.api.createExperience({
      ...this.experiencia,
      nombre: this.experiencia.nombre.trim(),
      localidad: this.experiencia.localidad.trim(),
      descripcion: this.experiencia.descripcion.trim(),
      pais: this.experiencia.pais.trim(),
      codigoPais: this.experiencia.codigoPais.trim().toUpperCase()
    }, this.auth.getToken()).subscribe({
      next: () => {
        this.router.navigate(['/experiences']);
      },
      error: () => {
        this.error = 'No pudo completarse la operación.';
        this.enviando = false;
      }
    });
  }

  private compressImage(file: File): Promise<{ dataUrl: string; type: string; bytes: number }> {
    return new Promise((resolve, reject) => {
      const image = new Image();
      const objectUrl = URL.createObjectURL(file);

      image.onload = () => {
        URL.revokeObjectURL(objectUrl);
        const scale = Math.min(1, this.maxImageSide / Math.max(image.width, image.height));
        const canvas = document.createElement('canvas');
        canvas.width = Math.max(1, Math.round(image.width * scale));
        canvas.height = Math.max(1, Math.round(image.height * scale));

        const context = canvas.getContext('2d');
        if (!context) {
          reject();
          return;
        }

        context.drawImage(image, 0, 0, canvas.width, canvas.height);
        const type = 'image/jpeg';
        const dataUrl = canvas.toDataURL(type, 0.75);
        resolve({
          dataUrl,
          type,
          bytes: this.getDataUrlBytes(dataUrl)
        });
      };

      image.onerror = () => {
        URL.revokeObjectURL(objectUrl);
        reject();
      };

      image.src = objectUrl;
    });
  }

  private getDataUrlBytes(dataUrl: string): number {
    const base64 = dataUrl.split(',')[1] || '';
    return Math.ceil((base64.length * 3) / 4);
  }

  private getEmptyExperience(): ExperienceCreateRequest {
    return {
      nombre: '',
      localidad: '',
      descripcion: '',
      tamanioMinimo: 1,
      tamanioMaximo: 1,
      duracionMinutos: 60,
      precio: 0,
      pais: '',
      codigoPais: '',
      imagen: '',
      imagenTipo: ''
    };
  }

  private getNombrePais(pais: RestCountryResponse): string {
    return pais.translations?.spa?.common || pais.name.common || pais.cca2;
  }

  private formatearPais(nombre: string, codigo: string): string {
    return `${nombre} (${codigo})`;
  }

  private normalizarTexto(valor: string): string {
    return valor
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .trim();
  }
}
