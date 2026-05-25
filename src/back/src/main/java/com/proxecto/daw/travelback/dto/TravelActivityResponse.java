package com.proxecto.daw.travelback.dto;

import java.math.BigDecimal;

public record TravelActivityResponse(
        Long id,
        Long viajeId,
        String fecha,
        String hora,
        BigDecimal coste,
        String descripcion
) {
}
