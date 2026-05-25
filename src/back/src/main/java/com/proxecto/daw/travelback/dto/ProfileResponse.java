package com.proxecto.daw.travelback.dto;

import java.util.List;

public record ProfileResponse(
        Long id,
        String userName,
        String nombre,
        String apellidos,
        String email,
        String telefono,
        Long paisId,
        String pais,
        String codigoPais,
        String prefijoPais,
        String fechaRegistro,
        List<String> roles
) {
}
