package com.proxecto.daw.travelback.dto;

public record TravelInviteResponse(
        Long viajeId,
        String token,
        String fechaExpiracion
) {
}
