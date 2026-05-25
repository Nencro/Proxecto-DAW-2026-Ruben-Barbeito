import { DIALOG_DATA, DialogRef } from '@angular/cdk/dialog';
import { Component, Inject, OnInit } from '@angular/core';
import { ApiService, TravelParticipantResponse, TravelResponse } from '../../services/api.service';
import { AuthService } from '../../services/auth.service';
import { LoadingSpinnerComponent } from '../shared/loading-spinner/loading-spinner.component';

interface ParticipantView extends TravelParticipantResponse {
  eliminado?: boolean;
}

@Component({
  selector: 'app-travel-participants-dialog',
  standalone: true,
  imports: [LoadingSpinnerComponent],
  templateUrl: './travel-participants-dialog.component.html',
  styleUrls: ['./travel-participants-dialog.component.css']
})
export class TravelParticipantsDialogComponent implements OnInit {
  participantes: ParticipantView[] = [];
  cargando = false;
  guardando = false;
  error = '';

  constructor(
    @Inject(DIALOG_DATA) public readonly viaje: TravelResponse,
    private readonly dialogRef: DialogRef<TravelParticipantResponse[] | undefined>,
    private readonly api: ApiService,
    private readonly auth: AuthService
  ) {
  }

  ngOnInit(): void {
    this.cargando = true;
    this.api.getTravelParticipants(this.viaje.id, this.auth.getToken()).subscribe({
      next: (participantes) => {
        this.participantes = participantes.map((participante) => ({
          ...participante,
          eliminado: false
        }));
        this.cargando = false;
      },
      error: () => {
        this.error = 'No se pudieron cargar los participantes.';
        this.cargando = false;
      }
    });
  }

  get puedeGestionar(): boolean {
    return this.viaje.rolEnViaje === 'CREADOR' || this.viaje.rolEnViaje === 'ADMIN';
  }

  get puedeSalirDelViaje(): boolean {
    return this.viaje.rolEnViaje === 'PARTICIPANTE';
  }

  get currentUserId(): number | null {
    const id = Number(this.auth.getUser()?.id);
    return Number.isFinite(id) ? id : null;
  }

  cerrar(): void {
    this.dialogRef.close();
  }

  marcarEliminado(participante: ParticipantView): void {
    if (!this.puedeEliminarParticipante(participante)) {
      return;
    }

    participante.eliminado = true;
  }

  restaurar(participante: ParticipantView): void {
    if (!this.puedeEliminarParticipante(participante)) {
      return;
    }

    participante.eliminado = false;
  }

  guardar(): void {
    if ((!this.puedeGestionar && !this.puedeSalirDelViaje) || this.guardando) {
      return;
    }

    this.error = '';
    this.guardando = true;

    const participantIds = this.participantes
      .filter((participante) => participante.rolEnViaje !== 'CREADOR' && !participante.eliminado)
      .map((participante) => participante.id);

    this.api.updateTravelParticipants(this.viaje.id, { participantIds }, this.auth.getToken()).subscribe({
      next: (participantes) => {
        this.dialogRef.close(participantes);
      },
      error: () => {
        this.error = 'No se pudieron guardar los participantes.';
        this.guardando = false;
      }
    });
  }

  getNombre(participante: TravelParticipantResponse): string {
    const nombreCompleto = `${participante.nombre || ''} ${participante.apellidos || ''}`.trim();
    return nombreCompleto || participante.userName;
  }

  getRol(participante: TravelParticipantResponse): string {
    return participante.rolEnViaje === 'CREADOR' ? 'Creador' : 'Participante';
  }

  puedeEliminarParticipante(participante: TravelParticipantResponse): boolean {
    if (participante.rolEnViaje === 'CREADOR') {
      return false;
    }

    return this.puedeGestionar || (this.puedeSalirDelViaje && participante.id === this.currentUserId);
  }
}
