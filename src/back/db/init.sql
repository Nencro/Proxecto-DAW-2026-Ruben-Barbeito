CREATE DATABASE IF NOT EXISTS exploramas
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE exploramas;

CREATE TABLE IF NOT EXISTS rol (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(50) NOT NULL,
  CONSTRAINT uk_rol_nombre UNIQUE (nombre)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS paises (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL,
  prefijo VARCHAR(8) NOT NULL,
  CONSTRAINT uk_paises_nombre UNIQUE (nombre)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS usuario (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(50) NOT NULL,
  nombre VARCHAR(100) NOT NULL,
  apellidos VARCHAR(150) NOT NULL,
  email VARCHAR(190) NOT NULL,
  telefono VARCHAR(30) NOT NULL DEFAULT '',
  pais_id BIGINT UNSIGNED NULL,
  fecha_registro DATE NOT NULL DEFAULT (CURRENT_DATE),
  contrasena VARCHAR(255) NOT NULL,
  CONSTRAINT uk_usuario_username UNIQUE (username),
  CONSTRAINT uk_usuario_email UNIQUE (email),
  INDEX idx_usuario_pais (pais_id),
  CONSTRAINT fk_usuario_pais
    FOREIGN KEY (pais_id) REFERENCES paises (id)
    ON DELETE SET NULL
    ON UPDATE CASCADE
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS usuario_rol (
  usuario_id BIGINT UNSIGNED NOT NULL,
  rol_id BIGINT UNSIGNED NOT NULL,
  PRIMARY KEY (usuario_id, rol_id),
  CONSTRAINT fk_usuario_rol_usuario
    FOREIGN KEY (usuario_id) REFERENCES usuario (id)
    ON DELETE CASCADE
    ON UPDATE CASCADE,
  CONSTRAINT fk_usuario_rol_rol
    FOREIGN KEY (rol_id) REFERENCES rol (id)
    ON DELETE RESTRICT
    ON UPDATE CASCADE
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS destino (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(150) NOT NULL,
  descripcion TEXT NOT NULL,
  pais VARCHAR(100) NOT NULL,
  INDEX idx_destino_pais (pais)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS viaje (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  fecha_inicio DATE NOT NULL,
  fecha_fin DATE NOT NULL,
  destino_id BIGINT UNSIGNED NOT NULL,
  id_creador BIGINT UNSIGNED NOT NULL,
  INDEX idx_viaje_destino (destino_id),
  INDEX idx_viaje_creador (id_creador),
  CONSTRAINT ck_viaje_fechas CHECK (fecha_fin >= fecha_inicio),
  CONSTRAINT fk_viaje_destino
    FOREIGN KEY (destino_id) REFERENCES destino (id)
    ON DELETE RESTRICT
    ON UPDATE CASCADE,
  CONSTRAINT fk_viaje_creador
    FOREIGN KEY (id_creador) REFERENCES usuario (id)
    ON DELETE RESTRICT
    ON UPDATE CASCADE
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS participante_viaje (
  usuario_id BIGINT UNSIGNED NOT NULL,
  viaje_id BIGINT UNSIGNED NOT NULL,
  PRIMARY KEY (usuario_id, viaje_id),
  CONSTRAINT fk_participante_viaje_usuario
    FOREIGN KEY (usuario_id) REFERENCES usuario (id)
    ON DELETE CASCADE
    ON UPDATE CASCADE,
  CONSTRAINT fk_participante_viaje_viaje
    FOREIGN KEY (viaje_id) REFERENCES viaje (id)
    ON DELETE CASCADE
    ON UPDATE CASCADE
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS itinerario (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  fecha DATE NOT NULL,
  descripcion TEXT NOT NULL,
  viaje_id BIGINT UNSIGNED NOT NULL,
  INDEX idx_itinerario_viaje (viaje_id),
  CONSTRAINT fk_itinerario_viaje
    FOREIGN KEY (viaje_id) REFERENCES viaje (id)
    ON DELETE CASCADE
    ON UPDATE CASCADE
) ENGINE=InnoDB;

INSERT INTO rol (nombre)
VALUES ('USUARIO'), ('ADMIN')
ON DUPLICATE KEY UPDATE nombre = VALUES(nombre);

INSERT INTO paises (nombre, prefijo)
VALUES
  ('Alemania', '+49'),
  ('Austria', '+43'),
  ('Belgica', '+32'),
  ('Bulgaria', '+359'),
  ('Croacia', '+385'),
  ('Dinamarca', '+45'),
  ('Eslovaquia', '+421'),
  ('Eslovenia', '+386'),
  ('Espana', '+34'),
  ('Estonia', '+372'),
  ('Finlandia', '+358'),
  ('Francia', '+33'),
  ('Grecia', '+30'),
  ('Hungria', '+36'),
  ('Irlanda', '+353'),
  ('Italia', '+39'),
  ('Letonia', '+371'),
  ('Lituania', '+370'),
  ('Luxemburgo', '+352'),
  ('Noruega', '+47'),
  ('Paises Bajos', '+31'),
  ('Polonia', '+48'),
  ('Portugal', '+351'),
  ('Reino Unido', '+44'),
  ('Republica Checa', '+420'),
  ('Rumania', '+40'),
  ('Suecia', '+46'),
  ('Suiza', '+41'),
  ('Canada', '+1'),
  ('Estados Unidos', '+1'),
  ('Mexico', '+52'),
  ('China', '+86'),
  ('Japon', '+81'),
  ('Corea del Sur', '+82'),
  ('India', '+91'),
  ('Tailandia', '+66'),
  ('Vietnam', '+84'),
  ('Indonesia', '+62'),
  ('Filipinas', '+63'),
  ('Singapur', '+65'),
  ('Malasia', '+60'),
  ('Australia', '+61'),
  ('Nueva Zelanda', '+64')
ON DUPLICATE KEY UPDATE prefijo = VALUES(prefijo);
