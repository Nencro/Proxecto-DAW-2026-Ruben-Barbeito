package com.proxecto.daw.travelback.controller;

import java.util.List;

import com.proxecto.daw.travelback.dto.PaisResponse;
import com.proxecto.daw.travelback.service.PaisService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/paises")
public class PaisController {

    private final PaisService servicioPaises;

    public PaisController(PaisService servicioPaises) {
        this.servicioPaises = servicioPaises;
    }

    @GetMapping
    public List<PaisResponse> getPaises() {
        return servicioPaises.getPaises();
    }
}
