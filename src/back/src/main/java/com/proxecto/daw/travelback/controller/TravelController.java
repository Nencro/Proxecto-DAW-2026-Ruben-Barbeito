package com.proxecto.daw.travelback.controller;

import java.util.List;

import com.proxecto.daw.travelback.dto.TravelCreateRequest;
import com.proxecto.daw.travelback.dto.TravelResponse;
import com.proxecto.daw.travelback.service.TravelService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
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

    @PostMapping
    public TravelResponse createTravel(
            @RequestHeader(value = "Authorization", required = false) String authorization,
            @Valid @RequestBody TravelCreateRequest request
    ) {
        return travelService.createTravel(authorization, request);
    }
}
