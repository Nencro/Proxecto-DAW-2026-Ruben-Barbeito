package com.proxecto.daw.travelback.dto;

import java.util.List;

public record RegisterResponse(
        String token,
        Long id,
        String userName,
        String nombre,
        String apellidos,
        String email,
        String fechaRegistro,
        List<String> roles
) {
}
