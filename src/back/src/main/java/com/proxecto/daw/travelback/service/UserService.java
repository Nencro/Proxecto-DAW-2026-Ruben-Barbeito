package com.proxecto.daw.travelback.service;

import java.sql.PreparedStatement;
import java.sql.Statement;
import java.time.LocalDate;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Set;

import com.proxecto.daw.travelback.dto.AuthUserResponse;
import com.proxecto.daw.travelback.dto.LoginRequest;
import com.proxecto.daw.travelback.dto.LoginResponse;
import com.proxecto.daw.travelback.dto.PasswordRecoverRequest;
import com.proxecto.daw.travelback.dto.ProfileResponse;
import com.proxecto.daw.travelback.dto.ProfileUpdateRequest;
import com.proxecto.daw.travelback.dto.RegisterRequest;
import com.proxecto.daw.travelback.dto.RegisterResponse;
import com.proxecto.daw.travelback.dto.RolesUpdateRequest;
import com.proxecto.daw.travelback.exception.LoginException;
import com.proxecto.daw.travelback.exception.RegisterConflictException;
import com.proxecto.daw.travelback.exception.ResourceNotFoundException;
import org.springframework.dao.EmptyResultDataAccessException;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.support.GeneratedKeyHolder;
import org.springframework.jdbc.support.KeyHolder;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class UserService {

    private static final String NOMBRE_ROL_PREDETERMINADO = "USUARIO";
    private static final String NOMBRE_ROL_ADMIN = "ADMIN";

    private final JdbcTemplate jdbcTemplate;
    private final JwtService jwtService;
    private final PasswordEncoder codificadorPassword = new BCryptPasswordEncoder();

    public UserService(JdbcTemplate jdbcTemplate, JwtService jwtService) {
        this.jdbcTemplate = jdbcTemplate;
        this.jwtService = jwtService;
    }

    @Transactional
    public RegisterResponse register(RegisterRequest peticion) {
        String usuario = peticion.userName().trim();
        String email = peticion.email().trim().toLowerCase();
        String nombre = "";
        String apellidos = "";
        String hashPassword = codificadorPassword.encode(peticion.password());

        validateRegisterData(usuario, email);

        KeyHolder contenedorClave = new GeneratedKeyHolder();

        jdbcTemplate.update(conexion -> {
            PreparedStatement sentencia = conexion.prepareStatement(
                    """
                    INSERT INTO usuario (username, nombre, apellidos, email, contrasena)
                    VALUES (?, ?, ?, ?, ?)
                    """,
                    Statement.RETURN_GENERATED_KEYS
            );
            sentencia.setString(1, usuario);
            sentencia.setString(2, nombre);
            sentencia.setString(3, apellidos);
            sentencia.setString(4, email);
            sentencia.setString(5, hashPassword);
            return sentencia;
        }, contenedorClave);

        Long idUsuario = Objects.requireNonNull(contenedorClave.getKey(), "No se pudo obtener el id del usuario creado.").longValue();
        Long idRol = getDefaultRoleId();

        jdbcTemplate.update(
                "INSERT INTO usuario_rol (usuario_id, rol_id) VALUES (?, ?)",
                idUsuario,
                idRol
        );

        return new RegisterResponse(
                jwtService.generateToken(idUsuario, usuario),
                idUsuario,
                usuario,
                nombre,
                apellidos,
                email,
                LocalDate.now().toString(),
                List.of(NOMBRE_ROL_PREDETERMINADO)
        );
    }

    public LoginResponse login(LoginRequest peticion) {
        String email = peticion.email().trim().toLowerCase();

        List<Map<String, Object>> usuarios = jdbcTemplate.queryForList(
                """
                SELECT id, username, nombre, apellidos, email, fecha_registro, contrasena
                FROM usuario
                WHERE email = ?
                """,
                email
        );

        if (usuarios.isEmpty()) {
            throw new LoginException(4, "Email o contrasena incorrectos.");
        }

        Map<String, Object> filaUsuario = usuarios.get(0);
        String hashPassword = Objects.toString(filaUsuario.get("contrasena"), "");

        if (!codificadorPassword.matches(peticion.password(), hashPassword)) {
            throw new LoginException(4, "Email o contrasena incorrectos.");
        }

        Long idUsuario = ((Number) filaUsuario.get("id")).longValue();
        AuthUserResponse usuario = new AuthUserResponse(
                idUsuario,
                Objects.toString(filaUsuario.get("username"), ""),
                Objects.toString(filaUsuario.get("nombre"), ""),
                Objects.toString(filaUsuario.get("apellidos"), ""),
                Objects.toString(filaUsuario.get("email"), ""),
                Objects.toString(filaUsuario.get("fecha_registro"), ""),
                getUserRoles(idUsuario)
        );

        return new LoginResponse(jwtService.generateToken(idUsuario, usuario.userName()), usuario);
    }

    @Transactional
    public void recoverPassword(PasswordRecoverRequest peticion) {
        String userName = Objects.toString(peticion.userName(), "").trim();
        String email = Objects.toString(peticion.email(), "").trim().toLowerCase();
        String hashPassword = codificadorPassword.encode(peticion.newPassword());

        int filasActualizadas = jdbcTemplate.update(
                """
                UPDATE usuario
                SET contrasena = ?
                WHERE username = ?
                  AND email = ?
                """,
                hashPassword,
                userName,
                email
        );

        if (filasActualizadas == 0) {
            throw new LoginException(4, "No se encontro un usuario con esos datos.");
        }
    }

    @Transactional
    public ProfileResponse updateProfile(String authorization, ProfileUpdateRequest peticion) {
        String userName = jwtService.getUserNameFromAuthorization(authorization);
        String nombre = Objects.toString(peticion.nombre(), "").trim();
        String apellidos = Objects.toString(peticion.apellidos(), "").trim();
        String telefono = Objects.toString(peticion.telefono(), "").trim();
        Long idPais = getOrCreateCountry(peticion.pais(), peticion.codigoPais(), peticion.prefijoPais());

        int filasActualizadas = jdbcTemplate.update(
                """
                UPDATE usuario
                SET nombre = ?, apellidos = ?, telefono = ?, pais_id = ?
                WHERE username = ?
                """,
                nombre,
                apellidos,
                telefono,
                idPais,
                userName
        );

        if (filasActualizadas == 0) {
            throw new LoginException(4, "No se encontro el usuario.");
        }

        return getProfileByUserName(userName);
    }

    public ProfileResponse getProfileByAuthorization(String authorization) {
        return getProfileByUserName(jwtService.getUserNameFromAuthorization(authorization));
    }

    public ProfileResponse getProfileByUserNameForAdmin(String authorization, String userName) {
        assertAdmin(authorization);

        return getProfileByUserName(userName);
    }

    public List<String> getRolesForAdmin(String authorization) {
        assertAdmin(authorization);
        return getAllRoles();
    }

    public List<ProfileResponse> searchProfilesForAdmin(String authorization, String query) {
        assertAdmin(authorization);

        String busqueda = "%" + Objects.toString(query, "").trim().toLowerCase() + "%";

        return jdbcTemplate.query(
                """
                SELECT
                    u.id,
                    u.username,
                    u.nombre,
                    u.apellidos,
                    u.email,
                    u.telefono,
                    u.pais_id,
                    p.nombre AS pais,
                    p.codigo AS codigo_pais,
                    p.prefijo AS prefijo_pais,
                    u.fecha_registro
                FROM usuario u
                LEFT JOIN pais p ON p.id = u.pais_id
                WHERE LOWER(u.username) LIKE ?
                ORDER BY u.username
                LIMIT 50
                """,
                (resultado, indice) -> {
                    Long idUsuario = resultado.getLong("id");

                    return new ProfileResponse(
                            idUsuario,
                            Objects.toString(resultado.getString("username"), ""),
                            Objects.toString(resultado.getString("nombre"), ""),
                            Objects.toString(resultado.getString("apellidos"), ""),
                            Objects.toString(resultado.getString("email"), ""),
                            Objects.toString(resultado.getString("telefono"), ""),
                            resultado.getObject("pais_id") == null ? null : resultado.getLong("pais_id"),
                            Objects.toString(resultado.getString("pais"), ""),
                            Objects.toString(resultado.getString("codigo_pais"), ""),
                            Objects.toString(resultado.getString("prefijo_pais"), ""),
                            Objects.toString(resultado.getString("fecha_registro"), ""),
                            getUserRoles(idUsuario)
                    );
                },
                busqueda
        );
    }

    @Transactional
    public ProfileResponse updateUserRolesForAdmin(String authorization, String userName, RolesUpdateRequest peticion) {
        assertAdmin(authorization);
        Long userId = getUserIdByUserNameOrThrow(userName);

        Set<String> rolesSolicitados = new LinkedHashSet<>();
        rolesSolicitados.add(NOMBRE_ROL_PREDETERMINADO);

        for (String rol : peticion.roles()) {
            String rolNormalizado = Objects.toString(rol, "").trim().toUpperCase();

            if (!rolNormalizado.isBlank()) {
                rolesSolicitados.add(rolNormalizado);
            }
        }

        List<String> rolesExistentes = getAllRoles();
        List<String> rolesInvalidos = rolesSolicitados.stream()
                .filter(rol -> !rolesExistentes.contains(rol))
                .toList();

        if (!rolesInvalidos.isEmpty()) {
            throw new IllegalArgumentException("Hay roles no validos: " + String.join(", ", rolesInvalidos));
        }

        jdbcTemplate.update("DELETE FROM usuario_rol WHERE usuario_id = ?", userId);

        for (String rol : rolesSolicitados) {
            jdbcTemplate.update(
                    """
                    INSERT INTO usuario_rol (usuario_id, rol_id)
                    SELECT ?, id
                    FROM rol
                    WHERE nombre = ?
                    """,
                    userId,
                    rol
            );
        }

        return getProfileByUserName(userName);
    }

    public ProfileResponse getProfileByUserName(String userName) {
        Map<String, Object> filaUsuario;

        try {
            filaUsuario = jdbcTemplate.queryForMap(
                    """
                    SELECT
                        u.id,
                        u.username,
                        u.nombre,
                        u.apellidos,
                        u.email,
                        u.telefono,
                        u.pais_id,
                        p.nombre AS pais,
                        p.codigo AS codigo_pais,
                        p.prefijo AS prefijo_pais,
                        u.fecha_registro
                    FROM usuario u
                    LEFT JOIN pais p ON p.id = u.pais_id
                    WHERE u.username = ?
                    """,
                    userName
            );
        } catch (EmptyResultDataAccessException excepcion) {
            throw new ResourceNotFoundException("Usuario no encontrado.");
        }

        return new ProfileResponse(
                ((Number) filaUsuario.get("id")).longValue(),
                Objects.toString(filaUsuario.get("username"), ""),
                Objects.toString(filaUsuario.get("nombre"), ""),
                Objects.toString(filaUsuario.get("apellidos"), ""),
                Objects.toString(filaUsuario.get("email"), ""),
                Objects.toString(filaUsuario.get("telefono"), ""),
                filaUsuario.get("pais_id") == null ? null : ((Number) filaUsuario.get("pais_id")).longValue(),
                Objects.toString(filaUsuario.get("pais"), ""),
                Objects.toString(filaUsuario.get("codigo_pais"), ""),
                Objects.toString(filaUsuario.get("prefijo_pais"), ""),
                Objects.toString(filaUsuario.get("fecha_registro"), ""),
                getUserRoles(((Number) filaUsuario.get("id")).longValue())
        );
    }

    private Long getOrCreateCountry(String pais, String codigoPais, String prefijoPais) {
        String countryName = Objects.toString(pais, "").trim();
        String countryCode = Objects.toString(codigoPais, "").trim().toUpperCase();
        String phonePrefix = Objects.toString(prefijoPais, "").trim();

        if (countryName.isBlank() || countryCode.isBlank()) {
            return null;
        }

        List<Long> idsByCode = jdbcTemplate.queryForList(
                "SELECT id FROM pais WHERE codigo = ?",
                Long.class,
                countryCode
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
            statement.setString(2, countryCode);
            statement.setString(3, phonePrefix);
            return statement;
        }, keyHolder);

        return Objects.requireNonNull(keyHolder.getKey(), "No se pudo obtener el id del pais creado.").longValue();
    }

    private Long getDefaultRoleId() {
        try {
            return jdbcTemplate.queryForObject(
                    "SELECT id FROM rol WHERE nombre = ?",
                    Long.class,
                    NOMBRE_ROL_PREDETERMINADO
            );
        } catch (EmptyResultDataAccessException excepcion) {
            throw new IllegalStateException("No existe el rol USUARIO. Ejecuta src/back/db/init.sql antes de registrar usuarios.", excepcion);
        }
    }

    private void validateRegisterData(String usuario, String email) {
        Integer contadorUsuarios = jdbcTemplate.queryForObject(
                "SELECT COUNT(*) FROM usuario WHERE username = ?",
                Integer.class,
                usuario
        );

        if (contadorUsuarios != null && contadorUsuarios > 0) {
            throw new RegisterConflictException(2, "El usuario ya existe.");
        }

        Integer contadorEmails = jdbcTemplate.queryForObject(
                "SELECT COUNT(*) FROM usuario WHERE email = ?",
                Integer.class,
                email
        );

        if (contadorEmails != null && contadorEmails > 0) {
            throw new RegisterConflictException(3, "El email ya esta registrado.");
        }
    }

    private List<String> getUserRoles(Long idUsuario) {
        return jdbcTemplate.queryForList(
                """
                SELECT r.nombre
                FROM rol r
                INNER JOIN usuario_rol ur ON ur.rol_id = r.id
                WHERE ur.usuario_id = ?
                ORDER BY r.nombre
                """,
                String.class,
                idUsuario
        );
    }

    private List<String> getAllRoles() {
        return jdbcTemplate.queryForList(
                "SELECT nombre FROM rol ORDER BY FIELD(nombre, 'USUARIO', 'EMPRESA', 'ADMIN'), nombre",
                String.class
        );
    }

    private Long getUserIdByUserNameOrThrow(String userName) {
        try {
            return jdbcTemplate.queryForObject(
                    "SELECT id FROM usuario WHERE username = ?",
                    Long.class,
                    userName
            );
        } catch (EmptyResultDataAccessException excepcion) {
            throw new ResourceNotFoundException("Usuario no encontrado.");
        }
    }

    private void assertAdmin(String authorization) {
        String userName = jwtService.getUserNameFromAuthorization(authorization);
        Integer count = jdbcTemplate.queryForObject(
                """
                SELECT COUNT(*)
                FROM usuario u
                INNER JOIN usuario_rol ur ON ur.usuario_id = u.id
                INNER JOIN rol r ON r.id = ur.rol_id
                WHERE u.username = ?
                  AND r.nombre = ?
                """,
                Integer.class,
                userName,
                NOMBRE_ROL_ADMIN
        );

        if (count == null || count == 0) {
            throw new LoginException(4, "Solo un administrador puede acceder a este recurso.");
        }
    }

}
