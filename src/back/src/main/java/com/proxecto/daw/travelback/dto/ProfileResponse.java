package com.proxecto.daw.travelback.dto;

public record ProfileResponse(
        Long id,
        String userName,
        String nombre,
        String apellidos,
        String email,
        String telefono,
        Long paisId,
        String fechaRegistro
) {
}
