import { Dialog, DialogModule } from '@angular/cdk/dialog';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import {
  ApiService,
  ExperienceResponse,
  ExperienceUpdateRequest,
  RestCountryResponse
} from '../../../../services/api.service';
import { AuthService } from '../../../../services/auth.service';
import { ConfirmDialogComponent, ConfirmDialogData } from '../../../shared/confirm-dialog/confirm-dialog.component';
import { LoadingSpinnerComponent } from '../../../shared/loading-spinner/loading-spinner.component';
import { AddExperienciaComponent } from '../../components/add-experiencia/add-experiencia.component';
import { CountrySuggestion } from '../../models/country-suggestion.model';

@Component({
  selector: 'app-experience-details',
  standalone: true,
  imports: [DialogModule, FormsModule, LoadingSpinnerComponent, RouterLink],
  templateUrl: './experience-details.component.html',
  styleUrls: ['./experience-details.component.css']
})
export class ExperienceDetailsComponent implements OnInit {
  readonly maxOriginalImageBytes = 5 * 1024 * 1024;
  readonly maxCompressedImageBytes = 900 * 1024;
  readonly maxImageSide = 1200;

  experience: ExperienceResponse | null = null;
  editable: ExperienceUpdateRequest = this.getEmptyExperience();
  paisBusqueda = '';
  sugerenciasPais: CountrySuggestion[] = [];
  mostrarSugerenciasPais = false;
  cargando = false;
  guardando = false;
  borrando = false;
  comprimiendoImagen = false;
  error = '';
  imagenInfo = '';

  private countries: CountrySuggestion[] = [];

  constructor(
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    private readonly api: ApiService,
    private readonly auth: AuthService,
    private readonly dialog: Dialog
  ) {
  }

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');

    if (!id) {
      this.error = 'No se encontró la experiencia.';
      return;
    }

    this.cargarPaises();
    this.cargando = true;
    this.api.getExperience(id).subscribe({
      next: (experience) => {
        this.experience = experience;
        this.rellenarEditable(experience);
        this.cargando = false;
      },
      error: () => {
        this.error = 'No pudo realizarse la carga de datos.';
        this.cargando = false;
      }
    });
  }

  get puedeGestionar(): boolean {
    const user = this.auth.getUser();
    const roles = user?.roles ?? [];
    return Boolean(this.experience && user && (Number(user.id) === this.experience.creadorId || roles.includes('ADMIN')));
  }

  get usuarioLogeado(): boolean {
    return this.auth.validateSession();
  }

  abrirModal(event?: Event): void {
    event?.preventDefault();
    event?.stopPropagation();

    if (!this.experience) {
      return;
    }

    this.dialog.open(AddExperienciaComponent, {
      data: this.experience,
      width: 'min(calc(100vw - 32px), 840px)',
      maxHeight: '86vh',
      hasBackdrop: true,
      panelClass: 'add-experience-dialog-panel',
      backdropClass: 'add-experience-dialog-backdrop'
    });
  }

  guardar(): void {
    if (!this.experience || !this.puedeGestionar || this.guardando || this.comprimiendoImagen) {
      return;
    }

    this.error = '';

    if (!this.editable.pais || !this.editable.codigoPais) {
      this.error = 'Selecciona un país válido de la lista.';
      return;
    }

    if (this.editable.tamanioMaximo < this.editable.tamanioMinimo) {
      this.error = 'El tamaño máximo no puede ser menor que el tamaño mínimo.';
      return;
    }

    this.guardando = true;
    this.api.updateExperience(this.experience.id, {
      ...this.editable,
      nombre: this.editable.nombre.trim(),
      localidad: this.editable.localidad.trim(),
      descripcion: this.editable.descripcion.trim(),
      pais: this.editable.pais.trim(),
      codigoPais: this.editable.codigoPais.trim().toUpperCase()
    }, this.auth.getToken()).subscribe({
      next: (experience) => {
        this.experience = experience;
        this.rellenarEditable(experience);
        this.guardando = false;
        this.imagenInfo = 'Experiencia guardada.';
      },
      error: () => {
        this.error = 'No pudo completarse la operación.';
        this.guardando = false;
      }
    });
  }

  solicitarBorrado(): void {
    if (!this.experience || !this.puedeGestionar || this.borrando) {
      return;
    }

    const dialogRef = this.dialog.open<boolean, ConfirmDialogData>(ConfirmDialogComponent, {
      data: {
        title: '¿Seguro que quieres borrar esta experiencia?',
        message: 'Esta acción eliminará la experiencia definitivamente.',
        confirmText: 'Sí, borrar',
        cancelText: 'No'
      },
      hasBackdrop: true,
      backdropClass: 'confirm-dialog-backdrop'
    });

    dialogRef.closed.subscribe((confirmed) => {
      if (confirmed) {
        this.confirmarBorrado();
      }
    });
  }

  private confirmarBorrado(): void {
    if (!this.experience || !this.puedeGestionar || this.borrando) {
      return;
    }

    this.borrando = true;
    this.api.deleteExperience(this.experience.id, this.auth.getToken()).subscribe({
      next: () => this.router.navigate(['/experiences']),
      error: () => {
        this.error = 'No pudo completarse la operación.';
        this.borrando = false;
      }
    });
  }

  buscarPaises(): void {
    const busqueda = this.normalizarTexto(this.paisBusqueda);
    this.editable.pais = '';
    this.editable.codigoPais = '';

    if (busqueda.length < 2) {
      this.sugerenciasPais = [];
      this.mostrarSugerenciasPais = false;
      return;
    }

    this.sugerenciasPais = this.countries
      .filter((pais) => this.normalizarTexto(pais.name).includes(busqueda) || this.normalizarTexto(pais.code).includes(busqueda))
      .slice(0, 8);
    this.mostrarSugerenciasPais = true;
  }

  seleccionarPais(pais: CountrySuggestion): void {
    this.editable.pais = pais.name;
    this.editable.codigoPais = pais.code;
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
          input.value = '';
          return;
        }

        this.editable.imagen = result.dataUrl;
        this.editable.imagenTipo = result.type;
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

  getImage(): string {
    return this.experience?.imagen || 'assets/sin_imagen.png';
  }

  getGroupSize(): string {
    if (!this.experience) {
      return '';
    }

    return this.experience.tamanioMinimo === this.experience.tamanioMaximo
      ? `${this.experience.tamanioMinimo} personas`
      : `${this.experience.tamanioMinimo} - ${this.experience.tamanioMaximo} personas`;
  }

  getPrice(): string {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR'
    }).format(this.experience?.precio || 0);
  }

  getDuration(minutes = this.experience?.duracionMinutos || 0): string {
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;

    if (!hours) {
      return `${minutes} min`;
    }

    return remainingMinutes ? `${hours} h ${remainingMinutes} min` : `${hours} h`;
  }

  private rellenarEditable(experience: ExperienceResponse): void {
    this.editable = {
      nombre: experience.nombre,
      localidad: experience.localidad,
      descripcion: experience.descripcion,
      tamanioMinimo: experience.tamanioMinimo,
      tamanioMaximo: experience.tamanioMaximo,
      duracionMinutos: experience.duracionMinutos,
      precio: experience.precio,
      pais: experience.pais,
      codigoPais: experience.codigoPais,
      imagen: experience.imagen,
      imagenTipo: this.getImageType(experience.imagen)
    };
    this.paisBusqueda = `${experience.pais} (${experience.codigoPais})`;
  }

  private cargarPaises(): void {
    this.api.getRestCountries().subscribe({
      next: (paises) => {
        this.countries = paises
          .map((pais) => {
            const code = pais.cca2.toUpperCase();
            const name = this.getNombrePais(pais);
            return { code, name, label: `${name} (${code})` };
          })
          .sort((a, b) => a.name.localeCompare(b.name, 'es'));
      },
      error: () => {
        this.countries = [];
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

  private getImageType(dataUrl: string): string {
    const match = dataUrl.match(/^data:([^;]+);base64,/);
    return match?.[1] || 'image/jpeg';
  }

  private getEmptyExperience(): ExperienceUpdateRequest {
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

  private normalizarTexto(valor: string): string {
    return valor
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .trim();
  }
}
