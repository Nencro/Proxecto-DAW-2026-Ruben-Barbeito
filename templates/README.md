# ExploraMas

ExploraMas e unha aplicacion de viaxes formada por un frontend Angular, un backend Spring Boot e unha base de datos MySQL. A base de datos pode executarse nun contedor local ou localizarse nun servizo externo compatible con MySQL.

Pódese visitar unha version despregada da paxina en:

```text
https://staging.d28z49kx6xmyng.amplifyapp.com/
```

## Levantar o proxecto con contedores

A configuracion de Docker esta na carpeta `docker`. Este metodo levanta tres contedores:

- `exploramas-front`: aplicacion Angular publicada con Nginx.
- `exploramas-back`: API REST de Spring Boot.
- `exploramas-mysql`: base de datos MySQL inicializada con `src/back/db/init.sql`.

Desde a raiz do proxecto:

```bash
cd docker
cp .env.example .env
nano .env
```

No ficheiro `.env` deben revisarse, como minimo, estes valores:

```env
MYSQL_ROOT_PASSWORD=root
MYSQL_DATABASE=exploramas
MYSQL_USER=daw
MYSQL_PASSWORD=daw123
MYSQL_PORT=3306

JWT_SECRET=change-me-with-at-least-32-characters
DUFFEL_API_BASE_URL=https://api.duffel.com
DUFFEL_TOKEN=token-de-duffel
CORS_ALLOWED_ORIGINS=http://localhost:4200
FRONT_API_BASE_URL=http://localhost:8080/api
```

Para arrancar a aplicacion:

```bash
docker compose up --build
```

Se se quere deixar executando en segundo plano:

```bash
docker compose up -d --build
```

Comprobar os contedores:

```bash
docker compose ps
```

Ver logs:

```bash
docker compose logs -f
```

Parar os contedores:

```bash
docker compose down
```

Enderezos principais:

- Frontend: `http://localhost:4200`
- Backend: `http://localhost:8080/api`
- MySQL: `localhost:3306`

## Usuarios de proba

O script `src/back/db/init.sql` crea estes usuarios iniciais:

| Usuario | Email | Contrasinal | Roles |
|---|---|---|---|
| `admin` | `admin@exploramas.com` | `admin123` | `ADMIN` |
| `empresa` | `empresa@exploramas.com` | `empresa123` | `USUARIO`, `EMPRESA` |
| `user` | `user@exploramas.com` | `user123` | `USUARIO` |

## Execucion local sen contedores

### Backend

```bash
cd src/back
cp .env.example .env
nano .env
mvn spring-boot:run
```

O backend queda dispoñible en:

```text
http://localhost:8080/api
```

### Frontend

```bash
cd src/front
cp .env.example .env
nano .env
npm install
npm start
```

O frontend queda dispoñible en:

```text
http://localhost:4200
```

## Documentacion

A documentacion completa do proxecto esta nos ficheiros da carpeta `templates`, especialmente en `6_Implantación.md` para a instalacion e despregue.
