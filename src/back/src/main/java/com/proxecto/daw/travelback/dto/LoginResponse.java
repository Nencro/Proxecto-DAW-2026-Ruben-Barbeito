package com.proxecto.daw.travelback.dto;

public record LoginResponse(
        String token,
        AuthUserResponse usuario
) {
}
