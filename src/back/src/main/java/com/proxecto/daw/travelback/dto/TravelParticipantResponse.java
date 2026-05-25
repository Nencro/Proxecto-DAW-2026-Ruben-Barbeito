package com.proxecto.daw.travelback.dto;

public record TravelParticipantResponse(
        Long id,
        String userName,
        String nombre,
        String apellidos,
        String email,
        String rolEnViaje
) {
}
