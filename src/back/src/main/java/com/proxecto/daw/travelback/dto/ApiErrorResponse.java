package com.proxecto.daw.travelback.dto;

import java.util.Map;

public record ApiErrorResponse(
        int codigo,
        String mensaje,
        String detalle,
        Map<String, String> errores
) {
    public static ApiErrorResponse of(int codigo, String mensaje) {
        return new ApiErrorResponse(codigo, mensaje, null, null);
    }

    public static ApiErrorResponse withDetail(int codigo, String mensaje, String detalle) {
        return new ApiErrorResponse(codigo, mensaje, detalle, null);
    }

    public static ApiErrorResponse withErrors(int codigo, String mensaje, Map<String, String> errores) {
        return new ApiErrorResponse(codigo, mensaje, null, errores);
    }
}
