export interface CriteriosBusqueda {
  origen: string;
  destino: string;
  fechaIda: string;
  fechaVuelta: string;
}

export interface ResultadoVuelo {
  origen: string;
  destino: string;
  codigoPaisDestino?: string;
  precio: number | null;
  moneda: string;
  aerolinea: string;
  numeroVuelo: string;
  iconoUrl: string;
  proveedor: string;
  escalas: number | null;
  duracion: number | null;
  distancia: number | null;
  salida: string;
  vuelta: string;
  vueltaOrigen: string;
  vueltaDestino: string;
  vueltaNumeroVuelo: string;
  vueltaAerolinea: string;
  vueltaDuracion: number | null;
  vueltaEscalas: number | null;
  caduca: string;
}
