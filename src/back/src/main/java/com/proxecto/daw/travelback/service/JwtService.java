package com.proxecto.daw.travelback.service;

import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.util.Date;

import com.proxecto.daw.travelback.exception.LoginException;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import javax.crypto.SecretKey;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

@Service
public class JwtService {

    private final SecretKey claveFirma;
    private final long minutosExpiracion;

    public JwtService(
            @Value("${jwt.secret}") String secreto,
            @Value("${jwt.expiration-minutes}") long minutosExpiracion
    ) {
        this.claveFirma = Keys.hmacShaKeyFor(secreto.getBytes(StandardCharsets.UTF_8));
        this.minutosExpiracion = minutosExpiracion;
    }

    public String generateToken(Long idUsuario, String userName) {
        Instant ahora = Instant.now();

        return Jwts.builder()
                .subject(userName)
                .claim("id", idUsuario)
                .issuedAt(Date.from(ahora))
                .expiration(Date.from(ahora.plusSeconds(minutosExpiracion * 60)))
                .signWith(claveFirma)
                .compact();
    }

    public String getUserNameFromAuthorization(String authorization) {
        return getClaims(extractBearerToken(authorization)).getSubject();
    }

    private Claims getClaims(String token) {
        try {
            return Jwts.parser()
                    .verifyWith(claveFirma)
                    .build()
                    .parseSignedClaims(token)
                    .getPayload();
        } catch (JwtException | IllegalArgumentException excepcion) {
            throw new LoginException(4, "Token invalido.");
        }
    }

    private String extractBearerToken(String authorization) {
        if (authorization == null || !authorization.startsWith("Bearer ")) {
            throw new LoginException(4, "Token invalido.");
        }

        String token = authorization.substring("Bearer ".length()).trim();

        if (token.isBlank()) {
            throw new LoginException(4, "Token invalido.");
        }

        return token;
    }
}
