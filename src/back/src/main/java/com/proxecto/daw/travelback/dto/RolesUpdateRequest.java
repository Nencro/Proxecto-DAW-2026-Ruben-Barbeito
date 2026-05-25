package com.proxecto.daw.travelback.dto;

import java.util.List;

import jakarta.validation.constraints.NotNull;

public record RolesUpdateRequest(
        @NotNull(message = "La lista de roles es obligatoria.")
        List<String> roles
) {
}
