package com.proxecto.daw.travelback.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record PasswordRecoverRequest(
        @NotBlank(message = "El nombre de usuario es obligatorio.")
        String userName,

        @NotBlank(message = "El email es obligatorio.")
        @Email(message = "El email debe tener un formato valido.")
        String email,

        @NotBlank(message = "La nueva contrasena es obligatoria.")
        @Size(min = 6, max = 100, message = "La contrasena debe tener entre 6 y 100 caracteres.")
        String newPassword
) {
}
