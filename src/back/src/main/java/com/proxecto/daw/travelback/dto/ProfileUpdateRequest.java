package com.proxecto.daw.travelback.dto;

import jakarta.validation.constraints.Size;

public record ProfileUpdateRequest(
        @Size(max = 100, message = "El nombre no puede superar los 100 caracteres.")
        String nombre,

        @Size(max = 150, message = "Los apellidos no pueden superar los 150 caracteres.")
        String apellidos,

        @Size(max = 30, message = "El telefono no puede superar los 30 caracteres.")
        String telefono,

        Long paisId
) {
}
