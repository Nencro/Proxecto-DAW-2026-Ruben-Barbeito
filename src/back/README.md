# Travel Back

Proyecto base de Spring Boot para el backend.

## Requisitos

- Java 21
- Maven 3.9 o superior

## Ejecutar

```powershell
mvn spring-boot:run
```

La API queda disponible por defecto en:

```text
http://localhost:8080
```

Endpoint de prueba:

```text
GET http://localhost:8080/api/health
```

## Duffel

El backend consulta Duffel desde `/api/duffel/**`. Antes de arrancar, define tu token:

```powershell
$env:DUFFEL_TOKEN="tu-token"
```

Endpoints disponibles:

```text
GET /api/duffel/reference/airports?query=Madrid&language=es&limit=50
GET /api/duffel/fly/search?origin=MAD&destination=BCN&departDate=2026-06-20&returnDate=2026-06-25&travelers=1
```
