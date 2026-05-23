package com.proxecto.daw.travelback.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record RegisterRequest(
        @NotBlank(message = "El nombre de usuario es obligatorio.")
        @Size(min = 3, max = 50, message = "El nombre de usuario debe tener entre 3 y 50 caracteres.")
        @Pattern(
                regexp = "^[A-Za-z0-9._-]+$",
                message = "El nombre de usuario solo puede contener letras, numeros, puntos, guiones y guiones bajos."
        )
        String userName,

        @NotBlank(message = "El email es obligatorio.")
        @Email(message = "El email no tiene un formato valido.")
        @Size(max = 190, message = "El email no puede superar los 190 caracteres.")
        String email,

        @NotBlank(message = "La contrasena es obligatoria.")
        @Size(min = 6, max = 100, message = "La contrasena debe tener entre 6 y 100 caracteres.")
        String password
) {
}
