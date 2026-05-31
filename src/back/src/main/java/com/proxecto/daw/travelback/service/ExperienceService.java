package com.proxecto.daw.travelback.service;

import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Statement;
import java.util.Base64;
import java.util.List;
import java.util.Objects;

import com.proxecto.daw.travelback.dto.ExperienceCreateRequest;
import com.proxecto.daw.travelback.dto.ExperienceResponse;
import com.proxecto.daw.travelback.exception.LoginException;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.support.GeneratedKeyHolder;
import org.springframework.jdbc.support.KeyHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class ExperienceService {

    private static final int MAX_IMAGE_BYTES = 1_000_000;

    private final JdbcTemplate jdbcTemplate;
    private final JwtService jwtService;

    public ExperienceService(JdbcTemplate jdbcTemplate, JwtService jwtService) {
        this.jdbcTemplate = jdbcTemplate;
        this.jwtService = jwtService;
    }

    public List<ExperienceResponse> getExperiences(String authorization, String nombre, String localidad, String pais, boolean mine) {
        String nombreFilter = toLikeFilter(nombre);
        String localidadFilter = toLikeFilter(localidad);
        String paisFilter = toLikeFilter(pais);
        Long creatorId = mine ? getAuthorizedUserId(authorization) : null;

        return jdbcTemplate.query(
                """
                SELECT
                    e.id,
                    e.nombre,
                    e.localidad,
                    e.descripcion,
                    e.tamanio_minimo,
                    e.tamanio_maximo,
                    e.duracion_minutos,
                    e.precio,
                    e.imagen,
                    e.imagen_tipo,
                    p.nombre AS pais,
                    p.codigo AS codigo_pais,
                    creador.id AS creador_id,
                    creador.username AS creador_username
                FROM experiencia e
                INNER JOIN pais p ON p.id = e.pais_id
                INNER JOIN usuario creador ON creador.id = e.id_creador
                WHERE (? IS NULL OR LOWER(e.nombre) LIKE ?)
                  AND (? IS NULL OR LOWER(e.localidad) LIKE ?)
                  AND (? IS NULL OR LOWER(p.nombre) LIKE ? OR LOWER(p.codigo) LIKE ?)
                  AND (? IS NULL OR e.id_creador = ?)
                ORDER BY e.nombre ASC, e.id ASC
                """,
                this::mapExperience,
                nombreFilter,
                nombreFilter,
                localidadFilter,
                localidadFilter,
                paisFilter,
                paisFilter,
                paisFilter,
                creatorId,
                creatorId
        );
    }

    @Transactional
    public ExperienceResponse createExperience(String authorization, ExperienceCreateRequest request) {
        String userName = jwtService.getUserNameFromAuthorization(authorization);
        Long creatorId = getUserId(userName);

        if (!hasAnyRole(creatorId, List.of("EMPRESA"))) {
            throw new LoginException(4, "Solo usuarios empresa pueden crear experiencias.");
        }

        if (request.tamanioMaximo() < request.tamanioMinimo()) {
            throw new IllegalArgumentException("El tamano maximo no puede ser menor que el tamano minimo.");
        }

        Long countryId = getOrCreateCountry(request.pais(), request.codigoPais());
        ImageData imageData = parseImage(request.imagen(), request.imagenTipo());
        KeyHolder keyHolder = new GeneratedKeyHolder();

        jdbcTemplate.update(connection -> {
            PreparedStatement statement = connection.prepareStatement(
                    """
                    INSERT INTO experiencia (
                      nombre, localidad, descripcion, tamanio_minimo, tamanio_maximo, precio,
                      duracion_minutos, pais_id, id_creador, imagen, imagen_tipo
                    )
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                    """,
                    Statement.RETURN_GENERATED_KEYS
            );
            statement.setString(1, request.nombre().trim());
            statement.setString(2, request.localidad().trim());
            statement.setString(3, request.descripcion().trim());
            statement.setInt(4, request.tamanioMinimo());
            statement.setInt(5, request.tamanioMaximo());
            statement.setBigDecimal(6, request.precio());
            statement.setInt(7, request.duracionMinutos());
            statement.setLong(8, countryId);
            statement.setLong(9, creatorId);
            statement.setBytes(10, imageData.bytes());
            statement.setString(11, imageData.type());
            return statement;
        }, keyHolder);

        Long experienceId = Objects.requireNonNull(keyHolder.getKey(), "No se pudo obtener el id de la experiencia creada.").longValue();
        return getExperienceById(experienceId);
    }

    public ExperienceResponse getExperience(Long id) {
        return getExperienceById(id);
    }

    @Transactional
    public ExperienceResponse updateExperience(String authorization, Long id, ExperienceCreateRequest request) {
        Long userId = getAuthorizedUserId(authorization);
        ExperienceResponse experience = getExperienceById(id);

        if (!canManageExperience(userId, experience)) {
            throw new LoginException(4, "Solo el creador o un administrador pueden editar la experiencia.");
        }

        if (request.tamanioMaximo() < request.tamanioMinimo()) {
            throw new IllegalArgumentException("El tamano maximo no puede ser menor que el tamano minimo.");
        }

        Long countryId = getOrCreateCountry(request.pais(), request.codigoPais());
        ImageData imageData = parseImage(request.imagen(), request.imagenTipo());

        jdbcTemplate.update(
                """
                UPDATE experiencia
                SET nombre = ?,
                    localidad = ?,
                    descripcion = ?,
                    tamanio_minimo = ?,
                    tamanio_maximo = ?,
                    duracion_minutos = ?,
                    precio = ?,
                    pais_id = ?,
                    imagen = ?,
                    imagen_tipo = ?
                WHERE id = ?
                """,
                request.nombre().trim(),
                request.localidad().trim(),
                request.descripcion().trim(),
                request.tamanioMinimo(),
                request.tamanioMaximo(),
                request.duracionMinutos(),
                request.precio(),
                countryId,
                imageData.bytes(),
                imageData.type(),
                id
        );

        return getExperienceById(id);
    }

    @Transactional
    public void deleteExperience(String authorization, Long id) {
        Long userId = getAuthorizedUserId(authorization);
        ExperienceResponse experience = getExperienceById(id);

        if (!canManageExperience(userId, experience)) {
            throw new LoginException(4, "Solo el creador o un administrador pueden borrar la experiencia.");
        }

        jdbcTemplate.update("DELETE FROM experiencia WHERE id = ?", id);
    }

    private String toLikeFilter(String value) {
        String trimmed = Objects.toString(value, "").trim().toLowerCase();
        return trimmed.isBlank() ? null : "%" + trimmed + "%";
    }

    private ExperienceResponse mapExperience(ResultSet result, int row) throws SQLException {
        byte[] imageBytes = result.getBytes("imagen");
        String imageType = Objects.toString(result.getString("imagen_tipo"), "image/png");
        String image = imageBytes == null || imageBytes.length == 0
                ? ""
                : "data:" + imageType + ";base64," + Base64.getEncoder().encodeToString(imageBytes);

        return new ExperienceResponse(
                result.getLong("id"),
                Objects.toString(result.getString("nombre"), ""),
                Objects.toString(result.getString("localidad"), ""),
                Objects.toString(result.getString("descripcion"), ""),
                result.getInt("tamanio_minimo"),
                result.getInt("tamanio_maximo"),
                result.getInt("duracion_minutos"),
                result.getBigDecimal("precio"),
                Objects.toString(result.getString("pais"), ""),
                Objects.toString(result.getString("codigo_pais"), ""),
                result.getLong("creador_id"),
                Objects.toString(result.getString("creador_username"), ""),
                image
        );
    }

    private ExperienceResponse getExperienceById(Long id) {
        return jdbcTemplate.queryForObject(
                """
                SELECT
                    e.id,
                    e.nombre,
                    e.localidad,
                    e.descripcion,
                    e.tamanio_minimo,
                    e.tamanio_maximo,
                    e.duracion_minutos,
                    e.precio,
                    e.imagen,
                    e.imagen_tipo,
                    p.nombre AS pais,
                    p.codigo AS codigo_pais,
                    creador.id AS creador_id,
                    creador.username AS creador_username
                FROM experiencia e
                INNER JOIN pais p ON p.id = e.pais_id
                INNER JOIN usuario creador ON creador.id = e.id_creador
                WHERE e.id = ?
                """,
                this::mapExperience,
                id
        );
    }

    private Long getAuthorizedUserId(String authorization) {
        return getUserId(jwtService.getUserNameFromAuthorization(authorization));
    }

    private Long getUserId(String userName) {
        return jdbcTemplate.queryForObject(
                "SELECT id FROM usuario WHERE username = ?",
                Long.class,
                userName
        );
    }

    private boolean hasAnyRole(Long userId, List<String> roles) {
        Integer count = jdbcTemplate.queryForObject(
                """
                SELECT COUNT(*)
                FROM usuario_rol ur
                INNER JOIN rol r ON r.id = ur.rol_id
                WHERE ur.usuario_id = ?
                  AND r.nombre IN (%s)
                """.formatted(String.join(",", roles.stream().map(role -> "?").toList())),
                Integer.class,
                buildRoleParams(userId, roles)
        );

        return count != null && count > 0;
    }

    private boolean canManageExperience(Long userId, ExperienceResponse experience) {
        return Objects.equals(userId, experience.creadorId()) || hasAnyRole(userId, List.of("ADMIN"));
    }

    private Object[] buildRoleParams(Long userId, List<String> roles) {
        Object[] params = new Object[roles.size() + 1];
        params[0] = userId;

        for (int i = 0; i < roles.size(); i++) {
            params[i + 1] = roles.get(i);
        }

        return params;
    }

    private Long getOrCreateCountry(String pais, String codigoPais) {
        String countryName = Objects.toString(pais, "").trim();
        String countryCode = Objects.toString(codigoPais, "").trim().toUpperCase();

        List<Long> idsByCode = jdbcTemplate.queryForList(
                "SELECT id FROM pais WHERE codigo = ?",
                Long.class,
                countryCode
        );

        if (!idsByCode.isEmpty()) {
            return idsByCode.get(0);
        }

        KeyHolder keyHolder = new GeneratedKeyHolder();
        jdbcTemplate.update(connection -> {
            PreparedStatement statement = connection.prepareStatement(
                    """
                    INSERT INTO pais (nombre, codigo, prefijo)
                    VALUES (?, ?, '')
                    """,
                    Statement.RETURN_GENERATED_KEYS
            );
            statement.setString(1, countryName);
            statement.setString(2, countryCode);
            return statement;
        }, keyHolder);

        return Objects.requireNonNull(keyHolder.getKey(), "No se pudo obtener el id del pais creado.").longValue();
    }

    private ImageData parseImage(String value, String fallbackType) {
        String imageValue = Objects.toString(value, "").trim();

        if (imageValue.isBlank()) {
            return new ImageData(null, null);
        }

        String imageType = Objects.toString(fallbackType, "image/png").trim();
        String base64 = imageValue;

        if (imageValue.startsWith("data:")) {
            int separator = imageValue.indexOf(',');

            if (separator < 0) {
                throw new IllegalArgumentException("La imagen no tiene un formato valido.");
            }

            String metadata = imageValue.substring(5, separator);
            int typeEnd = metadata.indexOf(';');
            imageType = typeEnd >= 0 ? metadata.substring(0, typeEnd) : metadata;
            base64 = imageValue.substring(separator + 1);
        }

        try {
            byte[] bytes = Base64.getDecoder().decode(base64);

            if (bytes.length > MAX_IMAGE_BYTES) {
                throw new IllegalArgumentException("La imagen es demasiado grande.");
            }

            return new ImageData(bytes, imageType);
        } catch (IllegalArgumentException exception) {
            throw new IllegalArgumentException(exception.getMessage());
        }
    }

    private record ImageData(byte[] bytes, String type) {
    }
}
