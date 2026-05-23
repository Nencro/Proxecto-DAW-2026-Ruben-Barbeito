package com.proxecto.daw.travelback.controller;

import com.proxecto.daw.travelback.dto.ProfileResponse;
import com.proxecto.daw.travelback.dto.ProfileUpdateRequest;
import com.proxecto.daw.travelback.service.UserService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/profile")
public class ProfileController {

    private final UserService servicioUsuarios;

    public ProfileController(UserService servicioUsuarios) {
        this.servicioUsuarios = servicioUsuarios;
    }

    @GetMapping
    public ProfileResponse getProfile(@RequestHeader("Authorization") String authorization) {
        return servicioUsuarios.getProfileByAuthorization(authorization);
    }

    @PostMapping
    public ProfileResponse updateProfile(
            @RequestHeader("Authorization") String authorization,
            @Valid @RequestBody ProfileUpdateRequest peticion
    ) {
        return servicioUsuarios.updateProfile(authorization, peticion);
    }
}
