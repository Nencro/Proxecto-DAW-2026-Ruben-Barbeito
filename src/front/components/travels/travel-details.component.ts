import { Component, OnInit } from '@angular/core';
import { Dialog, DialogModule } from '@angular/cdk/dialog';
import { CdkTableModule } from '@angular/cdk/table';
import { HttpErrorResponse } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { forkJoin } from 'rxjs';
import { ConfirmDialogComponent, ConfirmDialogData } from '../shared/confirm-dialog/confirm-dialog.component';
import { LoadingSpinnerComponent } from '../shared/loading-spinner/loading-spinner.component';
import { ApiService, TravelActivityResponse, TravelParticipantResponse, TravelResponse } from '../../services/api.service';
import { AuthService } from '../../services/auth.service';
import { TravelParticipantsDialogComponent } from './travel-participants-dialog.component';

interface EditableTravelActivity extends TravelActivityResponse {
  editable?: boolean;
  borrada?: boolean;
}

@Component({
  selector: 'app-travel-details',
  standalone: true,
  imports: [CdkTableModule, DialogModule, FormsModule, LoadingSpinnerComponent, RouterLink],
  templateUrl: './travel-details.component.html',
  styleUrls: ['./travel-details.component.css']
})
export class TravelDetailsComponent implements OnInit {
  readonly columnasActividadesEdicion = ['hora', 'coste', 'descripcion', 'acciones'];
  readonly columnasActividadesLectura = ['hora', 'coste', 'descripcion'];

  viaje: TravelResponse | null = null;
  actividades: EditableTravelActivity[] = [];
  diasViaje: string[] = [];
  diaSeleccionado = '';
  descripcionEditable = '';
  fechaInicioEditable = '';
  fechaFinEditable = '';
  costeBilleteEditable = 0;
  cargando = false;
  guardandoTodo = false;
  generandoInvitacion = false;
  borrandoViaje = false;
  enlaceInvitacion = '';
  invitacionCopiada = false;
  error = '';
  errorActividades = '';
  intentoGuardarTodo = false;

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
      this.error = 'No se encontro el viaje.';
      return;
    }

    this.cargando = true;

    const token = this.auth.getToken();

    forkJoin({
      viaje: this.api.getTravel(id, token),
      actividades: this.api.getTravelActivities(id, token)
    }).subscribe({
      next: ({ viaje, actividades }) => {
        this.viaje = viaje;
        this.actividades = actividades;
        this.diasViaje = this.getDiasDelViaje(viaje);
        this.diaSeleccionado = this.diasViaje[0] || viaje.fechaInicio;
        this.inicializarCamposEditables(viaje);
        this.fechaInicioEditable = viaje.fechaInicio;
        this.fechaFinEditable = viaje.fechaFin;
        this.cargando = false;
      },
      error: (error: HttpErrorResponse) => this.manejarErrorCarga(error)
    });
  }

  getRolLegible(viaje: TravelResponse): string {
    if (viaje.rolEnViaje === 'ADMIN') {
      return 'Administrador';
    }

    return viaje.rolEnViaje === 'CREADOR' ? 'Creador' : 'Participante';
  }

  get puedeEditar(): boolean {
    return this.viaje?.rolEnViaje === 'CREADOR' || this.viaje?.rolEnViaje === 'ADMIN';
  }

  get puedeBorrarViaje(): boolean {
    return this.viaje?.rolEnViaje === 'CREADOR';
  }

  get columnasActividades(): string[] {
    return this.puedeEditar ? this.columnasActividadesEdicion : this.columnasActividadesLectura;
  }

  get costeTotal(): number {
    const costeBillete = this.puedeEditar
      ? this.costeBilleteEditable || 0
      : this.viaje?.costeBillete || 0;
    const costeActividades = this.actividades
      .filter((actividad) => !actividad.borrada)
      .reduce((total, actividad) => total + (Number(actividad.coste) || 0), 0);

    return costeBillete + costeActividades;
  }

  getFechas(viaje: TravelResponse): string {
    const inicio = this.formatearFecha(viaje.fechaInicio);
    const fin = this.formatearFecha(viaje.fechaFin);

    if (inicio === fin || !fin) {
      return inicio || '-';
    }

    return `${inicio} - ${fin}`;
  }

  anadirFilaActividad(): void {
    if (!this.viaje || !this.puedeEditar) {
      return;
    }

    this.actividades = [
      ...this.actividades,
      {
        id: Date.now() * -1,
        viajeId: this.viaje.id,
        fecha: this.diaSeleccionado || this.viaje.fechaInicio,
        hora: '',
        coste: 0,
        descripcion: '',
        editable: true
      }
    ];
  }

  guardarTodo(): void {
    if (!this.viaje || !this.puedeEditar || this.guardandoTodo) {
      return;
    }

    this.intentoGuardarTodo = true;
    this.errorActividades = '';

    if (!this.fechaInicioEditable || !this.fechaFinEditable) {
      this.error = 'Introduce fecha de inicio y fecha de fin.';
      return;
    }

    if (this.fechaFinEditable < this.fechaInicioEditable) {
      this.error = 'La fecha de fin no puede ser anterior a la fecha de inicio.';
      return;
    }

    const diasActualizados = this.getDiasEntreFechas(this.fechaInicioEditable, this.fechaFinEditable);
    const diasValidos = new Set(diasActualizados);
    const actividadesAGuardar = this.actividades.filter((actividad) => {
      if (actividad.borrada || !diasValidos.has(actividad.fecha)) {
        return false;
      }

      return Boolean(actividad.hora || actividad.descripcion.trim());
    });

    const actividadIncompleta = actividadesAGuardar.some(
      (actividad) => !actividad.hora || !actividad.descripcion.trim() || actividad.coste == null || actividad.coste < 0
    );

    if (actividadIncompleta) {
      this.errorActividades = 'Introduce hora, coste y descripcion en todas las actividades que quedan en la tabla.';
      return;
    }

    this.error = '';
    this.errorActividades = '';
    this.guardandoTodo = true;
    const viajeId = this.viaje.id;
    const token = this.auth.getToken();

    this.api.updateTravel(viajeId, {
      descripcion: this.descripcionEditable.trim(),
      fechaInicio: this.fechaInicioEditable,
      fechaFin: this.fechaFinEditable,
      costeBillete: this.costeBilleteEditable || 0
    }, token).subscribe({
      next: (viaje) => {
        const diasDelViaje = this.getDiasDelViaje(viaje);
        const llamadasActividades = diasDelViaje.map((dia) => {
          const actividadesDelDia = actividadesAGuardar
            .filter((actividad) => actividad.fecha === dia)
            .map((actividad) => ({
              fecha: dia,
              hora: actividad.hora,
              coste: actividad.coste || 0,
              descripcion: actividad.descripcion.trim()
            }));

          return this.api.replaceTravelActivities(viajeId, dia, actividadesDelDia, token);
        });

        forkJoin(llamadasActividades.length ? llamadasActividades : [[]]).subscribe({
          next: (actividadesPorDia) => {
            this.intentoGuardarTodo = false;
            this.viaje = viaje;
            this.inicializarCamposEditables(viaje);
            this.fechaInicioEditable = viaje.fechaInicio;
            this.fechaFinEditable = viaje.fechaFin;
            this.diasViaje = diasDelViaje;
            this.diaSeleccionado = this.diasViaje.includes(this.diaSeleccionado)
              ? this.diaSeleccionado
              : this.diasViaje[0] || viaje.fechaInicio;
            this.actividades = actividadesPorDia.flat();
            this.guardandoTodo = false;
          },
          error: () => {
            this.guardandoTodo = false;
            this.error = 'No se pudieron guardar las actividades.';
          }
        });
      },
      error: () => {
        this.guardandoTodo = false;
        this.error = 'No se pudo guardar el viaje.';
      }
    });
  }

  borrarActividad(actividad: EditableTravelActivity): void {
    if (!this.puedeEditar) {
      return;
    }

    actividad.borrada = true;
  }

  borrarViaje(): void {
    if (!this.viaje || !this.puedeBorrarViaje || this.borrandoViaje) {
      return;
    }

    const dialogRef = this.dialog.open<boolean, ConfirmDialogData>(ConfirmDialogComponent, {
      data: {
        title: '¿Seguro que quieres borrar este viaje?',
        message: 'Se eliminaran definitivamente el viaje y todas sus actividades.',
        confirmText: 'Si, borrar',
        cancelText: 'No'
      },
      hasBackdrop: true,
      backdropClass: 'confirm-dialog-backdrop'
    });

    dialogRef.closed.subscribe((confirmed) => {
      if (confirmed) {
        this.confirmarBorradoViaje();
      }
    });
  }

  private confirmarBorradoViaje(): void {
    if (!this.viaje || !this.puedeBorrarViaje || this.borrandoViaje) {
      return;
    }

    this.error = '';
    this.borrandoViaje = true;

    this.api.deleteTravel(this.viaje.id, this.auth.getToken()).subscribe({
      next: () => {
        this.router.navigate(['/travels']);
      },
      error: () => {
        this.borrandoViaje = false;
        this.error = 'No se pudo borrar el viaje.';
      }
    });
  }

  crearEnlaceInvitacion(): void {
    if (!this.viaje || !this.puedeEditar || this.generandoInvitacion) {
      return;
    }

    this.error = '';
    this.generandoInvitacion = true;

    this.api.createTravelInvite(this.viaje.id, this.auth.getToken()).subscribe({
      next: (invitacion) => {
        this.enlaceInvitacion = `${window.location.origin}/travels/join/${invitacion.token}`;
        this.generandoInvitacion = false;
      },
      error: () => {
        this.error = 'No se pudo generar el enlace de invitacion.';
        this.generandoInvitacion = false;
      }
    });
  }

  compartirEnlaceInvitacion(): void {
    if (!this.enlaceInvitacion) {
      return;
    }

    if (navigator.share) {
      navigator.share({
        title: 'Invitacion de viaje',
        text: 'Unete a este viaje en ExploraMas.',
        url: this.enlaceInvitacion
      }).catch(() => undefined);
      return;
    }

    this.copiarEnlaceInvitacion();
  }

  copiarEnlaceInvitacion(): void {
    if (!this.enlaceInvitacion) {
      return;
    }

    navigator.clipboard.writeText(this.enlaceInvitacion).then(() => {
      this.invitacionCopiada = true;
      window.setTimeout(() => {
        this.invitacionCopiada = false;
      }, 1800);
    }).catch(() => {
      this.error = 'No se pudo copiar el enlace al portapapeles.';
    });
  }

  verParticipantes(): void {
    if (!this.viaje) {
      return;
    }

    const dialogRef = this.dialog.open<TravelParticipantResponse[], TravelResponse>(TravelParticipantsDialogComponent, {
      data: this.viaje,
      width: 'min(calc(100vw - 32px), 760px)',
      maxHeight: '86vh',
      hasBackdrop: true,
      panelClass: 'participants-dialog-panel',
      backdropClass: 'add-experience-dialog-backdrop'
    });

    dialogRef.closed.subscribe((participantes) => {
      if (participantes && this.viaje) {
        this.viaje = {
          ...this.viaje,
          numeroParticipantes: participantes.length
        };
      }
    });
  }

  get actividadesDelDia(): EditableTravelActivity[] {
    if (!this.diaSeleccionado) {
      return [];
    }

    return this.actividades.filter((actividad) => actividad.fecha === this.diaSeleccionado);
  }

  formatearFecha(valor: string): string {
    if (!valor) {
      return '';
    }

    const fecha = new Date(`${valor}T00:00:00`);

    if (Number.isNaN(fecha.getTime())) {
      return valor;
    }

    return new Intl.DateTimeFormat('es-ES', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    }).format(fecha);
  }

  formatearPrecio(valor: number): string {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR'
    }).format(valor || 0);
  }

  campoActividadInvalido(actividad: EditableTravelActivity, campo: 'hora' | 'coste' | 'descripcion'): boolean {
    if (!this.intentoGuardarTodo || actividad.borrada) {
      return false;
    }

    if (campo === 'hora') {
      return !actividad.hora;
    }

    if (campo === 'coste') {
      return actividad.coste == null || actividad.coste < 0;
    }

    return !actividad.descripcion.trim();
  }

  campoViajeInvalido(campo: 'fechaInicio' | 'fechaFin'): boolean {
    if (!this.intentoGuardarTodo) {
      return false;
    }

    if (campo === 'fechaInicio') {
      return !this.fechaInicioEditable;
    }

    return !this.fechaFinEditable || this.fechaFinEditable < this.fechaInicioEditable;
  }

  private getDiasDelViaje(viaje: TravelResponse): string[] {
    return this.getDiasEntreFechas(viaje.fechaInicio, viaje.fechaFin);
  }

  private inicializarCamposEditables(viaje: TravelResponse): void {
    this.descripcionEditable = viaje.descripcion || '';
    this.costeBilleteEditable = viaje.costeBillete || 0;
  }

  private getDiasEntreFechas(fechaInicio: string, fechaFin: string): string[] {
    const inicio = new Date(`${fechaInicio}T00:00:00`);
    const fin = new Date(`${fechaFin}T00:00:00`);

    if (Number.isNaN(inicio.getTime()) || Number.isNaN(fin.getTime()) || fin < inicio) {
      return fechaInicio ? [fechaInicio] : [];
    }

    const dias: string[] = [];
    const diaActual = new Date(inicio);

    while (diaActual <= fin) {
      dias.push(this.formatearFechaInput(diaActual));
      diaActual.setDate(diaActual.getDate() + 1);
    }

    return dias;
  }

  private formatearFechaInput(fecha: Date): string {
    const year = fecha.getFullYear();
    const month = String(fecha.getMonth() + 1).padStart(2, '0');
    const day = String(fecha.getDate()).padStart(2, '0');

    return `${year}-${month}-${day}`;
  }

  private manejarErrorCarga(error: HttpErrorResponse): void {
    this.cargando = false;
    this.viaje = null;
    this.actividades = [];

    if (this.esErrorNoAutorizado(error)) {
      if (error.error?.mensaje === 'Token invalido.') {
        this.auth.clearSession();
      }

      this.error = 'No autorizado.';
      window.setTimeout(() => {
        this.router.navigate(['/']);
      }, 1000);
      return;
    }

    this.error = 'No se pudo cargar el detalle del viaje.';
  }

  private esErrorNoAutorizado(error: HttpErrorResponse): boolean {
    return error.status === 401
      || error.status === 403
      || error.error?.codigo === 4
      || error.error?.mensaje === 'No autorizado.'
      || error.error?.mensaje === 'Token invalido.';
  }

}
