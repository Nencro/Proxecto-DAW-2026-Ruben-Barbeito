package com.proxecto.daw.travelback.dto;

import java.math.BigDecimal;

public record TravelResponse(
        Long id,
        String destino,
        String pais,
        String codigoPais,
        String descripcion,
        String fechaInicio,
        String fechaFin,
        BigDecimal costeBillete,
        Long creadorId,
        String creadorUserName,
        Integer numeroParticipantes,
        String rolEnViaje
) {
}
