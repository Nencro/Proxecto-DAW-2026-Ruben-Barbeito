package com.proxecto.daw.travelback.dto;

public record TravelResponse(
        Long id,
        String destino,
        String pais,
        String descripcion,
        String fechaInicio,
        String fechaFin,
        Long creadorId,
        String creadorUserName,
        String rolEnViaje
) {
}
