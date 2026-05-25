package com.proxecto.daw.travelback.controller;

import com.proxecto.daw.travelback.dto.LoginRequest;
import com.proxecto.daw.travelback.dto.LoginResponse;
import com.proxecto.daw.travelback.dto.PasswordRecoverRequest;
import com.proxecto.daw.travelback.dto.RegisterRequest;
import com.proxecto.daw.travelback.dto.RegisterResponse;
import com.proxecto.daw.travelback.service.UserService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final UserService servicioUsuarios;

    public AuthController(UserService servicioUsuarios) {
        this.servicioUsuarios = servicioUsuarios;
    }

    @PostMapping("/register")
    @ResponseStatus(HttpStatus.CREATED)
    public RegisterResponse register(@Valid @RequestBody RegisterRequest peticion) {
        return servicioUsuarios.register(peticion);
    }

    @PostMapping("/login")
    public LoginResponse login(@Valid @RequestBody LoginRequest peticion) {
        return servicioUsuarios.login(peticion);
    }

    @PostMapping("/password/recover")
    public void recoverPassword(@Valid @RequestBody PasswordRecoverRequest peticion) {
        servicioUsuarios.recoverPassword(peticion);
    }
}
