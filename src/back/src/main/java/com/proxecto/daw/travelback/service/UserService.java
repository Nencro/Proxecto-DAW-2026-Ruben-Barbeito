package com.proxecto.daw.travelback.service;

import java.sql.PreparedStatement;
import java.sql.Statement;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.Objects;

import com.proxecto.daw.travelback.dto.AuthUserResponse;
import com.proxecto.daw.travelback.dto.LoginRequest;
import com.proxecto.daw.travelback.dto.LoginResponse;
import com.proxecto.daw.travelback.dto.ProfileResponse;
import com.proxecto.daw.travelback.dto.ProfileUpdateRequest;
import com.proxecto.daw.travelback.dto.RegisterRequest;
import com.proxecto.daw.travelback.dto.RegisterResponse;
import com.proxecto.daw.travelback.exception.LoginException;
import com.proxecto.daw.travelback.exception.RegisterConflictException;
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
    public ProfileResponse updateProfile(String authorization, ProfileUpdateRequest peticion) {
        String userName = jwtService.getUserNameFromAuthorization(authorization);
        String nombre = Objects.toString(peticion.nombre(), "").trim();
        String apellidos = Objects.toString(peticion.apellidos(), "").trim();
        String telefono = Objects.toString(peticion.telefono(), "").trim();
        Long idPais = peticion.paisId();

        validateCountryId(idPais);

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

    public ProfileResponse getProfileByUserName(String userName) {
        Map<String, Object> filaUsuario = jdbcTemplate.queryForMap(
                """
                SELECT id, username, nombre, apellidos, email, telefono, pais_id, fecha_registro
                FROM usuario
                WHERE username = ?
                """,
                userName
        );

        return new ProfileResponse(
                ((Number) filaUsuario.get("id")).longValue(),
                Objects.toString(filaUsuario.get("username"), ""),
                Objects.toString(filaUsuario.get("nombre"), ""),
                Objects.toString(filaUsuario.get("apellidos"), ""),
                Objects.toString(filaUsuario.get("email"), ""),
                Objects.toString(filaUsuario.get("telefono"), ""),
                filaUsuario.get("pais_id") == null ? null : ((Number) filaUsuario.get("pais_id")).longValue(),
                Objects.toString(filaUsuario.get("fecha_registro"), "")
        );
    }

    private void validateCountryId(Long paisId) {
        if (paisId == null) {
            return;
        }

        Integer contadorPaises = jdbcTemplate.queryForObject(
                "SELECT COUNT(*) FROM paises WHERE id = ?",
                Integer.class,
                paisId
        );

        if (contadorPaises == null || contadorPaises == 0) {
            throw new IllegalArgumentException("El pais indicado no existe.");
        }
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

}
