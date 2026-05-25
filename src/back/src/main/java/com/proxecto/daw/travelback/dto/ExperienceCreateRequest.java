package com.proxecto.daw.travelback.dto;

import java.math.BigDecimal;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record ExperienceCreateRequest(
        @NotBlank(message = "El nombre es obligatorio.")
        @Size(max = 150, message = "El nombre no puede superar los 150 caracteres.")
        String nombre,

        @NotBlank(message = "La localidad es obligatoria.")
        @Size(max = 150, message = "La localidad no puede superar los 150 caracteres.")
        String localidad,

        @NotBlank(message = "La descripcion es obligatoria.")
        String descripcion,

        @NotNull(message = "El tamano minimo es obligatorio.")
        @Min(value = 1, message = "El tamano minimo debe ser al menos 1.")
        Integer tamanioMinimo,

        @NotNull(message = "El tamano maximo es obligatorio.")
        @Min(value = 1, message = "El tamano maximo debe ser al menos 1.")
        Integer tamanioMaximo,

        @NotNull(message = "La duracion es obligatoria.")
        @Min(value = 1, message = "La duracion debe ser al menos 1 minuto.")
        Integer duracionMinutos,

        @NotNull(message = "El precio es obligatorio.")
        @DecimalMin(value = "0.0", inclusive = true, message = "El precio no puede ser negativo.")
        BigDecimal precio,

        @NotBlank(message = "El pais es obligatorio.")
        String pais,

        @NotBlank(message = "El codigo de pais es obligatorio.")
        @Size(min = 2, max = 2, message = "El codigo de pais debe tener 2 caracteres.")
        String codigoPais,

        String imagen,

        String imagenTipo
) {
}
