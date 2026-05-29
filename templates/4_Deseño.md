# FASE DE DESEÑO

- [FASE DE DESEÑO](#fase-de-deseño)
  - [1- Diagrama da arquitectura](#1--diagrama-da-arquitectura)
  - [2- Casos de uso](#2--casos-de-uso)
  - [3- Diagrama de Base de Datos](#3--diagrama-de-base-de-datos)
    - [3-1 Modelo entidad/relacion](#3-1-modelo-entidadrelacion)
    - [3-3 Modelo relacional](#3-3-modelo-relacional)
  - [4- Deseño de interface de usuarios](#4--deseño-de-interface-de-usuarios)


## 1- Diagrama da arquitectura

```mermaid
flowchart LR

%% ===== CLIENTES =====
subgraph Clientes["Capa de Clientes"]
    C1[Usuario Anónimo]
    C2[Usuario Registrado]
    C3[Usuario Empresa]
    C4[Administrador]
end

%% ===== FRONTEND =====
subgraph Amplify["AWS Amplify"]
    F1[Frontend Angular]
    F2[Configuración runtime assets/env.js]
end

%% ===== EC2 =====
subgraph EC2["Amazon EC2 - Ubuntu Server"]

    subgraph Nginx["Nginx"]
        N1[Proxy inverso /api]
    end

    subgraph Backend["Backend Spring Boot"]
        B1[API REST]
        B2[Servicio de Usuarios]
        B3[Servicio de Viajes]
        B4[Servicio de Experiencias]
        B5[Servicio de Vuelos]
    end

    subgraph Datos["Base de datos en EC2"]
        D1[(MySQL 8 - exploramas)]
    end
end

%% ===== APIS EXTERNAS =====
subgraph Externas["APIs externas"]
    X1[Duffel API - Búsqueda de vuelos]
    X2[RestCountries API - Datos de países]
end

%% ===== FLUJOS =====
C1 --> F1
C2 --> F1
C3 --> F1
C4 --> F1

F1 --> F2
F1 -->|HTTP/HTTPS FRONT_API_BASE_URL| N1
N1 --> B1

B1 --> B2
B1 --> B3
B1 --> B4
B1 --> B5

B2 --> D1
B3 --> D1
B4 --> D1

B5 --> X1
F1 --> X2

%% ===== COLORES =====
style Clientes fill:#FFE4D6,stroke:#333,stroke-width:2px
style Amplify fill:#D6EAF8,stroke:#333,stroke-width:2px
style EC2 fill:#E8F8F5,stroke:#333,stroke-width:2px
style Nginx fill:#FCF3CF,stroke:#333
style Backend fill:#E8F8F5,stroke:#333,stroke-width:2px
style Datos fill:#FADBD8,stroke:#333
style Externas fill:#FEF9E7,stroke:#333,stroke-width:2px
```

## 2- Casos de uso
```mermaid
flowchart TB

%% ===== SISTEMA =====
subgraph Sistema["Sistema ExploraMas"]
    U1((Acceso y perfil))
    U2((Consulta publica))
    U3((Viajes))
    U4((Experiencias))
    U5((Administracion))
end

%% ===== ACTORES =====
A1[Usuario Anónimo]
A2[Usuario Registrado]
A3[Usuario Empresa]
A4[Administrador]

%% ===== RELACIONES =====
A1 --> U2

A2 --> U1
A2 --> U3
A2 --> U4

A3 --> U4

A4 --> U5

%% ===== COLORES =====
style Sistema fill:#E8F8F5,stroke:#333,stroke-width:2px

style A1 fill:#FFCDD2,stroke:#333
style A2 fill:#BBDEFB,stroke:#333
style A3 fill:#FFF9C4,stroke:#333
style A4 fill:#C8E6C9,stroke:#333
```

Nota: os usuarios con rol `EMPRESA` e `ADMIN` son sempre usuarios rexistrados, polo que tamen poden iniciar sesion, xestionar o seu perfil e acceder ás funcionalidades xerais dun usuario rexistrado. O usuario anonimo so pode consultar contido publico, como experiencias, e non ten acceso á xestion de perfil.


## 3- Diagrama de Base de Datos
### 3-1 Modelo entidad/relacion
```mermaid
erDiagram
    PAISES ||--o{ USUARIOS : "pais de residencia"
    PAISES ||--o{ DESTINOS : "contiene"
    PAISES ||--o{ EXPERIENCIAS : "ubica"

    USUARIOS_REGISTRADOS ||--o{ VIAJES : "crean planes personales"
    USUARIOS_REGISTRADOS ||--o{ PARTICIPACIONES : "participan"
    VIAJES ||--o{ PARTICIPACIONES : "incluyen usuarios"
    DESTINOS ||--o{ VIAJES : "son destino de"
    VIAJES ||--o{ ITINERARIOS : "contienen"

    ADMINISTRADORES ||--o{ USUARIOS : "gestionan"
    EMPRESAS ||--o{ EXPERIENCIAS : "crean"
    ADMINISTRADORES ||--o{ EXPERIENCIAS : "crean"

    USUARIOS ||--|| USUARIOS_REGISTRADOS : "especializacion"
    USUARIOS_REGISTRADOS ||--o| EMPRESAS : "puede ser"
    USUARIOS_REGISTRADOS ||--o| ADMINISTRADORES : "puede ser"

    USUARIOS {
        BIGINT id
        VARCHAR username
        VARCHAR nombre
        VARCHAR apellidos
        VARCHAR email
        VARCHAR telefono
        DATE fecha_registro
    }

    USUARIOS_REGISTRADOS {
        BIGINT usuario_id
        VARCHAR password_cifrada
    }

    EMPRESAS {
        BIGINT usuario_id
    }

    ADMINISTRADORES {
        BIGINT usuario_id
    }

    PAISES {
        BIGINT id
        VARCHAR nombre
        CHAR codigo
        VARCHAR prefijo
    }

    DESTINOS {
        BIGINT id
        VARCHAR nombre
        TEXT descripcion
    }

    VIAJES {
        BIGINT id
        DATE fecha_inicio
        DATE fecha_fin
        DECIMAL coste_billete
    }

    PARTICIPACIONES {
        BIGINT usuario_id
        BIGINT viaje_id
    }

    ITINERARIOS {
        BIGINT id
        DATE fecha
        TIME hora
        DECIMAL coste
        TEXT descripcion
    }

    EXPERIENCIAS {
        BIGINT id
        VARCHAR nombre
        VARCHAR localidad
        TEXT descripcion
        INT tamanio_minimo
        INT tamanio_maximo
        INT duracion_minutos
        DECIMAL precio
        BLOB imagen
    }
```

Nota: neste proxecto os `VIAJES` non son paquetes comerciais creados pola administracion, senon plans persoais que crea un usuario rexistrado para organizar datas, destino, billete, actividades e participantes. As `EXPERIENCIAS` son propostas independentes publicadas por usuarios empresa ou administradores; poden consultarse e engadirse como actividade a un plan de viaxe, pero non pertencen obrigatoriamente a un unico viaxe.

No modelo conceptual non se representa `ROL` como entidade principal, porque os tipos `EMPRESAS` e `ADMINISTRADORES` se entenden como especializacions de `USUARIOS_REGISTRADOS`. No modelo relacional si pode aparecer unha taboa de roles para implementar esta especializacion de forma flexible na base de datos.

### 3-3 Modelo relacional

![Modelo relacional da base de datos](../doc/img/bd.png)

## 4- Deseño de interface de usuarios

[Link a figma](https://www.figma.com/design/uKYEPh0pMD1AgcECwWXYnQ/Explora?m=auto&t=a0tfpmG0vNbS0ALR-1)
>
[**<-Anterior**](../README.md)
