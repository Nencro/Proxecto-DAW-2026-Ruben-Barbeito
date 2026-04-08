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
    C3[Administrador]
end

%% ===== FRONTEND =====
subgraph Frontend["Frontend (Angular)"]
    F1[Aplicación Web Angular]
end

%% ===== BACKEND =====
subgraph Backend["Backend (Spring Boot)"]

    subgraph API["Capa API"]
        B1[API REST]
    end

    subgraph APP["Capa de Aplicación"]
        B2[Servicio de Usuarios]
        B3[Servicio de Destinos]
        B4[Servicio de Viajes]
    end

    subgraph DB["Capa de Base de Datos"]
        D1[(Usuarios)]
        D2[(Destinos)]
        D3[(Viajes)]
    end
end

%% ===== AWS =====
subgraph AWS["Servicios AWS"]
    S1[(Amazon RDS - MySQL)]
    S2[(Amazon S3 - Imágenes)]
    S3[(EC2 - Servidor)]
end

%% ===== FLUJO =====
C1 --> F1
C2 --> F1
C3 --> F1

F1 --> B1

B1 --> B2
B1 --> B3
B1 --> B4

B2 --> D1
B3 --> D2
B4 --> D3

D1 --> S1
D2 --> S1
D3 --> S1

B3 --> S2

B1 --> S3

%% ===== COLORES =====
style Clientes fill:#FFE4D6,stroke:#333,stroke-width:2px
style Frontend fill:#D6EAF8,stroke:#333,stroke-width:2px
style Backend fill:#E8F8F5,stroke:#333,stroke-width:2px
style API fill:#FCF3CF,stroke:#333
style APP fill:#D5F5E3,stroke:#333
style DB fill:#FADBD8,stroke:#333
style AWS fill:#FEF9E7,stroke:#333,stroke-width:2px
```

## 2- Casos de uso
```mermaid
flowchart TB

%% ===== SISTEMA (ARRIBA) =====
subgraph Sistema["Sistema ExploraMas"]
    U1((Buscar destinos))
    U2((Ver detalles))
    U3((Registrarse))
    U4((Iniciar sesión))
    U5((Perfil))
    U6((Viajes))
    U7((Admin usuarios))
    U8((Gestionar contenido))
end

%% ===== ACTORES (ABAJO) =====
A1[Usuario Anónimo]
A2[Usuario Registrado]
A3[Administrador]

%% ===== RELACIONES =====
A1 --> U1
A1 --> U2
A1 --> U3

A2 --> U1
A2 --> U2
A2 --> U5
A2 --> U6
A2 --> U4

A3 --> U7
A3 --> U8

%% ===== COLORES =====
style Sistema fill:#E8F8F5,stroke:#333,stroke-width:2px

style A1 fill:#FFCDD2,stroke:#333
style A2 fill:#BBDEFB,stroke:#333
style A3 fill:#C8E6C9,stroke:#333

%% ===== FLECHAS =====
linkStyle 0 stroke:#E53935,stroke-width:2px
linkStyle 1 stroke:#E53935,stroke-width:2px
linkStyle 2 stroke:#E53935,stroke-width:2px

linkStyle 3 stroke:#1E88E5,stroke-width:2px
linkStyle 4 stroke:#1E88E5,stroke-width:2px
linkStyle 5 stroke:#1E88E5,stroke-width:2px
linkStyle 6 stroke:#1E88E5,stroke-width:2px
linkStyle 7 stroke:#1E88E5,stroke-width:2px

linkStyle 8 stroke:#43A047,stroke-width:2px
linkStyle 9 stroke:#43A047,stroke-width:2px
```


## 3- Diagrama de Base de Datos
### 3-1 Modelo entidad/relacion
```mermaid
graph TD

%% ENTIDADES
U[USUARIO]
R[ROL]
V[VIAJE]
D[LOCALIZACION]
I[ITINERARIO]
E[EXPERIENCIA]

%% RELACIONES
Rel1{TIENE_ROL}
Rel2{CREA}
Rel3{PARTICIPA}
Rel4{TIENE}
Rel5{INCLUYE}
Rel6{TIENE}

%% RELACIONES CON CARDINALIDAD
U ---|N| Rel1
Rel1 ---|N| R

U ---|1| Rel2
Rel2 ---|N| V

U ---|N| Rel3
Rel3 ---|N| V

V ---|N| Rel4
Rel4 ---|1| D

V ---|1| Rel5
Rel5 ---|N| I

D ---|1| Rel6
Rel6 ---|N| E

%% COLORES ENTIDADES
style U fill:#D6EAF8,stroke:#333,stroke-width:2px
style R fill:#D6EAF8,stroke:#333,stroke-width:2px
style V fill:#D6EAF8,stroke:#333,stroke-width:2px
style D fill:#D6EAF8,stroke:#333,stroke-width:2px
style I fill:#D6EAF8,stroke:#333,stroke-width:2px
style E fill:#D6EAF8,stroke:#333,stroke-width:2px

%% COLORES RELACIONES
style Rel1 fill:#F9E79F,stroke:#333,stroke-width:2px
style Rel2 fill:#F9E79F,stroke:#333,stroke-width:2px
style Rel3 fill:#F9E79F,stroke:#333,stroke-width:2px
style Rel4 fill:#F9E79F,stroke:#333,stroke-width:2px
style Rel5 fill:#F9E79F,stroke:#333,stroke-width:2px
style Rel6 fill:#F9E79F,stroke:#333,stroke-width:2px
```
### 3-3 Modelo relacional
```mermaid
erDiagram
    ROL ||--o{ USUARIO_ROL : tiene
    USUARIO ||--o{ USUARIO_ROL : asignado
    USUARIO ||--o{ PARTICIPANTE_VIAJE : participa
    VIAJE ||--o{ PARTICIPANTE_VIAJE : incluye
    USUARIO ||--o{ VIAJE : crea
    DESTINO ||--o{ VIAJE : pertenece
    VIAJE ||--o{ ITINERARIO : contiene

    ROL {
        int id PK
        string nombre
    }

    USUARIO {
        int id PK
        string nombre
        string apellidos
        string email UK
        string contrasena
    }

    USUARIO_ROL {
        int usuario_id FK
        int rol_id FK
    }

    DESTINO {
        int id PK
        string nombre
        string descripcion
        string pais
    }

    VIAJE {
        int id PK
        date fecha_inicio
        date fecha_fin
        int destino_id FK
        int id_creador FK
    }

    PARTICIPANTE_VIAJE {
        int usuario_id FK
        int viaje_id FK
    }

    ITINERARIO {
        int id PK
        date fecha
        string descripcion
        int viaje_id FK
    }
```

## 4- Deseño de interface de usuarios

[Link a figma](https://www.figma.com/design/uKYEPh0pMD1AgcECwWXYnQ/Explora?m=auto&t=a0tfpmG0vNbS0ALR-1)
>
[**<-Anterior**](../README.md)
