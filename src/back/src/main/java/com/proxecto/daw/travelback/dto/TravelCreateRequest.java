package com.proxecto.daw.travelback.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record TravelCreateRequest(
        @NotBlank(message = "El destino es obligatorio.")
        @Size(max = 150, message = "El destino no puede superar los 150 caracteres.")
        String destino,

        @NotBlank(message = "El pais es obligatorio.")
        @Size(max = 100, message = "El pais no puede superar los 100 caracteres.")
        String pais,

        @Size(max = 4000, message = "La descripcion no puede superar los 4000 caracteres.")
        String descripcion,

        @NotNull(message = "La fecha de inicio es obligatoria.")
        String fechaInicio,

        @NotNull(message = "La fecha de fin es obligatoria.")
        String fechaFin
) {
}
