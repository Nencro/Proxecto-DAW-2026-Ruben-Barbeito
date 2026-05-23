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

## Travelpayouts

El backend consulta Travelpayouts desde `/api/travelpayouts/**`. Antes de arrancar, define tu token de afiliado:

```powershell
$env:TRAVELPAYOUTS_TOKEN="tu-token"
```

Endpoints disponibles:

```text
GET /api/travelpayouts/reference/cities?query=Madrid&language=es
GET /api/travelpayouts/reference/airports?query=MAD&language=es
GET /api/travelpayouts/flights/cheap?origin=MAD&destination=PAR&departDate=2026-06&currency=eur
GET /api/travelpayouts/flights/direct?origin=MAD&destination=PAR&departDate=2026-06&currency=eur
GET /api/travelpayouts/flights/month-matrix?origin=MAD&destination=PAR&month=2026-06-01&currency=eur
GET /api/travelpayouts/flights/city-directions?origin=MAD&currency=eur
GET /api/travelpayouts/hotels/search?query=Madrid&language=es&lookFor=both
GET /api/travelpayouts/hotels/search-by-coordinates?latitude=40.4168&longitude=-3.7038&language=es
GET /api/travelpayouts/hotels/prices?location=Madrid&checkIn=2026-06-20&checkOut=2026-06-21&currency=eur&limit=5
```
