package com.proxecto.daw.travelback.service;

import java.util.Locale;
import java.text.Normalizer;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientResponseException;
import org.springframework.web.util.UriBuilder;

@Service
public class TravelpayoutsService {

    private final RestClient apiClient;
    private final RestClient hotelsClient;
    private final RestClient autocompleteClient;
    private final ObjectMapper objectMapper;
    private final String token;

    public TravelpayoutsService(
            ObjectMapper objectMapper,
            @Value("${travelpayouts.api-base-url:https://api.travelpayouts.com}") String apiBaseUrl,
            @Value("${travelpayouts.hotels-base-url:https://engine.hotellook.com}") String hotelsBaseUrl,
            @Value("${travelpayouts.autocomplete-base-url:https://autocomplete.travelpayouts.com}") String autocompleteBaseUrl,
            @Value("${travelpayouts.token:}") String token
    ) {
        this.objectMapper = objectMapper;
        this.apiClient = RestClient.builder()
                .baseUrl(removeTrailingSlash(apiBaseUrl))
                .build();
        this.hotelsClient = RestClient.builder()
                .baseUrl(removeTrailingSlash(hotelsBaseUrl))
                .build();
        this.autocompleteClient = RestClient.builder()
                .baseUrl(removeTrailingSlash(autocompleteBaseUrl))
                .build();
        this.token = token == null ? "" : token.trim();
    }

    public JsonNode getCheapFlights(
            String origin,
            String destination,
            String departDate,
            String returnDate,
            String currency,
            Integer page
    ) {
        return getFromApi("/v1/prices/cheap", uriBuilder -> {
            UriBuilder builder = uriBuilder.queryParam("origin", origin);
            addIfPresent(builder, "destination", destination);
            addIfPresent(builder, "depart_date", departDate);
            addIfPresent(builder, "return_date", returnDate);
            addIfPresent(builder, "currency", currency);
            addIfPresent(builder, "page", page);
            return builder;
        });
    }

    public JsonNode getLatestFlights(String currency, Integer limit, Integer page) {
        return getFromApi("/v2/prices/latest", uriBuilder -> {
            UriBuilder builder = uriBuilder
                    .queryParam("limit", limit == null ? 50 : limit)
                    .queryParam("page", page == null ? 1 : page)
                    .queryParam("sorting", "price")
                    .queryParam("show_to_affiliates", true);
            addIfPresent(builder, "currency", currency);
            return builder;
        });
    }

    public JsonNode getDirectFlights(
            String origin,
            String destination,
            String departDate,
            String returnDate,
            String currency
    ) {
        return getFromApi("/v1/prices/direct", uriBuilder -> {
            UriBuilder builder = uriBuilder
                    .queryParam("origin", origin)
                    .queryParam("destination", destination);
            addIfPresent(builder, "depart_date", departDate);
            addIfPresent(builder, "return_date", returnDate);
            addIfPresent(builder, "currency", currency);
            return builder;
        });
    }

    public JsonNode getMonthMatrix(
            String origin,
            String destination,
            String month,
            String currency,
            Boolean showToAffiliates
    ) {
        return getFromApi("/v2/prices/month-matrix", uriBuilder -> {
            UriBuilder builder = uriBuilder
                    .queryParam("origin", origin)
                    .queryParam("destination", destination);
            addIfPresent(builder, "month", month);
            addIfPresent(builder, "currency", currency);
            addIfPresent(builder, "show_to_affiliates", showToAffiliates);
            return builder;
        });
    }

    public JsonNode getCityDirections(String origin, String currency) {
        return getFromApi("/v1/city-directions", uriBuilder -> {
            UriBuilder builder = uriBuilder.queryParam("origin", origin);
            addIfPresent(builder, "currency", currency);
            return builder;
        });
    }

    public JsonNode searchCities(String language, String query, Integer limit) {
        if (!hasToken()) {
            return normalizeReferenceResults(searchPlaces(language, query, limit, "city"), false);
        }

        JsonNode cities = getReferenceData(language, "cities");
        return normalizeReferenceResults(filterReferenceData(cities, query, limit), false);
    }

    public JsonNode searchAirports(String language, String query, Integer limit) {
        if (!hasToken()) {
            return normalizeReferenceResults(searchPlaces(language, query, limit, "airport", "city"), true);
        }

        JsonNode airports = getReferenceData(language, "airports");
        return normalizeReferenceResults(filterReferenceData(airports, query, limit), true);
    }

    public JsonNode searchHotels(String query, String language, String lookFor, Integer limit) {
        return getFromHotels("/api/v2/lookup.json", uriBuilder -> uriBuilder
                .queryParam("query", query)
                .queryParam("lang", language)
                .queryParam("lookFor", lookFor)
                .queryParam("limit", limit)
                .queryParam("token", getToken()));
    }

    public JsonNode searchHotelsByCoordinates(Double latitude, Double longitude, String language, String lookFor, Integer limit) {
        return searchHotels(latitude + "," + longitude, language, lookFor, limit);
    }

    public JsonNode getHotelPrices(
            String location,
            Integer locationId,
            Integer hotelId,
            String hotel,
            String checkIn,
            String checkOut,
            Integer adults,
            Integer children,
            Integer infants,
            Integer limit,
            String currency,
            String customerIp
    ) {
        try {
            return getFromApi("/hotellook/v1/cached_prices", uriBuilder -> {
                UriBuilder builder = uriBuilder;
                addIfPresent(builder, "location", location);
                addIfPresent(builder, "locationId", locationId);
                addIfPresent(builder, "hotelId", hotelId);
                addIfPresent(builder, "hotel", hotel);
                addIfPresent(builder, "checkIn", checkIn);
                addIfPresent(builder, "checkOut", checkOut);
                addIfPresent(builder, "adults", adults);
                addIfPresent(builder, "children", children);
                addIfPresent(builder, "infants", infants);
                addIfPresent(builder, "limit", normalizeHotelPriceLimit(limit));
                addIfPresent(builder, "currency", currency);
                addIfPresent(builder, "customerIp", customerIp);
                return builder;
            });
        } catch (RestClientResponseException exception) {
            if (exception.getStatusCode().value() != 404) {
                throw exception;
            }

            return normalizeHotelFallbackResults(searchPlaces("es", location, limit, "city"), location);
        }
    }

    private JsonNode getReferenceData(String language, String resource) {
        return apiClient.get()
                .uri("/data/{language}/{resource}.json", normalizeReferenceLanguage(language), resource)
                .headers(headers -> headers.set("X-Access-Token", getToken()))
                .retrieve()
                .body(JsonNode.class);
    }

    private JsonNode searchPlaces(String language, String query, Integer limit, String... types) {
        return autocompleteClient.get()
                .uri(uriBuilder -> {
                    UriBuilder builder = uriBuilder
                            .path("/places2")
                            .queryParam("term", normalizeAutocompleteTerm(query))
                            .queryParam("locale", normalizeAutocompleteLanguage(language))
                            .queryParam("limit", limit == null ? 10 : limit);

                    for (String type : types) {
                        builder.queryParam("types[]", type);
                    }

                    return builder.build();
                })
                .retrieve()
                .body(JsonNode.class);
    }

    private JsonNode getFromApi(String path, UriCustomizer uriCustomizer) {
        return apiClient.get()
                .uri(uriBuilder -> uriCustomizer.customize(uriBuilder.path(path)).build())
                .headers(headers -> headers.set("X-Access-Token", getToken()))
                .retrieve()
                .body(JsonNode.class);
    }

    private JsonNode getFromHotels(String path, UriCustomizer uriCustomizer) {
        return hotelsClient.get()
                .uri(uriBuilder -> uriCustomizer.customize(uriBuilder.path(path)).build())
                .retrieve()
                .body(JsonNode.class);
    }

    private JsonNode filterReferenceData(JsonNode data, String query, Integer limit) {
        int maxResults = limit == null ? 10 : limit;
        ArrayNode results = objectMapper.createArrayNode();

        if (query == null || query.isBlank()) {
            for (JsonNode item : data) {
                results.add(item);
                if (results.size() >= maxResults) {
                    break;
                }
            }

            return results;
        }

        String normalizedQuery = query.toLowerCase(Locale.ROOT);

        for (JsonNode item : data) {
            if (matches(item, normalizedQuery)) {
                results.add(item);
                if (results.size() >= maxResults) {
                    break;
                }
            }
        }

        return results;
    }

    private JsonNode normalizeReferenceResults(JsonNode data, boolean airport) {
        ArrayNode results = objectMapper.createArrayNode();

        if (data == null || !data.isArray()) {
            return results;
        }

        for (JsonNode item : data) {
            ObjectNode normalized = objectMapper.createObjectNode();
            String airportId = firstText(item, "id", "airport_id", "code", "iata");
            String code = firstText(item, "code", "iata", "id");
            String name = firstText(item, "name", "airport_name", "main_airport_name", "city_name");
            String cityCode = firstText(item, "city_code", "cityCode", "code");
            String cityName = firstText(item, "city_name", "cityName", "city");
            String countryCode = firstText(item, "country_code", "countryCode");
            String countryName = firstText(item, "country_name", "countryName");
            String airportName = firstText(item, "airport_name", "main_airport_name", "name");
            String mainAirportName = firstText(item, "main_airport_name", "airport_name", "name");
            String timeZone = firstText(item, "time_zone", "timeZone", "timezone");
            String type = firstText(item, "type");

            if (airport && code.isBlank()) {
                continue;
            }

            if (!airport && name.isBlank()) {
                name = firstText(item, "code", "id");
            }

            normalized.put("code", code);
            normalized.put("id", airportId);
            normalized.put("airport_id", airportId);
            normalized.put("airport_code", code);
            normalized.put("iata_code", code);
            normalized.put("name", name);
            normalized.put("airport_name", airportName);
            normalized.put("main_airport_name", mainAirportName);
            normalized.put("city_code", cityCode);
            normalized.put("city_name", cityName);
            normalized.put("country_code", countryCode);
            normalized.put("country_name", countryName);
            normalized.put("time_zone", timeZone);
            normalized.put("type", type);
            copyNumber(item, normalized, "latitude", "lat");
            copyNumber(item, normalized, "longitude", "lon", "lng");

            JsonNode translations = item.path("name_translations");
            if (!translations.isMissingNode()) {
                normalized.set("name_translations", translations);
            }

            JsonNode cityTranslations = item.path("city_name_translations");
            if (!cityTranslations.isMissingNode()) {
                normalized.set("city_name_translations", cityTranslations);
            }

            JsonNode coordinates = item.path("coordinates");
            if (!coordinates.isMissingNode()) {
                normalized.set("coordinates", coordinates);
                copyNumber(coordinates, normalized, "latitude", "lat");
                copyNumber(coordinates, normalized, "longitude", "lon", "lng");
            }

            normalized.set("raw", item);
            results.add(normalized);
        }

        return results;
    }

    private JsonNode normalizeHotelFallbackResults(JsonNode data, String query) {
        ArrayNode results = objectMapper.createArrayNode();

        if (data == null || !data.isArray()) {
            return results;
        }

        ArrayNode candidates = objectMapper.createArrayNode();
        for (JsonNode item : data) {
            if (matchesHotelFallbackLocation(item, query)) {
                candidates.add(item);
            }
        }

        if (candidates.isEmpty() && (query == null || query.isBlank())) {
            candidates.addAll((ArrayNode) data);
        }

        boolean hasSpainResults = false;
        for (JsonNode item : candidates) {
            if (isSpain(item)) {
                hasSpainResults = true;
                break;
            }
        }

        for (JsonNode item : candidates) {
            if (hasSpainResults && !isSpain(item)) {
                continue;
            }

            ObjectNode hotel = objectMapper.createObjectNode();
            String name = firstText(item, "name", "city_name", "code");
            String id = firstText(item, "id", "code");
            String country = firstText(item, "country_name", "countryName", "country_code");

            hotel.put("hotelId", id);
            hotel.put("hotelName", name);
            hotel.putNull("priceFrom");
            hotel.putNull("priceAvg");
            hotel.putNull("stars");
            hotel.put("provider", "Travelpayouts");

            ObjectNode location = objectMapper.createObjectNode();
            location.put("name", name);
            location.put("country", country);

            JsonNode coordinates = item.path("coordinates");
            if (!coordinates.isMissingNode()) {
                location.set("geo", coordinates);
            }

            hotel.set("location", location);
            hotel.set("raw", item);
            results.add(hotel);
        }

        return results;
    }

    private boolean matchesHotelFallbackLocation(JsonNode item, String query) {
        if (query == null || query.isBlank()) {
            return true;
        }

        String normalizedQuery = normalizeSearchText(query);
        String name = normalizeSearchText(firstText(item, "name", "city_name"));
        String code = normalizeSearchText(firstText(item, "code", "city_code"));

        return normalizedQuery.equals(name) || normalizedQuery.equals(code);
    }

    private boolean isSpain(JsonNode item) {
        String countryCode = firstText(item, "country_code", "countryCode");
        String countryName = normalizeSearchText(firstText(item, "country_name", "countryName"));

        return "ES".equalsIgnoreCase(countryCode)
                || "espana".equals(countryName)
                || "spain".equals(countryName);
    }

    private boolean matches(JsonNode item, String query) {
        return contains(item.path("code"), query)
                || contains(item.path("name"), query)
                || contains(item.path("city_code"), query)
                || contains(item.path("city_name"), query)
                || contains(item.path("cityName"), query)
                || contains(item.path("city"), query)
                || contains(item.path("airport_name"), query)
                || contains(item.path("main_airport_name"), query)
                || contains(item.path("country_code"), query)
                || contains(item.path("name_translations").path("en"), query)
                || contains(item.path("name_translations").path("es"), query)
                || contains(item.path("city_name_translations").path("en"), query)
                || contains(item.path("city_name_translations").path("es"), query);
    }

    private boolean contains(JsonNode value, String query) {
        return value.isTextual() && value.asText().toLowerCase(Locale.ROOT).contains(query);
    }

    private String normalizeSearchText(String value) {
        if (value == null) {
            return "";
        }

        String normalized = Normalizer.normalize(value, Normalizer.Form.NFD)
                .replaceAll("\\p{M}", "");
        return normalized.trim().toLowerCase(Locale.ROOT);
    }

    private String firstText(JsonNode item, String... fields) {
        for (String field : fields) {
            JsonNode value = item.path(field);
            if (value.isTextual() && !value.asText().isBlank()) {
                return value.asText();
            }
        }

        return "";
    }

    private void copyNumber(JsonNode source, ObjectNode target, String targetField, String... sourceFields) {
        if (target.hasNonNull(targetField)) {
            return;
        }

        for (String sourceField : sourceFields) {
            JsonNode value = source.path(sourceField);
            if (value.isNumber()) {
                target.put(targetField, value.asDouble());
                return;
            }

            if (value.isTextual() && !value.asText().isBlank()) {
                try {
                    target.put(targetField, Double.parseDouble(value.asText()));
                    return;
                } catch (NumberFormatException ignored) {
                    return;
                }
            }
        }
    }

    private String getToken() {
        if (!hasToken()) {
            throw new IllegalStateException("Configura TRAVELPAYOUTS_TOKEN para usar Travelpayouts.");
        }
        return token;
    }

    private boolean hasToken() {
        return token != null && !token.isBlank();
    }

    private String normalizeReferenceLanguage(String language) {
        if ("ru".equalsIgnoreCase(language)) {
            return "ru";
        }

        return "en";
    }

    private String normalizeAutocompleteLanguage(String language) {
        if (language == null || language.isBlank()) {
            return "es";
        }

        return language;
    }

    private String normalizeAutocompleteTerm(String query) {
        if (query == null || query.isBlank()) {
            return "a";
        }

        return query;
    }

    private static void addIfPresent(UriBuilder builder, String name, Object value) {
        if (value != null && !value.toString().isBlank()) {
            builder.queryParam(name, value);
        }
    }

    private static Integer normalizeHotelPriceLimit(Integer limit) {
        if (limit == null) {
            return null;
        }

        return Math.min(limit, 8);
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
