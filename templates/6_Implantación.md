# FASE DE IMPLANTACION

- [FASE DE IMPLANTACION](#fase-de-implantacion)
  - [1- Manual tecnico](#1--manual-tecnico)
    - [1.1- Instalacion](#11--instalacion)
    - [1.2- Administracion do sistema](#12--administracion-do-sistema)
  - [2- Manual de usuario](#2--manual-de-usuario)
  - [3- Melloras futuras](#3--melloras-futuras)

Este documento describe como instalar, administrar e utilizar a aplicacion ExploraMas unha vez rematada a fase principal de desenvolvemento.

## 1- Manual tecnico

### 1.1- Instalacion

ExploraMas esta dividida en dous proxectos principais:

- `src/back`: API REST desenvolvida con Spring Boot.
- `src/front`: aplicacion cliente desenvolvida con Angular.

Requisitos recomendados:

- Java 17 ou superior.
- Maven.
- Node.js e npm.
- MySQL 8 ou unha base de datos compatible, como TiDB.
- Docker, opcional, para levantar a base de datos local.
- Git.

Pasos para preparar o proxecto:

1. Clonar o repositorio.

```bash
git clone <url-do-repositorio>
cd Proxecto-DAW-2026-Ruben-Barbeito
```

2. Configurar o back.

No directorio `src/back` debe existir un ficheiro `.env`. O repositorio inclue un exemplo en `src/back/.env.example`.

Variables principais do back:

```env
SERVER_PORT=8080
SPRING_DATASOURCE_URL=jdbc:mysql://host:porto/exploramas?useSSL=true&requireSSL=true&serverTimezone=UTC
SPRING_DATASOURCE_USERNAME=usuario
SPRING_DATASOURCE_PASSWORD=contrasinal
JWT_SECRET=clave-secreta-de-polo-menos-32-caracteres
JWT_EXPIRATION_MINUTES=120
DUFFEL_API_BASE_URL=https://api.duffel.com
DUFFEL_TOKEN=token-de-duffel
DUFFEL_VERSION=v2
CORS_ALLOWED_ORIGINS=http://localhost:4200
```

3. Crear ou inicializar a base de datos.

O script de creacion esta en:

```text
src/back/db/init.sql
```

Se se usa Docker en local, desde `src/back` pódese levantar MySQL con:

```bash
docker compose up -d
```

Se se usa TiDB ou outra base externa, hai que executar manualmente o contido de `init.sql` sobre a base de datos correspondente.

4. Arrancar o back.

Desde `src/back`:

```bash
mvn spring-boot:run
```

Tamén se pode comprobar que compila con:

```bash
mvn -q -DskipTests compile
```

5. Configurar o front.

No directorio `src/front` debe existir un ficheiro `.env`. O repositorio inclue un exemplo en `src/front/.env.example`.

Variables principais do front:

```env
FRONT_API_BASE_URL=http://localhost:8080/api
FRONT_REST_COUNTRIES_URL=https://restcountries.com/v3.1/all?fields=name,cca2,translations,flag,idd
```

Antes de arrancar, o proxecto xera automaticamente `assets/env.js` usando o script `scripts/write-env.js`. Este ficheiro non debe subirse ao repositorio.

6. Instalar dependencias e arrancar o front.

Desde `src/front`:

```bash
npm install
npm start
```

A aplicacion quedara dispoñible normalmente en:

```text
http://localhost:4200
```

7. Comprobar compilacion do front.

```bash
npx tsc -p tsconfig.app.json --noEmit
```

Configuracion da maquina Ubuntu en AWS:

Para a implantacion en producion pódese empregar unha instancia EC2 con Ubuntu Server LTS. Unha configuracion inicial suficiente para o proxecto seria unha instancia `t3.small` ou similar, xa que a base de datos esta nun servizo externo e a maquina executaria principalmente Nginx e a API de Spring Boot.

No grupo de seguridade de AWS deben abrirse so os portos necesarios:

- `22`: SSH, restrinxido ao enderezo IP do administrador.
- `80`: HTTP, aberto para redireccionar a HTTPS.
- `443`: HTTPS, aberto para servir a aplicacion.

Non se deben abrir publicamente os portos `8080`, `3306` nin `4000`. O porto `8080` queda so para comunicacion interna entre Nginx e Spring Boot, e a conexion coa base de datos externa faise desde a aplicacion usando as credenciais do ficheiro `.env`.

Paquetes basicos da maquina:

```bash
sudo apt update
sudo apt upgrade -y
sudo apt install -y nginx openjdk-17-jre git curl
```

Estrutura recomendada na maquina:

```text
/var/www/exploramas        -> frontend Angular compilado
/opt/exploramas/back       -> backend Spring Boot e ficheiro .env
```

O backend pode executarse como servizo de sistema. Un exemplo de unidade `systemd` seria:

```ini
[Unit]
Description=ExploraMas Spring Boot Backend
After=network.target

[Service]
User=ubuntu
WorkingDirectory=/opt/exploramas/back
EnvironmentFile=/opt/exploramas/back/.env
ExecStart=/usr/bin/java -jar /opt/exploramas/back/app.jar
SuccessExitStatus=143
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
```

Despois de crear o ficheiro en `/etc/systemd/system/exploramas-back.service`, activaríase con:

```bash
sudo systemctl daemon-reload
sudo systemctl enable exploramas-back
sudo systemctl start exploramas-back
sudo systemctl status exploramas-back
```

Configuracion de Nginx:

Nginx encárgase de servir o frontend Angular e de reenviar as chamadas `/api` ao backend Spring Boot. Deste xeito, Spring Boot non queda exposto directamente a internet.

Exemplo de configuracion en `/etc/nginx/sites-available/exploramas`:

```nginx
server {
    listen 80;
    server_name dominio-exemplo.com www.dominio-exemplo.com;

    root /var/www/exploramas;
    index index.html;

    server_tokens off;
    client_max_body_size 10M;

    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;
    add_header Permissions-Policy "camera=(), microphone=(), geolocation=()" always;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location /api/ {
        proxy_pass http://127.0.0.1:8080/api/;
        proxy_http_version 1.1;

        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;

        proxy_connect_timeout 10s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }

    location ~* \.(env|log|sql|bak|config|properties|yml|yaml)$ {
        deny all;
    }

    location ~ /\. {
        deny all;
    }
}
```

Activacion da configuracion:

```bash
sudo ln -s /etc/nginx/sites-available/exploramas /etc/nginx/sites-enabled/exploramas
sudo nginx -t
sudo systemctl reload nginx
```

Para HTTPS recoméndase empregar Certbot. Unha vez o dominio apunte á instancia:

```bash
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d dominio-exemplo.com -d www.dominio-exemplo.com
```

Cando HTTPS funcione correctamente, pódese engadir a cabeceira HSTS:

```nginx
add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
```

Tamén se pode engadir limitacion basica de peticions para reducir ataques de forza bruta ou abuso da API:

```nginx
limit_req_zone $binary_remote_addr zone=api_limit:10m rate=10r/s;
limit_req_zone $binary_remote_addr zone=login_limit:10m rate=3r/m;
```

E dentro do bloque `server`:

```nginx
location /api/auth/login {
    limit_req zone=login_limit burst=5 nodelay;
    proxy_pass http://127.0.0.1:8080/api/auth/login;
}

location /api/ {
    limit_req zone=api_limit burst=30 nodelay;
    proxy_pass http://127.0.0.1:8080/api/;
}
```

Comprobacions finais da implantacion:

```bash
sudo nginx -t
sudo systemctl status nginx
sudo systemctl status exploramas-back
curl -I https://dominio-exemplo.com
curl https://dominio-exemplo.com/api/experiences
```

Usuarios iniciais:

O script `init.sql` crea os roles base da aplicacion:

- `USUARIO`
- `EMPRESA`
- `ADMIN`

Tamén pode incluir usuarios iniciais para probas, como un usuario administrador e un usuario empresa. As contrasinais gardadas na base de datos deben estar cifradas con BCrypt.

Estrutura xeral de despregue:

```text
Navegador
   |
   | HTTP
   v
Angular Frontend
   |
   | REST / JSON
   v
Spring Boot API
   |
   | JDBC
   v
MySQL / TiDB

Spring Boot API
   |
   | HTTPS
   v
Duffel API / RestCountries
```

### 1.2- Administracion do sistema

Tarefas recomendadas de administracion:

- Manter actualizado o ficheiro `.env` de cada contorno.
- Non subir nunca tokens, contrasinais nin ficheiros `.env` ao repositorio.
- Renovar periodicamente a clave `JWT_SECRET`.
- Revisar que `CORS_ALLOWED_ORIGINS` conteña só os dominios autorizados.
- Controlar os permisos dos usuarios con roles `USUARIO`, `EMPRESA` e `ADMIN`.
- Revisar periodicamente os logs do back para detectar erros de API, acceso non autorizado ou problemas de base de datos.
- Facer copias de seguridade da base de datos.
- Probar os formularios principais despois de cada cambio.
- Manter actualizadas as dependencias de Maven e npm cando sexa posible.

Copias de seguridade:

- Se se usa MySQL local, pódese facer unha copia con `mysqldump`.
- Se se usa TiDB Cloud, deben configurarse copias desde o panel do provedor.
- As copias deben gardarse nun lugar seguro e probar periodicamente a restauracion.

Xestion de usuarios:

- O rol `USUARIO` e o rol base e non debe eliminarse.
- O rol `EMPRESA` permite crear experiencias.
- O rol `ADMIN` permite acceder a funcionalidades de administracion.
- Un administrador pode consultar perfis doutros usuarios e modificar os seus roles.

Xestion de incidencias:

- Se falla o rexistro por falta de roles, hai que comprobar que se executou `init.sql`.
- Se falla a conexion coa base de datos, revisar `SPRING_DATASOURCE_URL`, usuario, contrasinal e regras de acceso da base externa.
- Se falla Duffel, revisar `DUFFEL_TOKEN` e a conectividade coa API.
- Se o front non chama ao back correcto, revisar `src/front/.env` e rexenerar `assets/env.js` executando `npm start` ou `npm run build`.

## 2- Manual de usuario

ExploraMas pode ser usada por tres tipos de usuario:

- Usuario non rexistrado.
- Usuario rexistrado.
- Usuario empresa ou administrador.

Usuario non rexistrado:

1. Pode acceder á paxina principal.
2. Pode consultar experiencias.
3. Pode ir ao rexistro ou ao login.
4. Pode consultar paxinas informativas como contacto, axuda, preguntas frecuentes e apartados legais.

Rexistro e login:

1. O usuario debe crear unha conta indicando usuario, email e contrasinal.
2. A contrasinal debe cumprir as condicions indicadas no formulario.
3. Se o usuario ou o email xa existen, o formulario amosa o erro no campo correspondente.
4. Unha vez rexistrado ou logueado, o usuario accede ao seu perfil.

Perfil:

1. O usuario pode consultar os seus datos.
2. Pode editar nome, apelidos, telefono e pais.
3. O pais usa autocompletado e garda o codigo correspondente.
4. Pode pechar sesion desde o perfil ou desde o menu do header.

Viaxes:

1. O usuario rexistrado pode acceder a "Mis Viajes".
2. Pode crear unha nova viaxe indicando destino, pais e datas.
3. Pode consultar o detalle dunha viaxe.
4. O creador pode editar datas, custo do billete e actividades.
5. O creador pode crear ligazons de invitacion para que outros usuarios se unan.
6. O creador pode ver e xestionar participantes.
7. Un participante pode sairse dun viaxe, pero o creador non pode eliminarse a si mesmo.

Actividades:

1. Dentro dun viaxe pódese seleccionar o dia.
2. Para cada dia pódense engadir actividades con hora, descricion e custo.
3. O boton de gardar actualiza o conxunto de datos do viaxe.
4. A aplicacion calcula o custo total sumando billete e actividades.

Voos:

1. No buscador de voos indícase orixe, destino, ida, volta e pasaxeiros.
2. A aplicacion consulta Duffel.
3. Nos resultados pódese engadir o custo dun voo a unha viaxe compatible.

Experiencias:

1. Calquera usuario pode consultar experiencias.
2. Pódese filtrar por nome, pais ou localidade.
3. Un usuario con rol `EMPRESA` pode crear novas experiencias.
4. O creador dunha experiencia pode editala ou eliminala.
5. Un usuario pode engadir unha experiencia a unha viaxe futura do mesmo pais.

Administrador:

1. Pode acceder a perfis doutros usuarios usando o nome de usuario.
2. Pode engadir ou quitar roles.
3. Non pode eliminar o rol base `USUARIO`.
4. Non modifica os datos persoais doutro usuario desde esa vista.

## 3- Melloras futuras

Posibles melloras para version posteriores:

- Engadir probas unitarias e de integracion automatizadas.
- Crear un sistema de notificacións para invitacions, cambios de viaxe e actividades.
- Permitir subida de imaxes a un servizo externo en vez de gardalas na base de datos.
- Engadir paxinacion real nos listados de experiencias e viaxes.
- Mellorar a busqueda de voos con filtros por prezo, escala, aeroliña e horario.
- Engadir reservas reais de experiencias.
- Crear panel de administracion completo.
- Engadir internacionalizacion da interface.
- Crear despregue automatizado con Docker e CI/CD.
- Engadir logs estruturados e monitorizacion.
- Permitir que os participantes comenten ou voten actividades dentro dun viaxe.

[**<-Anterior**](../../README.md)
