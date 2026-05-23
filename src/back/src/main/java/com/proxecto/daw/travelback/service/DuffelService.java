package com.proxecto.daw.travelback.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;
import org.springframework.web.util.UriBuilder;

@Service
public class DuffelService {

    private final RestClient duffelClient;
    private final ObjectMapper objectMapper;
    private final String token;
    private final String version;

    public DuffelService(
            ObjectMapper objectMapper,
            @Value("${duffel.api-base-url:https://api.duffel.com}") String apiBaseUrl,
            @Value("${duffel.token:}") String token,
            @Value("${duffel.version:v2}") String version
    ) {
        this.objectMapper = objectMapper;
        this.duffelClient = RestClient.builder()
                .baseUrl(removeTrailingSlash(apiBaseUrl))
                .defaultHeader("Accept", "application/json")
                .defaultHeader("Content-Type", "application/json")
                .build();
        this.token = token == null ? "" : token.trim();
        this.version = version == null || version.isBlank() ? "v2" : version.trim();
    }

    public JsonNode searchAirports(String query, Integer limit) {
        return limitArray(normalizePlaces(getPlaceSuggestions(query), true), limit);
    }

    public JsonNode searchFlights(
            String origin,
            String destination,
            String departDate,
            String returnDate,
            Integer adults,
            Integer limit
    ) {
        if (isBlank(origin) || isBlank(destination) || isBlank(departDate)) {
            return emptyDataArray();
        }

        ObjectNode data = objectMapper.createObjectNode();
        ArrayNode slices = objectMapper.createArrayNode();
        slices.add(createSlice(origin, destination, departDate));

        if (!isBlank(returnDate)) {
            slices.add(createSlice(destination, origin, returnDate));
        }

        ArrayNode passengers = objectMapper.createArrayNode();
        int adultCount = adults == null || adults < 1 ? 1 : adults;
        for (int i = 0; i < adultCount; i++) {
            ObjectNode passenger = objectMapper.createObjectNode();
            passenger.put("type", "adult");
            passengers.add(passenger);
        }

        data.set("slices", slices);
        data.set("passengers", passengers);
        data.put("cabin_class", "economy");

        ObjectNode body = objectMapper.createObjectNode();
        body.set("data", data);

        JsonNode response = post("/air/offer_requests", body, uriBuilder -> uriBuilder
                .queryParam("return_offers", true)
                .queryParam("supplier_timeout", 10000));

        return limitOffers(response, limit);
    }

    private JsonNode getPlaceSuggestions(String query) {
        return get("/places/suggestions", uriBuilder -> {
            return uriBuilder.queryParam("query", normalizePlaceQuery(query));
        });
    }

    private ObjectNode createSlice(String origin, String destination, String departureDate) {
        ObjectNode slice = objectMapper.createObjectNode();
        slice.put("origin", origin);
        slice.put("destination", destination);
        slice.put("departure_date", departureDate);
        return slice;
    }

    private JsonNode normalizePlaces(JsonNode response, boolean airportOnly) {
        ArrayNode results = objectMapper.createArrayNode();
        JsonNode data = response.path("data");

        if (!data.isArray()) {
            return results;
        }

        for (JsonNode place : data) {
            String type = text(place, "type");
            if (airportOnly && !"airport".equals(type)) {
                continue;
            }

            if (!airportOnly && !"city".equals(type)) {
                continue;
            }

            ObjectNode normalized = objectMapper.createObjectNode();
            String code = text(place, "iata_code");
            String cityCode = firstNonBlank(text(place, "iata_city_code"), code);
            String cityName = firstNonBlank(text(place, "city_name"), nestedText(place, "city", "name"), text(place, "name"));
            String countryCode = text(place, "iata_country_code");

            normalized.put("id", text(place, "id"));
            normalized.put("airport_id", text(place, "id"));
            normalized.put("code", code);
            normalized.put("airport_code", code);
            normalized.put("iata_code", code);
            normalized.put("name", text(place, "name"));
            normalized.put("airport_name", text(place, "name"));
            normalized.put("main_airport_name", text(place, "name"));
            normalized.put("city_code", cityCode);
            normalized.put("city_name", cityName);
            normalized.put("country_code", countryCode);
            normalized.put("country_name", countryCode);
            normalized.put("time_zone", text(place, "time_zone"));
            normalized.put("type", type);
            copyNumber(place, normalized, "latitude", "latitude");
            copyNumber(place, normalized, "longitude", "longitude");
            normalized.set("raw", place);
            results.add(normalized);
        }

        return results;
    }

    private JsonNode limitOffers(JsonNode response, Integer limit) {
        JsonNode offers = response.path("data").path("offers");
        if (!offers.isArray()) {
            return response;
        }

        int max = limit == null ? offers.size() : Math.max(0, Math.min(limit, offers.size()));
        ArrayNode limited = objectMapper.createArrayNode();
        for (int i = 0; i < max; i++) {
            limited.add(offers.get(i));
        }

        ObjectNode normalized = objectMapper.createObjectNode();
        normalized.set("data", limited);
        normalized.put("source", "duffel");
        normalized.set("raw", response);
        return normalized;
    }

    private ArrayNode limitArray(JsonNode nodes, Integer limit) {
        ArrayNode limited = objectMapper.createArrayNode();

        if (!nodes.isArray()) {
            return limited;
        }

        int max = limit == null ? nodes.size() : Math.max(0, Math.min(limit, nodes.size()));
        for (int i = 0; i < max; i++) {
            limited.add(nodes.get(i));
        }

        return limited;
    }

    private ObjectNode emptyDataArray() {
        ObjectNode response = objectMapper.createObjectNode();
        response.set("data", objectMapper.createArrayNode());
        response.put("source", "duffel");
        return response;
    }

    private JsonNode get(String path, UriCustomizer uriCustomizer) {
        return duffelClient.get()
                .uri(uriBuilder -> uriCustomizer.customize(uriBuilder.path(path)).build())
                .headers(headers -> {
                    headers.setBearerAuth(getToken());
                    headers.set("Duffel-Version", version);
                })
                .retrieve()
                .body(JsonNode.class);
    }

    private JsonNode post(String path, JsonNode body, UriCustomizer uriCustomizer) {
        return duffelClient.post()
                .uri(uriBuilder -> uriCustomizer.customize(uriBuilder.path(path)).build())
                .headers(headers -> {
                    headers.setBearerAuth(getToken());
                    headers.set("Duffel-Version", version);
                })
                .body(body)
                .retrieve()
                .body(JsonNode.class);
    }

    private String getToken() {
        if (token == null || token.isBlank()) {
            throw new IllegalStateException("Configura DUFFEL_TOKEN para usar Duffel.");
        }
        return token;
    }

    private static void copyNumber(JsonNode source, ObjectNode target, String targetField, String sourceField) {
        JsonNode value = source.path(sourceField);
        if (value.isNumber()) {
            target.put(targetField, value.asDouble());
        }
    }

    private static String normalizePlaceQuery(String query) {
        if (query == null || query.isBlank()) {
            return "Madrid";
        }
        return query;
    }

    private static String firstNonBlank(String... values) {
        for (String value : values) {
            if (value != null && !value.isBlank()) {
                return value;
            }
        }
        return "";
    }

    private static String text(JsonNode node, String field) {
        JsonNode value = node.path(field);
        if (value.isTextual()) {
            return value.asText();
        }
        return "";
    }

    private static String nestedText(JsonNode node, String parent, String field) {
        JsonNode value = node.path(parent).path(field);
        if (value.isTextual()) {
            return value.asText();
        }
        return "";
    }

    private static boolean isBlank(String value) {
        return value == null || value.isBlank();
    }

    private static String removeTrailingSlash(String value) {
        if (value.endsWith("/")) {
            return value.substring(0, value.length() - 1);
        }
        return value;
    }

    @FunctionalInterface
    private interface UriCustomizer {
        UriBuilder customize(UriBuilder uriBuilder);
    }
}
