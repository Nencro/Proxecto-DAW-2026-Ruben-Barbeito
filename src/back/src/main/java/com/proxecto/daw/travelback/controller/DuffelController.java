package com.proxecto.daw.travelback.controller;

import com.fasterxml.jackson.databind.JsonNode;
import com.proxecto.daw.travelback.service.DuffelService;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.Pattern;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@Validated
@RestController
@RequestMapping("/api/duffel")
public class DuffelController {

    private final DuffelService duffelService;

    public DuffelController(DuffelService duffelService) {
        this.duffelService = duffelService;
    }

    @GetMapping("/reference/airports")
    public JsonNode searchAirports(
            @RequestParam(required = false) String query,
            @RequestParam(required = false) String q,
            @RequestParam(required = false) String term,
            @RequestParam(defaultValue = "50") @Min(1) @Max(50) Integer limit
    ) {
        return duffelService.searchAirports(resolveQuery(query, q, term), limit);
    }

    @GetMapping("/fly/search")
    public JsonNode searchFlights(
            @RequestParam(required = false) String origin,
            @RequestParam(required = false) String destination,
            @RequestParam(required = false) @Pattern(regexp = "\\d{4}-\\d{2}-\\d{2}", message = "departDate debe tener formato YYYY-MM-DD") String departDate,
            @RequestParam(required = false) @Pattern(regexp = "\\d{4}-\\d{2}-\\d{2}", message = "returnDate debe tener formato YYYY-MM-DD") String returnDate,
            @RequestParam(required = false) @Min(1) Integer adults,
            @RequestParam(required = false) @Min(1) Integer travelers,
            @RequestParam(defaultValue = "50") @Min(1) @Max(200) Integer limit
    ) {
        return duffelService.searchFlights(origin, destination, departDate, returnDate, firstPresent(adults, travelers), limit);
    }

    private String resolveQuery(String query, String q, String term) {
        if (query != null && !query.isBlank()) {
            return query;
        }

        if (q != null && !q.isBlank()) {
            return q;
        }

        if (term != null && !term.isBlank()) {
            return term;
        }

        return "";
    }

    private Integer firstPresent(Integer first, Integer second) {
        return first != null ? first : second;
    }
}
