import { TravelParticipantResponse } from '../../../services/api.service';

export interface ParticipantView extends TravelParticipantResponse {
  eliminado?: boolean;
}
