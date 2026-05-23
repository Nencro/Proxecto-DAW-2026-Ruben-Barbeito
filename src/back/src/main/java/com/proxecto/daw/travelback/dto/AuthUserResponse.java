package com.proxecto.daw.travelback.dto;

import java.util.List;

public record AuthUserResponse(
        Long id,
        String userName,
        String nombre,
        String apellidos,
        String email,
        String fechaRegistro,
        List<String> roles
) {
}
