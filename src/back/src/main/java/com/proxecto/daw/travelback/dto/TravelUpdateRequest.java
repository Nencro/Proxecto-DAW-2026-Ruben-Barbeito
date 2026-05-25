package com.proxecto.daw.travelback.dto;

import java.math.BigDecimal;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record TravelUpdateRequest(
        @Size(max = 4000, message = "La descripcion no puede superar los 4000 caracteres.")
        String descripcion,

        @NotNull(message = "La fecha de inicio es obligatoria.")
        String fechaInicio,

        @NotNull(message = "La fecha de fin es obligatoria.")
        String fechaFin,

        @NotNull(message = "El coste del billete es obligatorio.")
        @DecimalMin(value = "0.0", inclusive = true, message = "El coste del billete no puede ser negativo.")
        BigDecimal costeBillete
) {
}
