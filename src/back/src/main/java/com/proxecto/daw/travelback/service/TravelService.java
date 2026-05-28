package com.proxecto.daw.travelback.service;

import java.util.List;
import java.util.Objects;

import java.sql.PreparedStatement;
import java.sql.Statement;
import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.time.LocalTime;
import java.time.temporal.ChronoUnit;

import com.proxecto.daw.travelback.exception.LoginException;
import com.proxecto.daw.travelback.dto.TravelActivityResponse;
import com.proxecto.daw.travelback.dto.TravelActivitySaveRequest;
import com.proxecto.daw.travelback.dto.TravelCreateRequest;
import com.proxecto.daw.travelback.dto.TravelInviteResponse;
import com.proxecto.daw.travelback.dto.TravelParticipantResponse;
import com.proxecto.daw.travelback.dto.TravelParticipantsUpdateRequest;
import com.proxecto.daw.travelback.dto.TravelResponse;
import com.proxecto.daw.travelback.dto.TravelUpdateRequest;
import org.springframework.dao.EmptyResultDataAccessException;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.support.GeneratedKeyHolder;
import org.springframework.jdbc.support.KeyHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class TravelService {

    private static final int DIAS_VALIDEZ_INVITACION = 3;

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
                  AND (
                      EXISTS (
                          SELECT 1
                          FROM usuario_rol ur_admin
                          INNER JOIN rol r_admin ON r_admin.id = ur_admin.rol_id
                          WHERE ur_admin.usuario_id = usuario_actual.id
                            AND r_admin.nombre = 'ADMIN'
                      )
                      OR v.id_creador = usuario_actual.id
                      OR EXISTS (
                          SELECT 1
                          FROM participante_viaje pv
                          WHERE pv.viaje_id = v.id
                            AND pv.usuario_id = usuario_actual.id
                      )
                  )
                ORDER BY v.fecha_inicio DESC, v.id DESC
                """),
                this::mapTravel,
                userName
        );
    }

    public TravelResponse getTravelByAuthorization(String authorization, Long travelId) {
        String userName = jwtService.getUserNameFromAuthorization(authorization);
        return getTravelById(userName, travelId);
    }

    @Transactional
    public TravelInviteResponse createInvite(String authorization, Long travelId) {
        String userName = jwtService.getUserNameFromAuthorization(authorization);
        Long userId = getUserId(userName);
        TravelResponse travel = getTravelById(userName, travelId);

        if (!canManageTravel(travel)) {
            throw new IllegalArgumentException("Solo el creador puede generar enlaces de invitacion.");
        }

        Instant expiration = Instant.now().plus(DIAS_VALIDEZ_INVITACION, ChronoUnit.DAYS);
        String token = jwtService.generateTravelInviteToken(travelId, userId, expiration);

        return new TravelInviteResponse(travelId, token, expiration.toString());
    }

    @Transactional
    public TravelResponse joinTravelByInvite(String authorization, String token) {
        String userName = jwtService.getUserNameFromAuthorization(authorization);
        Long userId = getUserId(userName);
        Long travelId = jwtService.getTravelIdFromInviteToken(token);

        Long creatorId = jdbcTemplate.queryForObject(
                "SELECT id_creador FROM viaje WHERE id = ?",
                Long.class,
                travelId
        );

        if (!Objects.equals(creatorId, userId)) {
            jdbcTemplate.update(
                    """
                    INSERT IGNORE INTO participante_viaje (usuario_id, viaje_id)
                    VALUES (?, ?)
                    """,
                    userId,
                    travelId
            );
        }

        return getTravelById(userName, travelId);
    }

    public List<TravelActivityResponse> getTravelActivitiesByAuthorization(String authorization, Long travelId) {
        String userName = jwtService.getUserNameFromAuthorization(authorization);

        return jdbcTemplate.query(
                """
                SELECT i.id, i.viaje_id, i.fecha, i.hora, i.coste, i.descripcion
                FROM itinerario i
                INNER JOIN viaje v ON v.id = i.viaje_id
                INNER JOIN usuario usuario_actual ON usuario_actual.username = ?
                WHERE i.viaje_id = ?
                  AND (
                        EXISTS (
                            SELECT 1
                            FROM usuario_rol ur_admin
                            INNER JOIN rol r_admin ON r_admin.id = ur_admin.rol_id
                            WHERE ur_admin.usuario_id = usuario_actual.id
                              AND r_admin.nombre = 'ADMIN'
                        )
                        OR v.id_creador = usuario_actual.id
                        OR EXISTS (
                            SELECT 1
                            FROM participante_viaje pv
                            WHERE pv.viaje_id = v.id
                              AND pv.usuario_id = usuario_actual.id
                        )
                  )
                ORDER BY i.fecha ASC, i.hora ASC, i.id ASC
                """,
                this::mapActivity,
                userName,
                travelId
        );
    }

    @Transactional
    public TravelActivityResponse createTravelActivity(
            String authorization,
            Long travelId,
            TravelActivitySaveRequest request
    ) {
        String userName = jwtService.getUserNameFromAuthorization(authorization);
        TravelResponse travel = getTravelById(userName, travelId);
        LocalDate fecha = parseDate(request.fecha(), "fecha");
        LocalTime hora = parseTime(request.hora());

        validateActivityDate(travel, fecha);

        KeyHolder keyHolder = new GeneratedKeyHolder();
        String descripcion = Objects.toString(request.descripcion(), "").trim();

        jdbcTemplate.update(connection -> {
            PreparedStatement statement = connection.prepareStatement(
                    """
                    INSERT INTO itinerario (fecha, hora, coste, descripcion, viaje_id)
                    VALUES (?, ?, ?, ?, ?)
                    """,
                    Statement.RETURN_GENERATED_KEYS
            );
            statement.setObject(1, fecha);
            statement.setObject(2, hora);
            statement.setBigDecimal(3, normalizeMoney(request.coste()));
            statement.setString(4, descripcion);
            statement.setLong(5, travelId);
            return statement;
        }, keyHolder);

        Long activityId = Objects.requireNonNull(keyHolder.getKey(), "No se pudo obtener el id de la actividad creada.").longValue();
        return getTravelActivityById(userName, travelId, activityId);
    }

    @Transactional
    public List<TravelActivityResponse> replaceTravelActivities(
            String authorization,
            Long travelId,
            String fechaValue,
            List<TravelActivitySaveRequest> requests
    ) {
        String userName = jwtService.getUserNameFromAuthorization(authorization);
        TravelResponse travel = getTravelById(userName, travelId);
        LocalDate fecha = parseDate(fechaValue, "fecha");

        validateActivityDate(travel, fecha);

        for (TravelActivitySaveRequest request : requests) {
            LocalDate requestDate = parseDate(request.fecha(), "fecha");

            if (!fecha.equals(requestDate)) {
                throw new IllegalArgumentException("Todas las actividades guardadas deben pertenecer al dia seleccionado.");
            }

            parseTime(request.hora());
            String descripcion = Objects.toString(request.descripcion(), "").trim();

            if (descripcion.isBlank()) {
                throw new IllegalArgumentException("La descripcion es obligatoria.");
            }
        }

        jdbcTemplate.update(
                "DELETE FROM itinerario WHERE viaje_id = ? AND fecha = ?",
                travelId,
                fecha
        );

        for (TravelActivitySaveRequest request : requests) {
            jdbcTemplate.update(
                    """
                    INSERT INTO itinerario (fecha, hora, coste, descripcion, viaje_id)
                    VALUES (?, ?, ?, ?, ?)
                    """,
                    fecha,
                    parseTime(request.hora()),
                    normalizeMoney(request.coste()),
                    request.descripcion().trim(),
                    travelId
            );
        }

        return getTravelActivitiesByAuthorization(authorization, travelId).stream()
                .filter(activity -> fecha.toString().equals(activity.fecha()))
                .toList();
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

        Long paisId = getOrCreateCountry(request.pais(), request.codigoPais());
        Long destinoId = createDestination(request, paisId);
        Long travelId = createTravelRow(fechaInicio, fechaFin, destinoId, userId, request.costeBillete());

        return getTravelById(userName, travelId);
    }

    @Transactional
    public TravelResponse updateTravel(String authorization, Long travelId, TravelUpdateRequest request) {
        String userName = jwtService.getUserNameFromAuthorization(authorization);
        TravelResponse travel = getTravelById(userName, travelId);

        if (!canManageTravel(travel)) {
            throw new IllegalArgumentException("Solo el creador puede editar el viaje.");
        }

        LocalDate fechaInicio = parseDate(request.fechaInicio(), "fechaInicio");
        LocalDate fechaFin = parseDate(request.fechaFin(), "fechaFin");

        if (fechaFin.isBefore(fechaInicio)) {
            throw new IllegalArgumentException("La fecha de fin no puede ser anterior a la fecha de inicio.");
        }

        jdbcTemplate.update(
                """
                UPDATE destino d
                INNER JOIN viaje v ON v.destino_id = d.id
                SET d.descripcion = ?
                WHERE v.id = ?
                """,
                Objects.toString(request.descripcion(), "").trim(),
                travelId
        );

        jdbcTemplate.update(
                """
                UPDATE viaje
                SET fecha_inicio = ?, fecha_fin = ?, coste_billete = ?
                WHERE id = ?
                """,
                fechaInicio,
                fechaFin,
                normalizeMoney(request.costeBillete()),
                travelId
        );

        jdbcTemplate.update(
                """
                DELETE FROM itinerario
                WHERE viaje_id = ?
                  AND (fecha < ? OR fecha > ?)
                """,
                travelId,
                fechaInicio,
                fechaFin
        );

        return getTravelById(userName, travelId);
    }

    @Transactional
    public void deleteTravel(String authorization, Long travelId) {
        String userName = jwtService.getUserNameFromAuthorization(authorization);
        Long userId = getUserId(userName);
        TravelResponse travel = getTravelById(userName, travelId);

        if (!Objects.equals(travel.creadorId(), userId)) {
            throw new IllegalArgumentException("Solo el creador puede borrar el viaje.");
        }

        Long destinationId = jdbcTemplate.queryForObject(
                "SELECT destino_id FROM viaje WHERE id = ?",
                Long.class,
                travelId
        );

        jdbcTemplate.update("DELETE FROM viaje WHERE id = ?", travelId);
        jdbcTemplate.update(
                """
                DELETE FROM destino
                WHERE id = ?
                  AND NOT EXISTS (
                      SELECT 1
                      FROM viaje
                      WHERE destino_id = ?
                  )
                """,
                destinationId,
                destinationId
        );
    }

    public List<TravelParticipantResponse> getTravelParticipants(String authorization, Long travelId) {
        String userName = jwtService.getUserNameFromAuthorization(authorization);
        getTravelById(userName, travelId);

        return getTravelParticipantsByTravelId(travelId);
    }

    @Transactional
    public List<TravelParticipantResponse> updateTravelParticipants(
            String authorization,
            Long travelId,
            TravelParticipantsUpdateRequest request
    ) {
        String userName = jwtService.getUserNameFromAuthorization(authorization);
        Long userId = getUserId(userName);
        TravelResponse travel = getTravelById(userName, travelId);

        if (!canManageTravel(travel)) {
            if (Objects.equals(travel.creadorId(), userId)) {
                throw new IllegalArgumentException("El creador no puede eliminarse a si mismo del viaje.");
            }

            jdbcTemplate.update(
                    "DELETE FROM participante_viaje WHERE viaje_id = ? AND usuario_id = ?",
                    travelId,
                    userId
            );

            return getTravelParticipantsByTravelId(travelId);
        }

        List<Long> participantIds = request == null || request.participantIds() == null
                ? List.of()
                : request.participantIds().stream()
                        .filter(Objects::nonNull)
                        .filter(id -> !Objects.equals(id, travel.creadorId()))
                        .distinct()
                        .toList();

        jdbcTemplate.update("DELETE FROM participante_viaje WHERE viaje_id = ?", travelId);

        for (Long participantId : participantIds) {
            Integer exists = jdbcTemplate.queryForObject(
                    "SELECT COUNT(*) FROM usuario WHERE id = ?",
                    Integer.class,
                    participantId
            );

            if (exists != null && exists > 0) {
                jdbcTemplate.update(
                        """
                        INSERT INTO participante_viaje (usuario_id, viaje_id)
                        VALUES (?, ?)
                        """,
                        participantId,
                        travelId
                );
            }
        }

        return getTravelParticipantsByTravelId(travelId);
    }

    private List<TravelParticipantResponse> getTravelParticipantsByTravelId(Long travelId) {
        return jdbcTemplate.query(
                """
                SELECT participantes.id,
                       participantes.username,
                       participantes.nombre,
                       participantes.apellidos,
                       participantes.email,
                       participantes.rol_en_viaje
                FROM (
                    SELECT u.id, u.username, u.nombre, u.apellidos, u.email, 'CREADOR' AS rol_en_viaje
                    FROM viaje v
                    INNER JOIN usuario u ON u.id = v.id_creador
                    WHERE v.id = ?

                    UNION ALL

                    SELECT u.id, u.username, u.nombre, u.apellidos, u.email, 'PARTICIPANTE' AS rol_en_viaje
                    FROM participante_viaje pv
                    INNER JOIN usuario u ON u.id = pv.usuario_id
                    WHERE pv.viaje_id = ?
                      AND pv.usuario_id <> (
                          SELECT v.id_creador
                          FROM viaje v
                          WHERE v.id = ?
                      )
                ) participantes
                ORDER BY CASE WHEN participantes.rol_en_viaje = 'CREADOR' THEN 0 ELSE 1 END,
                         participantes.username ASC
                """,
                this::mapParticipant,
                travelId,
                travelId,
                travelId
        );
    }

    private TravelResponse getTravelById(String userName, Long travelId) {
        try {
            return jdbcTemplate.queryForObject(
                    getTravelsSql("""
                    WHERE usuario_actual.username = ?
                      AND v.id = ?
                      AND (
                          EXISTS (
                              SELECT 1
                              FROM usuario_rol ur_admin
                              INNER JOIN rol r_admin ON r_admin.id = ur_admin.rol_id
                              WHERE ur_admin.usuario_id = usuario_actual.id
                                AND r_admin.nombre = 'ADMIN'
                          )
                          OR v.id_creador = usuario_actual.id
                          OR EXISTS (
                              SELECT 1
                              FROM participante_viaje pv
                              WHERE pv.viaje_id = v.id
                                AND pv.usuario_id = usuario_actual.id
                          )
                      )
                    """),
                    this::mapTravel,
                    userName,
                    travelId
            );
        } catch (EmptyResultDataAccessException exception) {
            throw new LoginException(4, "No autorizado.");
        }
    }

    private Long createDestination(TravelCreateRequest request, Long paisId) {
        KeyHolder keyHolder = new GeneratedKeyHolder();
        String descripcion = Objects.toString(request.descripcion(), "").trim();

        jdbcTemplate.update(connection -> {
            PreparedStatement statement = connection.prepareStatement(
                    """
                    INSERT INTO destino (nombre, descripcion, pais_id)
                    VALUES (?, ?, ?)
                    """,
                    Statement.RETURN_GENERATED_KEYS
            );
            statement.setString(1, request.destino().trim());
            statement.setString(2, descripcion);
            statement.setLong(3, paisId);
            return statement;
        }, keyHolder);

        return Objects.requireNonNull(keyHolder.getKey(), "No se pudo obtener el id del destino creado.").longValue();
    }

    private Long getOrCreateCountry(String pais, String codigoPais) {
        String code = normalizeCountryCode(codigoPais);
        String countryName = Objects.toString(pais, "").trim();

        List<Long> idsByCode = jdbcTemplate.queryForList(
                "SELECT id FROM pais WHERE codigo = ?",
                Long.class,
                code
        );

        if (!idsByCode.isEmpty()) {
            return idsByCode.get(0);
        }

        List<Long> idsByName = jdbcTemplate.queryForList(
                "SELECT id FROM pais WHERE nombre = ?",
                Long.class,
                countryName
        );

        if (!idsByName.isEmpty()) {
            return idsByName.get(0);
        }

        KeyHolder keyHolder = new GeneratedKeyHolder();
        jdbcTemplate.update(connection -> {
            PreparedStatement statement = connection.prepareStatement(
                    """
                    INSERT INTO pais (nombre, codigo, prefijo)
                    VALUES (?, ?, ?)
                    """,
                    Statement.RETURN_GENERATED_KEYS
            );
            statement.setString(1, countryName);
            statement.setString(2, code);
            statement.setString(3, "");
            return statement;
        }, keyHolder);

        return Objects.requireNonNull(keyHolder.getKey(), "No se pudo obtener el id del pais creado.").longValue();
    }

    private Long createTravelRow(LocalDate fechaInicio, LocalDate fechaFin, Long destinoId, Long userId, BigDecimal costeBillete) {
        KeyHolder keyHolder = new GeneratedKeyHolder();

        jdbcTemplate.update(connection -> {
            PreparedStatement statement = connection.prepareStatement(
                    """
                    INSERT INTO viaje (fecha_inicio, fecha_fin, destino_id, id_creador, coste_billete)
                    VALUES (?, ?, ?, ?, ?)
                    """,
                    Statement.RETURN_GENERATED_KEYS
            );
            statement.setObject(1, fechaInicio);
            statement.setObject(2, fechaFin);
            statement.setLong(3, destinoId);
            statement.setLong(4, userId);
            statement.setBigDecimal(5, normalizeMoney(costeBillete));
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

    private LocalTime parseTime(String value) {
        try {
            return LocalTime.parse(Objects.toString(value, "").trim());
        } catch (RuntimeException exception) {
            throw new IllegalArgumentException("El campo hora debe tener formato HH:mm.");
        }
    }

    private void validateActivityDate(TravelResponse travel, LocalDate fecha) {
        LocalDate inicio = parseDate(travel.fechaInicio(), "fechaInicio");
        LocalDate fin = parseDate(travel.fechaFin(), "fechaFin");

        if (fecha.isBefore(inicio) || fecha.isAfter(fin)) {
            throw new IllegalArgumentException("La fecha de la actividad debe estar dentro de las fechas del viaje.");
        }
    }

    private TravelActivityResponse getTravelActivityById(String userName, Long travelId, Long activityId) {
        return jdbcTemplate.queryForObject(
                """
                SELECT i.id, i.viaje_id, i.fecha, i.hora, i.coste, i.descripcion
                FROM itinerario i
                INNER JOIN viaje v ON v.id = i.viaje_id
                INNER JOIN usuario usuario_actual ON usuario_actual.username = ?
                WHERE i.viaje_id = ?
                  AND i.id = ?
                  AND (
                        EXISTS (
                            SELECT 1
                            FROM usuario_rol ur_admin
                            INNER JOIN rol r_admin ON r_admin.id = ur_admin.rol_id
                            WHERE ur_admin.usuario_id = usuario_actual.id
                              AND r_admin.nombre = 'ADMIN'
                        )
                        OR v.id_creador = usuario_actual.id
                        OR EXISTS (
                            SELECT 1
                            FROM participante_viaje pv
                            WHERE pv.viaje_id = v.id
                              AND pv.usuario_id = usuario_actual.id
                        )
                  )
                """,
                this::mapActivity,
                userName,
                travelId,
                activityId
        );
    }

    private String getTravelsSql(String filter) {
        return """
                SELECT DISTINCT
                    v.id,
                    v.fecha_inicio,
                    v.fecha_fin,
                    v.coste_billete,
                    v.id_creador,
                    d.nombre AS destino,
                    p.nombre AS pais,
                    p.codigo AS codigo_pais,
                    d.descripcion,
                    creador.username AS creador_username,
                    1 + (
                        SELECT COUNT(*)
                        FROM participante_viaje pv_count
                        WHERE pv_count.viaje_id = v.id
                          AND pv_count.usuario_id <> v.id_creador
                    ) AS numero_participantes,
                    CASE
                        WHEN v.id_creador = usuario_actual.id THEN 'CREADOR'
                        WHEN EXISTS (
                            SELECT 1
                            FROM usuario_rol ur_admin
                            INNER JOIN rol r_admin ON r_admin.id = ur_admin.rol_id
                            WHERE ur_admin.usuario_id = usuario_actual.id
                              AND r_admin.nombre = 'ADMIN'
                        ) THEN 'ADMIN'
                        ELSE 'PARTICIPANTE'
                    END AS rol_en_viaje
                FROM usuario usuario_actual
                INNER JOIN viaje v ON 1 = 1
                INNER JOIN destino d ON d.id = v.destino_id
                INNER JOIN pais p ON p.id = d.pais_id
                INNER JOIN usuario creador ON creador.id = v.id_creador
                """
                + filter;
    }

    private TravelResponse mapTravel(java.sql.ResultSet resultado, int fila) throws java.sql.SQLException {
        return new TravelResponse(
                resultado.getLong("id"),
                Objects.toString(resultado.getString("destino"), ""),
                Objects.toString(resultado.getString("pais"), ""),
                Objects.toString(resultado.getString("codigo_pais"), ""),
                Objects.toString(resultado.getString("descripcion"), ""),
                Objects.toString(resultado.getDate("fecha_inicio"), ""),
                Objects.toString(resultado.getDate("fecha_fin"), ""),
                resultado.getBigDecimal("coste_billete"),
                resultado.getLong("id_creador"),
                Objects.toString(resultado.getString("creador_username"), ""),
                resultado.getInt("numero_participantes"),
                Objects.toString(resultado.getString("rol_en_viaje"), "")
        );
    }

    private String normalizeCountryCode(String value) {
        String code = Objects.toString(value, "").trim().toUpperCase();
        return code.isBlank() ? null : code;
    }

    private boolean canManageTravel(TravelResponse travel) {
        return "CREADOR".equals(travel.rolEnViaje()) || "ADMIN".equals(travel.rolEnViaje());
    }

    private BigDecimal normalizeMoney(BigDecimal value) {
        return value == null ? BigDecimal.ZERO : value;
    }

    private TravelActivityResponse mapActivity(java.sql.ResultSet resultado, int fila) throws java.sql.SQLException {
        java.sql.Time hora = resultado.getTime("hora");

        return new TravelActivityResponse(
                resultado.getLong("id"),
                resultado.getLong("viaje_id"),
                Objects.toString(resultado.getDate("fecha"), ""),
                hora == null ? "" : hora.toLocalTime().toString(),
                resultado.getBigDecimal("coste"),
                Objects.toString(resultado.getString("descripcion"), "")
        );
    }

    private TravelParticipantResponse mapParticipant(java.sql.ResultSet resultado, int fila) throws java.sql.SQLException {
        return new TravelParticipantResponse(
                resultado.getLong("id"),
                Objects.toString(resultado.getString("username"), ""),
                Objects.toString(resultado.getString("nombre"), ""),
                Objects.toString(resultado.getString("apellidos"), ""),
                Objects.toString(resultado.getString("email"), ""),
                Objects.toString(resultado.getString("rol_en_viaje"), "")
        );
    }
}
