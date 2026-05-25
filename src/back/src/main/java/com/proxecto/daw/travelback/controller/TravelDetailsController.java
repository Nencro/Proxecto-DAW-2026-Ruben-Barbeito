package com.proxecto.daw.travelback.controller;

import java.util.List;

import com.proxecto.daw.travelback.dto.TravelActivityResponse;
import com.proxecto.daw.travelback.dto.TravelActivitySaveRequest;
import com.proxecto.daw.travelback.service.TravelService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/travel/details")
public class TravelDetailsController {

    private final TravelService travelService;

    public TravelDetailsController(TravelService travelService) {
        this.travelService = travelService;
    }

    @GetMapping("/{id}/activitities")
    public List<TravelActivityResponse> getActivities(
            @RequestHeader(value = "Authorization", required = false) String authorization,
            @PathVariable Long id
    ) {
        return travelService.getTravelActivitiesByAuthorization(authorization, id);
    }

    @GetMapping("/{id}/activities")
    public List<TravelActivityResponse> getActivitiesAlias(
            @RequestHeader(value = "Authorization", required = false) String authorization,
            @PathVariable Long id
    ) {
        return travelService.getTravelActivitiesByAuthorization(authorization, id);
    }

    @PostMapping("/{id}/activitities")
    public TravelActivityResponse createActivity(
            @RequestHeader(value = "Authorization", required = false) String authorization,
            @PathVariable Long id,
            @Valid @RequestBody TravelActivitySaveRequest request
    ) {
        return travelService.createTravelActivity(authorization, id, request);
    }

    @PostMapping("/{id}/activities")
    public TravelActivityResponse createActivityAlias(
            @RequestHeader(value = "Authorization", required = false) String authorization,
            @PathVariable Long id,
            @Valid @RequestBody TravelActivitySaveRequest request
    ) {
        return travelService.createTravelActivity(authorization, id, request);
    }

    @PutMapping("/{id}/activitities")
    public List<TravelActivityResponse> replaceActivities(
            @RequestHeader(value = "Authorization", required = false) String authorization,
            @PathVariable Long id,
            @RequestParam String fecha,
            @Valid @RequestBody List<TravelActivitySaveRequest> request
    ) {
        return travelService.replaceTravelActivities(authorization, id, fecha, request);
    }

    @PutMapping("/{id}/activities")
    public List<TravelActivityResponse> replaceActivitiesAlias(
            @RequestHeader(value = "Authorization", required = false) String authorization,
            @PathVariable Long id,
            @RequestParam String fecha,
            @Valid @RequestBody List<TravelActivitySaveRequest> request
    ) {
        return travelService.replaceTravelActivities(authorization, id, fecha, request);
    }
}
