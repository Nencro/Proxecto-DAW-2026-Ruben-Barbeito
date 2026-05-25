package com.proxecto.daw.travelback.service;

import java.util.List;

import com.proxecto.daw.travelback.dto.PaisResponse;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;

@Service
public class PaisService {

    private final JdbcTemplate jdbcTemplate;

    public PaisService(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    public List<PaisResponse> getPaises() {
        return jdbcTemplate.query(
                """
                SELECT id, nombre, codigo, prefijo
                FROM pais
                ORDER BY nombre
                """,
                (resultado, fila) -> new PaisResponse(
                        resultado.getLong("id"),
                        resultado.getString("nombre"),
                        resultado.getString("codigo"),
                        resultado.getString("prefijo")
                )
        );
    }
}
