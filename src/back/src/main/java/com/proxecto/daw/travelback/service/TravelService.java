package com.proxecto.daw.travelback.service;

import java.util.List;
import java.util.Objects;

import java.sql.PreparedStatement;
import java.sql.Statement;
import java.time.LocalDate;

import com.proxecto.daw.travelback.dto.TravelCreateRequest;
import com.proxecto.daw.travelback.dto.TravelResponse;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.support.GeneratedKeyHolder;
import org.springframework.jdbc.support.KeyHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class TravelService {

    private final JdbcTemplate jdbcTemplate;
    private final JwtService jwtService;

    public TravelService(JdbcTemplate jdbcTemplate, JwtService jwtService) {
        this.jdbcTemplate = jdbcTemplate;
        this.jwtService = jwtService;
    }

    public List<TravelResponse> getTravelsByAuthorization(String authorization) {
        String userName = jwtService.getUserNameFromAuthorization(authorization);

        return jdbcTemplate.query(
                getTravelsSql("""
                WHERE usuario_actual.username = ?
                ORDER BY v.fecha_inicio DESC, v.id DESC
                """),
                this::mapTravel,
                userName
        );
    }

    @Transactional
    public TravelResponse createTravel(String authorization, TravelCreateRequest request) {
        String userName = jwtService.getUserNameFromAuthorization(authorization);
        Long userId = getUserId(userName);
        LocalDate fechaInicio = parseDate(request.fechaInicio(), "fechaInicio");
        LocalDate fechaFin = parseDate(request.fechaFin(), "fechaFin");

        if (fechaFin.isBefore(fechaInicio)) {
            throw new IllegalArgumentException("La fecha de fin no puede ser anterior a la fecha de inicio.");
        }

        Long destinoId = createDestination(request);
        Long travelId = createTravelRow(fechaInicio, fechaFin, destinoId, userId);

        return getTravelById(userName, travelId);
    }

    private TravelResponse getTravelById(String userName, Long travelId) {
        return jdbcTemplate.queryForObject(
                getTravelsSql("""
                WHERE usuario_actual.username = ?
                  AND v.id = ?
                """),
                this::mapTravel,
                userName,
                travelId
        );
    }

    private Long createDestination(TravelCreateRequest request) {
        KeyHolder keyHolder = new GeneratedKeyHolder();
        String descripcion = Objects.toString(request.descripcion(), "").trim();

        jdbcTemplate.update(connection -> {
            PreparedStatement statement = connection.prepareStatement(
                    """
                    INSERT INTO destino (nombre, descripcion, pais)
                    VALUES (?, ?, ?)
                    """,
                    Statement.RETURN_GENERATED_KEYS
            );
            statement.setString(1, request.destino().trim());
            statement.setString(2, descripcion);
            statement.setString(3, request.pais().trim());
            return statement;
        }, keyHolder);

        return Objects.requireNonNull(keyHolder.getKey(), "No se pudo obtener el id del destino creado.").longValue();
    }

    private Long createTravelRow(LocalDate fechaInicio, LocalDate fechaFin, Long destinoId, Long userId) {
        KeyHolder keyHolder = new GeneratedKeyHolder();

        jdbcTemplate.update(connection -> {
            PreparedStatement statement = connection.prepareStatement(
                    """
                    INSERT INTO viaje (fecha_inicio, fecha_fin, destino_id, id_creador)
                    VALUES (?, ?, ?, ?)
                    """,
                    Statement.RETURN_GENERATED_KEYS
            );
            statement.setObject(1, fechaInicio);
            statement.setObject(2, fechaFin);
            statement.setLong(3, destinoId);
            statement.setLong(4, userId);
            return statement;
        }, keyHolder);

        return Objects.requireNonNull(keyHolder.getKey(), "No se pudo obtener el id del viaje creado.").longValue();
    }

    private Long getUserId(String userName) {
        return jdbcTemplate.queryForObject(
                "SELECT id FROM usuario WHERE username = ?",
                Long.class,
                userName
        );
    }

    private LocalDate parseDate(String value, String fieldName) {
        try {
            return LocalDate.parse(Objects.toString(value, "").trim());
        } catch (RuntimeException exception) {
            throw new IllegalArgumentException("El campo " + fieldName + " debe tener formato yyyy-MM-dd.");
        }
    }

    private String getTravelsSql(String filter) {
        return """
                SELECT DISTINCT
                    v.id,
                    v.fecha_inicio,
                    v.fecha_fin,
                    v.id_creador,
                    d.nombre AS destino,
                    d.pais,
                    d.descripcion,
                    creador.username AS creador_username,
                    CASE
                        WHEN v.id_creador = usuario_actual.id THEN 'CREADOR'
                        ELSE 'PARTICIPANTE'
                    END AS rol_en_viaje
                FROM usuario usuario_actual
                INNER JOIN viaje v
                    ON v.id_creador = usuario_actual.id
                    OR EXISTS (
                        SELECT 1
                        FROM participante_viaje pv
                        WHERE pv.viaje_id = v.id
                          AND pv.usuario_id = usuario_actual.id
                    )
                INNER JOIN destino d ON d.id = v.destino_id
                INNER JOIN usuario creador ON creador.id = v.id_creador
                """
                + filter;
    }

    private TravelResponse mapTravel(java.sql.ResultSet resultado, int fila) throws java.sql.SQLException {
        return new TravelResponse(
                resultado.getLong("id"),
                Objects.toString(resultado.getString("destino"), ""),
                Objects.toString(resultado.getString("pais"), ""),
                Objects.toString(resultado.getString("descripcion"), ""),
                Objects.toString(resultado.getDate("fecha_inicio"), ""),
                Objects.toString(resultado.getDate("fecha_fin"), ""),
                resultado.getLong("id_creador"),
                Objects.toString(resultado.getString("creador_username"), ""),
                Objects.toString(resultado.getString("rol_en_viaje"), "")
        );
    }
}
