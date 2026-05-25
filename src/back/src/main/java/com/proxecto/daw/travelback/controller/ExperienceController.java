package com.proxecto.daw.travelback.controller;

import java.util.List;

import com.proxecto.daw.travelback.dto.ExperienceCreateRequest;
import com.proxecto.daw.travelback.dto.ExperienceResponse;
import com.proxecto.daw.travelback.service.ExperienceService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/experiences")
public class ExperienceController {

    private final ExperienceService experienceService;

    public ExperienceController(ExperienceService experienceService) {
        this.experienceService = experienceService;
    }

    @GetMapping
    public List<ExperienceResponse> getExperiences(
            @RequestHeader(value = "Authorization", required = false) String authorization,
            @RequestParam(value = "nombre", required = false) String nombre,
            @RequestParam(value = "localidad", required = false) String localidad,
            @RequestParam(value = "pais", required = false) String pais,
            @RequestParam(value = "mine", required = false, defaultValue = "false") boolean mine
    ) {
        return experienceService.getExperiences(authorization, nombre, localidad, pais, mine);
    }

    @GetMapping("/{id}")
    public ExperienceResponse getExperience(@PathVariable Long id) {
        return experienceService.getExperience(id);
    }

    @PostMapping
    public ExperienceResponse createExperience(
            @RequestHeader("Authorization") String authorization,
            @Valid @RequestBody ExperienceCreateRequest request
    ) {
        return experienceService.createExperience(authorization, request);
    }

    @PutMapping("/{id}")
    public ExperienceResponse updateExperience(
            @RequestHeader("Authorization") String authorization,
            @PathVariable Long id,
            @Valid @RequestBody ExperienceCreateRequest request
    ) {
        return experienceService.updateExperience(authorization, id, request);
    }

    @DeleteMapping("/{id}")
    public void deleteExperience(
            @RequestHeader("Authorization") String authorization,
            @PathVariable Long id
    ) {
        experienceService.deleteExperience(authorization, id);
    }
}
