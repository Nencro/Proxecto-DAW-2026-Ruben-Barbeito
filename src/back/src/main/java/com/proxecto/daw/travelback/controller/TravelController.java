package com.proxecto.daw.travelback.controller;

import java.util.List;

import com.proxecto.daw.travelback.dto.TravelCreateRequest;
import com.proxecto.daw.travelback.dto.TravelInviteResponse;
import com.proxecto.daw.travelback.dto.TravelParticipantResponse;
import com.proxecto.daw.travelback.dto.TravelParticipantsUpdateRequest;
import com.proxecto.daw.travelback.dto.TravelResponse;
import com.proxecto.daw.travelback.dto.TravelUpdateRequest;
import com.proxecto.daw.travelback.service.TravelService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/travels")
public class TravelController {

    private final TravelService travelService;

    public TravelController(TravelService travelService) {
        this.travelService = travelService;
    }

    @GetMapping
    public List<TravelResponse> getTravels(@RequestHeader(value = "Authorization", required = false) String authorization) {
        return travelService.getTravelsByAuthorization(authorization);
    }

    @GetMapping("/{id}")
    public TravelResponse getTravel(
            @RequestHeader(value = "Authorization", required = false) String authorization,
            @PathVariable Long id
    ) {
        return travelService.getTravelByAuthorization(authorization, id);
    }

    @PostMapping
    public TravelResponse createTravel(
            @RequestHeader(value = "Authorization", required = false) String authorization,
            @Valid @RequestBody TravelCreateRequest request
    ) {
        return travelService.createTravel(authorization, request);
    }

    @PutMapping("/{id}")
    public TravelResponse updateTravel(
            @RequestHeader(value = "Authorization", required = false) String authorization,
            @PathVariable Long id,
            @Valid @RequestBody TravelUpdateRequest request
    ) {
        return travelService.updateTravel(authorization, id, request);
    }

    @DeleteMapping("/{id}")
    public void deleteTravel(
            @RequestHeader(value = "Authorization", required = false) String authorization,
            @PathVariable Long id
    ) {
        travelService.deleteTravel(authorization, id);
    }

    @GetMapping("/{id}/participants")
    public List<TravelParticipantResponse> getParticipants(
            @RequestHeader(value = "Authorization", required = false) String authorization,
            @PathVariable Long id
    ) {
        return travelService.getTravelParticipants(authorization, id);
    }

    @PutMapping("/{id}/participants")
    public List<TravelParticipantResponse> updateParticipants(
            @RequestHeader(value = "Authorization", required = false) String authorization,
            @PathVariable Long id,
            @RequestBody TravelParticipantsUpdateRequest request
    ) {
        return travelService.updateTravelParticipants(authorization, id, request);
    }

    @PostMapping("/{id}/invite")
    public TravelInviteResponse createInvite(
            @RequestHeader(value = "Authorization", required = false) String authorization,
            @PathVariable Long id
    ) {
        return travelService.createInvite(authorization, id);
    }

    @PostMapping("/invitations/{token}/join")
    public TravelResponse joinByInvite(
            @RequestHeader(value = "Authorization", required = false) String authorization,
            @PathVariable String token
    ) {
        return travelService.joinTravelByInvite(authorization, token);
    }
}
