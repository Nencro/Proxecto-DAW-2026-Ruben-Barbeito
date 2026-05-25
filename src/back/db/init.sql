CREATE DATABASE IF NOT EXISTS exploramas
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE exploramas;

CREATE TABLE IF NOT EXISTS rol (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(50) NOT NULL,
  CONSTRAINT uk_rol_nombre UNIQUE (nombre)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS pais (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL,
  codigo CHAR(2) NOT NULL,
  prefijo VARCHAR(8) NOT NULL,
  CONSTRAINT uk_pais_nombre UNIQUE (nombre),
  CONSTRAINT uk_pais_codigo UNIQUE (codigo),
  CONSTRAINT ck_pais_codigo CHECK (codigo REGEXP '^[A-Z]{2}$')
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
    FOREIGN KEY (pais_id) REFERENCES pais (id)
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
  pais_id BIGINT UNSIGNED NOT NULL,
  INDEX idx_destino_pais (pais_id),
  CONSTRAINT fk_destino_pais
    FOREIGN KEY (pais_id) REFERENCES pais (id)
    ON DELETE RESTRICT
    ON UPDATE CASCADE
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS viaje (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  fecha_inicio DATE NOT NULL,
  fecha_fin DATE NOT NULL,
  coste_billete DECIMAL(10, 2) NOT NULL DEFAULT 0,
  destino_id BIGINT UNSIGNED NOT NULL,
  id_creador BIGINT UNSIGNED NOT NULL,
  INDEX idx_viaje_destino (destino_id),
  INDEX idx_viaje_creador (id_creador),
  CONSTRAINT ck_viaje_fechas CHECK (fecha_fin >= fecha_inicio),
  CONSTRAINT ck_viaje_coste_billete CHECK (coste_billete >= 0),
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
  hora TIME NULL,
  coste DECIMAL(10, 2) NOT NULL DEFAULT 0,
  descripcion TEXT NOT NULL,
  viaje_id BIGINT UNSIGNED NOT NULL,
  INDEX idx_itinerario_viaje (viaje_id),
  CONSTRAINT ck_itinerario_coste CHECK (coste >= 0),
  CONSTRAINT fk_itinerario_viaje
    FOREIGN KEY (viaje_id) REFERENCES viaje (id)
    ON DELETE CASCADE
    ON UPDATE CASCADE
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS experiencia (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(150) NOT NULL,
  localidad VARCHAR(150) NOT NULL,
  descripcion TEXT NOT NULL,
  tamanio_minimo INT UNSIGNED NOT NULL,
  tamanio_maximo INT UNSIGNED NOT NULL,
  duracion_minutos INT UNSIGNED NOT NULL,
  precio DECIMAL(10, 2) NOT NULL,
  pais_id BIGINT UNSIGNED NOT NULL,
  id_creador BIGINT UNSIGNED NOT NULL,
  imagen LONGBLOB NULL,
  imagen_tipo VARCHAR(100) NULL,
  INDEX idx_experiencia_nombre (nombre),
  INDEX idx_experiencia_localidad (localidad),
  INDEX idx_experiencia_pais (pais_id),
  INDEX idx_experiencia_creador (id_creador),
  CONSTRAINT ck_experiencia_tamanio CHECK (tamanio_minimo > 0 AND tamanio_maximo >= tamanio_minimo),
  CONSTRAINT ck_experiencia_duracion CHECK (duracion_minutos > 0),
  CONSTRAINT ck_experiencia_precio CHECK (precio >= 0),
  CONSTRAINT fk_experiencia_pais
    FOREIGN KEY (pais_id) REFERENCES pais (id)
    ON DELETE RESTRICT
    ON UPDATE CASCADE,
  CONSTRAINT fk_experiencia_creador
    FOREIGN KEY (id_creador) REFERENCES usuario (id)
    ON DELETE RESTRICT
    ON UPDATE CASCADE
) ENGINE=InnoDB;

INSERT INTO rol (nombre)
VALUES ('USUARIO'), ('EMPRESA'), ('ADMIN')
ON DUPLICATE KEY UPDATE nombre = VALUES(nombre);

INSERT INTO usuario (username, nombre, apellidos, email, telefono, contrasena)
VALUES (
  'admin',
  'Administrador',
  'Base',
  'admin@exploramas.com',
  '',
  '$2a$10$38APotBeqvuhCuoPrYwLiu4P20AxLy5Y1a.Nxb16uPVwwahC0JDi2'
)
ON DUPLICATE KEY UPDATE
  nombre = VALUES(nombre),
  apellidos = VALUES(apellidos),
  telefono = VALUES(telefono),
  contrasena = CASE
    WHEN contrasena LIKE '$2a$%' OR contrasena LIKE '$2b$%' OR contrasena LIKE '$2y$%' THEN contrasena
    ELSE VALUES(contrasena)
  END;

INSERT IGNORE INTO usuario_rol (usuario_id, rol_id)
SELECT u.id, r.id
FROM usuario u
INNER JOIN rol r ON r.nombre = 'ADMIN'
WHERE u.username = 'admin';

INSERT INTO usuario (username, nombre, apellidos, email, telefono, contrasena)
VALUES (
  'empresa',
  'Empresa',
  'Base',
  'empresa@exploramas.com',
  '',
  '$2a$10$e430S.Wao6M.yVMD2GneAek3WbQxyBp78mgeBivN4FmK9BEAwZ8Ju'
)
ON DUPLICATE KEY UPDATE
  nombre = VALUES(nombre),
  apellidos = VALUES(apellidos),
  telefono = VALUES(telefono),
  contrasena = CASE
    WHEN contrasena LIKE '$2a$%' OR contrasena LIKE '$2b$%' OR contrasena LIKE '$2y$%' THEN contrasena
    ELSE VALUES(contrasena)
  END;

INSERT IGNORE INTO usuario_rol (usuario_id, rol_id)
SELECT u.id, r.id
FROM usuario u
INNER JOIN rol r ON r.nombre IN ('USUARIO', 'EMPRESA')
WHERE u.username = 'empresa';

INSERT INTO pais (nombre, codigo, prefijo)
VALUES
  ('Alemania', 'DE', '+49'),
  ('Austria', 'AT', '+43'),
  ('Belgica', 'BE', '+32'),
  ('Bulgaria', 'BG', '+359'),
  ('Croacia', 'HR', '+385'),
  ('Dinamarca', 'DK', '+45'),
  ('Eslovaquia', 'SK', '+421'),
  ('Eslovenia', 'SI', '+386'),
  ('Espana', 'ES', '+34'),
  ('Estonia', 'EE', '+372'),
  ('Finlandia', 'FI', '+358'),
  ('Francia', 'FR', '+33'),
  ('Grecia', 'GR', '+30'),
  ('Hungria', 'HU', '+36'),
  ('Irlanda', 'IE', '+353'),
  ('Italia', 'IT', '+39'),
  ('Letonia', 'LV', '+371'),
  ('Lituania', 'LT', '+370'),
  ('Luxemburgo', 'LU', '+352'),
  ('Noruega', 'NO', '+47'),
  ('Paises Bajos', 'NL', '+31'),
  ('Polonia', 'PL', '+48'),
  ('Portugal', 'PT', '+351'),
  ('Reino Unido', 'GB', '+44'),
  ('Republica Checa', 'CZ', '+420'),
  ('Rumania', 'RO', '+40'),
  ('Suecia', 'SE', '+46'),
  ('Suiza', 'CH', '+41'),
  ('Canada', 'CA', '+1'),
  ('Estados Unidos', 'US', '+1'),
  ('Mexico', 'MX', '+52'),
  ('China', 'CN', '+86'),
  ('Japon', 'JP', '+81'),
  ('Corea del Sur', 'KR', '+82'),
  ('India', 'IN', '+91'),
  ('Tailandia', 'TH', '+66'),
  ('Vietnam', 'VN', '+84'),
  ('Indonesia', 'ID', '+62'),
  ('Filipinas', 'PH', '+63'),
  ('Singapur', 'SG', '+65'),
  ('Malasia', 'MY', '+60'),
  ('Australia', 'AU', '+61'),
  ('Nueva Zelanda', 'NZ', '+64')
ON DUPLICATE KEY UPDATE
  codigo = VALUES(codigo),
  prefijo = VALUES(prefijo);
