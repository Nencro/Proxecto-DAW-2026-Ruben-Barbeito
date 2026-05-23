package com.proxecto.daw.travelback.controller;

import com.fasterxml.jackson.databind.JsonNode;
import com.proxecto.daw.travelback.service.TravelpayoutsService;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@Validated
@RestController
@RequestMapping("/api/travelpayouts")
public class TravelpayoutsController {

    private final TravelpayoutsService travelpayoutsService;

    public TravelpayoutsController(TravelpayoutsService travelpayoutsService) {
        this.travelpayoutsService = travelpayoutsService;
    }

    @GetMapping("/flights/cheap")
    public JsonNode getCheapFlights(
            @RequestParam @NotBlank String origin,
            @RequestParam(required = false) String destination,
            @RequestParam(required = false) String departDate,
            @RequestParam(required = false) String returnDate,
            @RequestParam(required = false) String currency,
            @RequestParam(required = false) @Min(1) Integer page
    ) {
        return travelpayoutsService.getCheapFlights(origin, destination, departDate, returnDate, currency, page);
    }

    @GetMapping("/fly/search")
    public JsonNode searchFlights(
            @RequestParam(required = false) String origin,
            @RequestParam(required = false) String destination,
            @RequestParam(required = false) @Pattern(regexp = "\\d{4}-\\d{2}(-\\d{2})?", message = "departDate debe tener formato YYYY-MM o YYYY-MM-DD") String departDate,
            @RequestParam(required = false) @Pattern(regexp = "\\d{4}-\\d{2}(-\\d{2})?", message = "returnDate debe tener formato YYYY-MM o YYYY-MM-DD") String returnDate,
            @RequestParam(required = false) String currency,
            @RequestParam(defaultValue = "50") @Min(1) @Max(50) Integer limit,
            @RequestParam(required = false) @Min(1) Integer page
    ) {
        if (isBlank(origin) || isBlank(destination) || isBlank(departDate)) {
            return travelpayoutsService.getLatestFlights(currency, limit, page);
        }

        return travelpayoutsService.getCheapFlights(origin, destination, departDate, returnDate, currency, page);
    }

    @GetMapping("/flights/direct")
    public JsonNode getDirectFlights(
            @RequestParam @NotBlank String origin,
            @RequestParam @NotBlank String destination,
            @RequestParam(required = false) String departDate,
            @RequestParam(required = false) String returnDate,
            @RequestParam(required = false) String currency
    ) {
        return travelpayoutsService.getDirectFlights(origin, destination, departDate, returnDate, currency);
    }

    @GetMapping("/flights/month-matrix")
    public JsonNode getMonthMatrix(
            @RequestParam @NotBlank String origin,
            @RequestParam @NotBlank String destination,
            @RequestParam(required = false) String month,
            @RequestParam(required = false) String currency,
            @RequestParam(defaultValue = "true") Boolean showToAffiliates
    ) {
        return travelpayoutsService.getMonthMatrix(origin, destination, month, currency, showToAffiliates);
    }

    @GetMapping("/flights/city-directions")
    public JsonNode getCityDirections(
            @RequestParam @NotBlank String origin,
            @RequestParam(required = false) String currency
    ) {
        return travelpayoutsService.getCityDirections(origin, currency);
    }

    @GetMapping("/reference/cities")
    public JsonNode searchCities(
            @RequestParam(defaultValue = "en") String language,
            @RequestParam(required = false) String query,
            @RequestParam(required = false) String q,
            @RequestParam(required = false) String term,
            @RequestParam(defaultValue = "10") @Min(1) @Max(50) Integer limit
    ) {
        return travelpayoutsService.searchCities(language, resolveQuery(query, q, term), limit);
    }

    @GetMapping("/reference/airports")
    public JsonNode searchAirports(
            @RequestParam(defaultValue = "en") String language,
            @RequestParam(required = false) String query,
            @RequestParam(required = false) String q,
            @RequestParam(required = false) String term,
            @RequestParam(defaultValue = "10") @Min(1) @Max(50) Integer limit
    ) {
        return travelpayoutsService.searchAirports(language, resolveQuery(query, q, term), limit);
    }

    @GetMapping("/hotels/search")
    public JsonNode searchHotels(
            @RequestParam @NotBlank String query,
            @RequestParam(defaultValue = "en") String language,
            @RequestParam(defaultValue = "both") String lookFor,
            @RequestParam(defaultValue = "10") @Min(1) @Max(10) Integer limit
    ) {
        return travelpayoutsService.searchHotels(query, language, lookFor, limit);
    }

    @GetMapping("/hotels/search-by-coordinates")
    public JsonNode searchHotelsByCoordinates(
            @RequestParam @NotNull Double latitude,
            @RequestParam @NotNull Double longitude,
            @RequestParam(defaultValue = "en") String language,
            @RequestParam(defaultValue = "both") String lookFor,
            @RequestParam(defaultValue = "10") @Min(1) @Max(10) Integer limit
    ) {
        return travelpayoutsService.searchHotelsByCoordinates(latitude, longitude, language, lookFor, limit);
    }

    @GetMapping("/hotels/prices")
    public JsonNode getHotelPrices(
            @RequestParam(required = false) String location,
            @RequestParam(required = false) Integer locationId,
            @RequestParam(required = false) Integer hotelId,
            @RequestParam(required = false) String hotel,
            @RequestParam(required = false) String checkIn,
            @RequestParam(required = false) String checkOut,
            @RequestParam(required = false) @Min(1) Integer adults,
            @RequestParam(required = false) @Min(0) Integer children,
            @RequestParam(required = false) @Min(0) Integer infants,
            @RequestParam(required = false) @Min(1) Integer limit,
            @RequestParam(required = false) String currency,
            @RequestParam(required = false) String customerIp
    ) {
        return travelpayoutsService.getHotelPrices(
                location,
                locationId,
                hotelId,
                hotel,
                checkIn,
                checkOut,
                adults,
                children,
                infants,
                limit,
                currency,
                customerIp
        );
    }

    @GetMapping("/hotel/search")
    public JsonNode searchHotelResults(
            @RequestParam(required = false) String location,
            @RequestParam(required = false) String checkIn,
            @RequestParam(required = false) String checkOut,
            @RequestParam(required = false) @Min(1) Integer adults,
            @RequestParam(defaultValue = "50") @Min(1) @Max(50) Integer limit,
            @RequestParam(required = false) String currency
    ) {
        return travelpayoutsService.getHotelPrices(
                location,
                null,
                null,
                null,
                checkIn,
                checkOut,
                adults,
                null,
                null,
                limit,
                currency,
                null
        );
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

    private boolean isBlank(String value) {
        return value == null || value.isBlank();
    }
}
