package com.proxecto.daw.travelback.dto;

import java.util.List;

public record TravelParticipantsUpdateRequest(
        List<Long> participantIds
) {
}
