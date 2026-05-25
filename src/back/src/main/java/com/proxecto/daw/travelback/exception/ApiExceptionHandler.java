package com.proxecto.daw.travelback.exception;

import java.util.HashMap;
import java.util.Map;

import com.proxecto.daw.travelback.dto.ApiErrorResponse;
import org.springframework.dao.DataAccessException;
import org.springframework.dao.DuplicateKeyException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.client.RestClientResponseException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@RestControllerAdvice
public class ApiExceptionHandler {

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ApiErrorResponse> handleValidation(MethodArgumentNotValidException excepcion) {
        Map<String, String> errores = new HashMap<>();
        excepcion.getBindingResult().getFieldErrors()
                .forEach(errorCampo -> errores.put(errorCampo.getField(), errorCampo.getDefaultMessage()));

        return ResponseEntity.badRequest()
                .body(ApiErrorResponse.withErrors(1, "No se pudo completar el registro.", errores));
    }

    @ExceptionHandler(DuplicateKeyException.class)
    public ResponseEntity<ApiErrorResponse> handleDuplicateKey(DuplicateKeyException excepcion) {
        return ResponseEntity.status(HttpStatus.CONFLICT)
                .body(ApiErrorResponse.withDetail(1, "No se pudo completar el registro.", "El usuario o el email ya estan registrados."));
    }

    @ExceptionHandler(RegisterConflictException.class)
    public ResponseEntity<ApiErrorResponse> handleRegisterConflict(RegisterConflictException excepcion) {
        return ResponseEntity.status(HttpStatus.CONFLICT)
                .body(ApiErrorResponse.of(excepcion.getCodigo(), excepcion.getMessage()));
    }

    @ExceptionHandler(LoginException.class)
    public ResponseEntity<ApiErrorResponse> handleLogin(LoginException excepcion) {
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body(ApiErrorResponse.of(excepcion.getCodigo(), excepcion.getMessage()));
    }

    @ExceptionHandler(ResourceNotFoundException.class)
    public ResponseEntity<ApiErrorResponse> handleNotFound(ResourceNotFoundException excepcion) {
        return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(ApiErrorResponse.of(1, excepcion.getMessage()));
    }

    @ExceptionHandler(DataAccessException.class)
    public ResponseEntity<ApiErrorResponse> handleDataAccess(DataAccessException excepcion) {
        String detalle = excepcion.getMostSpecificCause().getMessage();

        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(ApiErrorResponse.withDetail(1, "Error al guardar el registro en la base de datos.", detalle));
    }

    @ExceptionHandler(IllegalStateException.class)
    public ResponseEntity<ApiErrorResponse> handleIllegalState(IllegalStateException excepcion) {
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(ApiErrorResponse.of(1, "Error de servidor."));
    }

    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<ApiErrorResponse> handleIllegalArgument(IllegalArgumentException excepcion) {
        return ResponseEntity.badRequest()
                .body(ApiErrorResponse.of(1, excepcion.getMessage()));
    }

    @ExceptionHandler(RestClientResponseException.class)
    public ResponseEntity<ApiErrorResponse> handleRestClientResponse(RestClientResponseException excepcion) {
        return ResponseEntity.status(excepcion.getStatusCode())
                .body(ApiErrorResponse.withDetail(1, "Error al consultar Duffel.", excepcion.getResponseBodyAsString()));
    }
}
