import { TravelActivityResponse } from '../../../services/api.service';

export interface EditableTravelActivity extends TravelActivityResponse {
  editable?: boolean;
  borrada?: boolean;
}
