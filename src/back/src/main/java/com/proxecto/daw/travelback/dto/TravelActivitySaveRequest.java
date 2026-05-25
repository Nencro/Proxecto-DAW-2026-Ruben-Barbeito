package com.proxecto.daw.travelback.dto;

import java.math.BigDecimal;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record TravelActivitySaveRequest(
        @NotNull(message = "La fecha es obligatoria.")
        String fecha,

        @NotBlank(message = "La hora es obligatoria.")
        String hora,

        @NotNull(message = "El coste es obligatorio.")
        @DecimalMin(value = "0.0", inclusive = true, message = "El coste no puede ser negativo.")
        BigDecimal coste,

        @NotBlank(message = "La descripcion es obligatoria.")
        String descripcion
) {
}
