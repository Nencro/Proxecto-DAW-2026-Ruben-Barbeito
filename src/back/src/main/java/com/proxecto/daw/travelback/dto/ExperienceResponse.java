package com.proxecto.daw.travelback.dto;

import java.math.BigDecimal;

public record ExperienceResponse(
        Long id,
        String nombre,
        String localidad,
        String descripcion,
        Integer tamanioMinimo,
        Integer tamanioMaximo,
        Integer duracionMinutos,
        BigDecimal precio,
        String pais,
        String codigoPais,
        Long creadorId,
        String creadorUserName,
        String imagen
) {
}
