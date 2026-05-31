# FASE DE IMPLANTACION

- [FASE DE IMPLANTACION](#fase-de-implantacion)
  - [1- Manual tecnico](#1--manual-tecnico)
    - [1.1- Instalacion](#11--instalacion)
      - [1.1.1- Instalacion en AWS EC2 y Amplify](#111--instalacion-en-aws-ec2-y-amplify)
      - [1.1.2- Instalacion local en una maquina virtual Ubuntu Server](#112--instalacion-local-en-una-maquina-virtual-ubuntu-server)
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

- Docker e Docker Compose para levantar a aplicacion completa con contedores.
- Java 21 ou superior, Maven, Node.js e npm se se quere executar o proxecto sen contedores.
- MySQL 8 ou unha base de datos compatible, como TiDB, se se usa unha base externa.
- Git.

Pasos para preparar o proxecto:

1. Clonar o repositorio.

```bash
git clone <url-do-repositorio>
cd Proxecto-DAW-2026-Ruben-Barbeito
```

2. Levantar a aplicacion completa con Docker Compose.

Toda a configuracion de contedores esta na carpeta `docker`. Este metodo levanta:

- `exploramas-front`: frontend Angular servido con Nginx.
- `exploramas-back`: backend Spring Boot.
- `exploramas-mysql`: base de datos MySQL inicializada con `src/back/db/init.sql`.

Desde a raiz do proxecto, entrar na carpeta de Docker:

```bash
cd docker
```

Crear o ficheiro de variables de contorno:

```bash
cp .env.example .env
```

Abrir o ficheiro para configuralo:

```bash
nano .env
```

Valores principais:

```env
SERVER_PORT=8080

MYSQL_ROOT_PASSWORD=root
MYSQL_DATABASE=exploramas
MYSQL_USER=daw
MYSQL_PASSWORD=daw123
MYSQL_PORT=3306

JWT_SECRET=change-me-with-at-least-32-characters
JWT_EXPIRATION_MINUTES=120

DUFFEL_API_BASE_URL=https://api.duffel.com
DUFFEL_TOKEN=token-de-duffel
DUFFEL_VERSION=v2

CORS_ALLOWED_ORIGINS=http://localhost:4200
FRONT_API_BASE_URL=http://localhost:8080/api
FRONT_REST_COUNTRIES_URL=https://restcountries.com/v3.1/all?fields=name,cca2,translations,flag,idd
```

Para gardar en `nano`, pulsar `Ctrl + O`, confirmar con `Enter` e sair con `Ctrl + X`.

Arrancar os contedores:

```bash
docker compose up --build
```

Se se quere deixar a aplicacion executando en segundo plano:

```bash
docker compose up -d --build
```

Comprobar o estado:

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

Se ademais se quere eliminar o volume da base de datos:

```bash
docker compose down -v
```

A aplicacion queda dispoñible en:

```text
Frontend: http://localhost:4200
Backend:  http://localhost:8080/api
MySQL:    localhost:3306
```

3. Execucion local sen contedores.

Se se quere executar cada parte manualmente para desenvolvemento, pódense seguir estes pasos.

4. Configurar o back.

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

5. Crear ou inicializar a base de datos.

O script de creacion esta en:

```text
src/back/db/init.sql
```

Se se usa Docker en local, desde `src/back` pódese levantar MySQL con:

```bash
docker compose up -d
```

Se se usa TiDB ou outra base externa, hai que executar manualmente o contido de `init.sql` sobre a base de datos correspondente.

6. Arrancar o back.

Desde `src/back`:

```bash
mvn spring-boot:run
```

Tamén se pode comprobar que compila con:

```bash
mvn -q -DskipTests compile
```

7. Configurar o front.

No directorio `src/front` debe existir un ficheiro `.env`. O repositorio inclue un exemplo en `src/front/.env.example`.

Variables principais do front:

```env
FRONT_API_BASE_URL=http://localhost:8080/api
FRONT_REST_COUNTRIES_URL=https://restcountries.com/v3.1/all?fields=name,cca2,translations,flag,idd
```

Antes de arrancar, o proxecto xera automaticamente `assets/env.js` usando o script `scripts/write-env.js`. Este ficheiro non debe subirse ao repositorio.

8. Instalar dependencias e arrancar o front.

Desde `src/front`:

```bash
npm install
npm start
```

A aplicacion quedara dispoñible normalmente en:

```text
http://localhost:4200
```

9. Comprobar compilacion do front.

```bash
npx tsc -p tsconfig.app.json --noEmit
```

#### 1.1.1- Instalacion en AWS EC2 y Amplify

Esta instalacion separa el proyecto en dos partes:

- Backend Spring Boot en una instancia Amazon EC2 con Ubuntu Server.
- Frontend Angular en AWS Amplify.

Arquitectura del despliegue:

```text
Usuario
   |
   v
AWS Amplify - Frontend Angular
   |
   | Peticiones HTTP/HTTPS a FRONT_API_BASE_URL
   v
Amazon EC2 - Backend Spring Boot
   |
   | JDBC
   v
MySQL / TiDB
```

Preparacion de la instancia EC2:

1. Crear una instancia EC2 con Ubuntu Server LTS.
2. Usar una instancia `t3.small` o similar para un despliegue basico.
3. Configurar el grupo de seguridad con los puertos necesarios:

- `22`: SSH, restringido a la IP del administrador.
- `80`: HTTP, si se usa Nginx o Certbot.
- `443`: HTTPS, recomendado para produccion.
- `8080`: solo si se expone directamente el backend. Lo recomendable es no abrirlo y usar Nginx como proxy.
- `3306`: no debe abrirse publicamente. La base de datos debe ser local a la maquina, privada o externa segura.

Instalar paquetes en EC2:

```bash
sudo apt update
sudo apt upgrade -y
sudo apt install -y git curl unzip ca-certificates openjdk-21-jdk maven nginx
```

Instalar Docker y Docker Compose desde el repositorio oficial de Docker:

```bash
sudo install -m 0755 -d /etc/apt/keyrings
sudo curl -fsSL https://download.docker.com/linux/ubuntu/gpg -o /etc/apt/keyrings/docker.asc
sudo chmod a+r /etc/apt/keyrings/docker.asc
echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.asc] https://download.docker.com/linux/ubuntu $(. /etc/os-release && echo ${UBUNTU_CODENAME:-$VERSION_CODENAME}) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
sudo apt update
sudo apt install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
sudo usermod -aG docker $USER
```

Despues de ejecutar `usermod`, cerrar sesion SSH y volver a entrar para que se apliquen los permisos de Docker.

Clonar el proyecto:

```bash
git clone <url-do-repositorio>
cd Proxecto-DAW-2026-Ruben-Barbeito
```

Configurar la base de datos:

Entrar en la carpeta del backend:

```bash
cd src/back
```

Crear el fichero `.env` a partir del ejemplo si existe:

```bash
cp .env.example .env
```

Si no existe `.env.example`, crear el fichero manualmente:

```bash
touch .env
```

Abrir el fichero:

```bash
nano .env
```

Si se quiere usar MySQL dentro de la propia EC2, pegar o modificar estos valores:

```env
MYSQL_ROOT_PASSWORD=contrasinal-root
MYSQL_DATABASE=exploramas
MYSQL_USER=daw
MYSQL_PASSWORD=contrasinal-daw
MYSQL_PORT=3306

SPRING_DATASOURCE_URL=jdbc:mysql://localhost:3306/exploramas?useSSL=false&allowPublicKeyRetrieval=true&serverTimezone=UTC
SPRING_DATASOURCE_USERNAME=daw
SPRING_DATASOURCE_PASSWORD=contrasinal-daw
```

Levantar MySQL desde `src/back`:

```bash
docker compose up -d
```

Si se usa una base de datos externa, como TiDB Cloud o Amazon RDS, no es necesario levantar el contenedor MySQL. En ese caso se deben configurar estas variables con los datos del proveedor dentro del mismo fichero `.env`:

```env
SPRING_DATASOURCE_URL=jdbc:mysql://host:porto/exploramas?useSSL=true&requireSSL=true&serverTimezone=UTC
SPRING_DATASOURCE_USERNAME=usuario
SPRING_DATASOURCE_PASSWORD=contrasinal
```

Configurar el resto de variables del backend:

```env
SERVER_PORT=8080
JWT_SECRET=clave-secreta-de-polo-menos-32-caracteres
JWT_EXPIRATION_MINUTES=120
DUFFEL_API_BASE_URL=https://api.duffel.com
DUFFEL_TOKEN=token-de-duffel
DUFFEL_VERSION=v2
CORS_ALLOWED_ORIGINS=https://dominio-de-amplify.amplifyapp.com
```

Para guardar en `nano`, pulsar `Ctrl + O`, confirmar con `Enter` y salir con `Ctrl + X`.

Compilar el backend:

```bash
mvn clean package -DskipTests
```

Crear una carpeta de despliegue:

```bash
sudo mkdir -p /opt/exploramas/back
sudo cp target/travel-back-0.0.1-SNAPSHOT.jar /opt/exploramas/back/app.jar
sudo cp .env /opt/exploramas/back/.env
sudo chown -R ubuntu:ubuntu /opt/exploramas/back
```

Crear el servicio `systemd` en `/etc/systemd/system/exploramas-back.service`:

Abrir el fichero del servicio:

```bash
sudo nano /etc/systemd/system/exploramas-back.service
```

Pegar este contenido:

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

Para guardar en `nano`, pulsar `Ctrl + O`, confirmar con `Enter` y salir con `Ctrl + X`.

Activar el servicio:

```bash
sudo systemctl daemon-reload
sudo systemctl enable exploramas-back
sudo systemctl start exploramas-back
sudo systemctl status exploramas-back
```

Configurar Nginx como proxy del backend:

Crear el fichero de configuracion:

```bash
sudo nano /etc/nginx/sites-available/exploramas-api
```

Pegar este contenido:

```nginx
server {
    listen 80;
    server_name api.dominio-exemplo.com;

    location /api/ {
        proxy_pass http://127.0.0.1:8080/api/;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    location ~ /\.(env|git) {
        deny all;
    }
}
```

Para guardar en `nano`, pulsar `Ctrl + O`, confirmar con `Enter` y salir con `Ctrl + X`.

Activar la configuracion:

```bash
sudo ln -s /etc/nginx/sites-available/exploramas-api /etc/nginx/sites-enabled/exploramas-api
sudo nginx -t
sudo systemctl reload nginx
```

Para HTTPS se recomienda usar Certbot cuando el dominio apunte a la instancia:

```bash
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d api.dominio-exemplo.com
```

Despliegue del frontend en AWS Amplify:

1. Entrar en AWS Amplify.
2. Crear una nueva aplicacion desde el repositorio.
3. Seleccionar la rama que se quiere desplegar.
4. Indicar como carpeta de aplicacion `src/front`.
5. Configurar las variables de entorno:

```env
FRONT_API_BASE_URL=https://api.dominio-exemplo.com/api
FRONT_REST_COUNTRIES_URL=https://restcountries.com/v3.1/all?fields=name,cca2,translations,flag,idd
```

Como el proyecto genera `assets/env.js` desde el fichero `.env`, la configuracion de build de Amplify debe crear ese fichero antes de compilar. Un ejemplo de `amplify.yml` seria:

```yaml
version: 1
applications:
  - appRoot: src/front
    frontend:
      phases:
        preBuild:
          commands:
            - npm ci
            - printf "FRONT_API_BASE_URL=$FRONT_API_BASE_URL\nFRONT_REST_COUNTRIES_URL=$FRONT_REST_COUNTRIES_URL\n" > .env
        build:
          commands:
            - npm run build
      artifacts:
        baseDirectory: dist/browser
        files:
          - '**/*'
      cache:
        paths:
          - node_modules/**/*
```

Despues del primer despliegue en Amplify hay que copiar el dominio generado por Amplify y anadirlo en el backend:

Entrar en la carpeta donde esta el `.env` de despliegue y abrirlo:

```bash
cd /opt/exploramas/back
nano .env
```

```env
CORS_ALLOWED_ORIGINS=https://dominio-de-amplify.amplifyapp.com
```

Guardar con `Ctrl + O`, confirmar con `Enter` y salir con `Ctrl + X`. Luego se reinicia el backend:

```bash
sudo systemctl restart exploramas-back
```

Comprobaciones finales en AWS:

```bash
sudo systemctl status exploramas-back
sudo journalctl -u exploramas-back -n 100
curl https://api.dominio-exemplo.com/api/experiences
```

Tambien se debe abrir la URL de Amplify en el navegador y comprobar:

- Registro e inicio de sesion.
- Carga de experiencias.
- Busqueda de vuelos.
- Creacion y detalle de viajes.

#### 1.1.2- Instalacion local en una maquina virtual Ubuntu Server

Esta instalacion permite ejecutar todo el proyecto en una maquina virtual Ubuntu Server dentro del equipo local. Es util para pruebas, demostraciones o despliegues en una red interna.

Arquitectura local:

```text
Navegador del equipo anfitrion
   |
   | http://IP-DE-LA-VM
   v
Nginx en Ubuntu Server - Frontend Angular compilado
   |
   | http://localhost:8080/api
   v
Spring Boot en la misma VM
   |
   | jdbc:mysql://localhost:3306/exploramas
   v
MySQL en Docker Compose
```

Requisitos de la maquina virtual:

- Ubuntu Server LTS.
- Al menos 2 CPU, 4 GB de RAM y 20 GB de disco para trabajar con comodidad.
- Red en modo puente o NAT con redireccion de puertos.
- Acceso SSH desde el equipo anfitrion.

Preparar el acceso por SSH:

Antes de instalar el resto de dependencias es recomendable activar SSH en la maquina virtual para poder administrarla desde el terminal del equipo anfitrion.

Dentro de la maquina virtual:

```bash
sudo apt update
sudo apt install openssh-server -y
sudo systemctl enable ssh
sudo systemctl start ssh
sudo systemctl status ssh
```

El servicio debe aparecer como `active (running)`. Despues se obtiene la IP de la maquina virtual:

```bash
ip a
```

Desde el terminal del equipo anfitrion se realiza la conexion:

```bash
ssh exploramas@IP-DE-LA-VM
```

Si el usuario de Ubuntu Server no se llama `exploramas`, se debe cambiar por el usuario real de la maquina.

Instalar paquetes desde la conexion SSH:

```bash
sudo apt update
sudo apt upgrade -y
sudo apt install -y git curl unzip ca-certificates openjdk-21-jdk maven nginx
```

Instalar Docker y Docker Compose desde el repositorio oficial de Docker:

```bash
sudo install -m 0755 -d /etc/apt/keyrings
sudo curl -fsSL https://download.docker.com/linux/ubuntu/gpg -o /etc/apt/keyrings/docker.asc
sudo chmod a+r /etc/apt/keyrings/docker.asc
echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.asc] https://download.docker.com/linux/ubuntu $(. /etc/os-release && echo ${UBUNTU_CODENAME:-$VERSION_CODENAME}) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
sudo apt update
sudo apt install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
sudo usermod -aG docker $USER
```

Instalar Node.js 20:

```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs
```

Cerrar sesion y volver a entrar para aplicar los permisos de Docker.

Clonar el repositorio:

```bash
git clone <url-do-repositorio>
cd Proxecto-DAW-2026-Ruben-Barbeito
```

Levantar el proyecto completo con contenedores:

```bash
cd docker
cp .env.example .env
nano .env
```

En `docker/.env` hay que revisar la configuracion de MySQL, JWT, Duffel, CORS y la URL del backend usada por el frontend:

```env
MYSQL_ROOT_PASSWORD=root
MYSQL_DATABASE=exploramas
MYSQL_USER=daw
MYSQL_PASSWORD=daw123
MYSQL_PORT=3306

JWT_SECRET=change-me-with-at-least-32-characters
DUFFEL_API_BASE_URL=https://api.duffel.com
DUFFEL_TOKEN=token-de-duffel
CORS_ALLOWED_ORIGINS=http://IP-DE-LA-VM:4200
FRONT_API_BASE_URL=http://IP-DE-LA-VM:8080/api
```

Para guardar en `nano`, pulsar `Ctrl + O`, confirmar con `Enter` y salir con `Ctrl + X`.

Arrancar los contenedores:

```bash
docker compose up -d --build
docker compose ps
```

Con esta opcion el frontend se consulta desde el equipo anfitrion en:

```text
http://IP-DE-LA-VM:4200
```

El backend queda disponible en:

```text
http://IP-DE-LA-VM:8080/api
```

Para ver logs o detener la aplicacion:

```bash
docker compose logs -f
docker compose down
```

Si se prefiere ejecutar el backend, frontend y Nginx de forma manual, se pueden seguir los pasos siguientes.

Configurar `src/back/.env` para usar MySQL local:

Desde la raiz del proyecto, entrar en la carpeta del backend:

```bash
cd src/back
```

Si existe un fichero de ejemplo, se puede copiar como base:

```bash
cp .env.example .env
```

Si no existe `.env.example`, se crea directamente el fichero:

```bash
touch .env
```

Abrir el fichero para editarlo:

```bash
nano .env
```

Pegar o modificar el contenido con estos valores:

```env
SERVER_PORT=8080

MYSQL_ROOT_PASSWORD=root
MYSQL_DATABASE=exploramas
MYSQL_USER=daw
MYSQL_PASSWORD=daw123
MYSQL_PORT=3306

SPRING_DATASOURCE_URL=jdbc:mysql://localhost:3306/exploramas?useSSL=false&allowPublicKeyRetrieval=true&serverTimezone=UTC
SPRING_DATASOURCE_USERNAME=daw
SPRING_DATASOURCE_PASSWORD=daw123

JWT_SECRET=clave-secreta-de-polo-menos-32-caracteres
JWT_EXPIRATION_MINUTES=120
DUFFEL_API_BASE_URL=https://api.duffel.com
DUFFEL_TOKEN=token-de-duffel
DUFFEL_VERSION=v2
CORS_ALLOWED_ORIGINS=http://IP-DE-LA-VM,http://IP-DE-LA-VM:4200
```

Para guardar en `nano`, pulsar `Ctrl + O`, confirmar con `Enter` y salir con `Ctrl + X`.

Nota sobre Duffel:

Para que funcione el buscador de vuelos es necesario crear una cuenta en Duffel:

1. Entrar en `https://duffel.com` y crear una cuenta.
2. Acceder al panel de desarrollador.
3. Crear o copiar un token de API desde la seccion de claves o access tokens.
4. Usar ese valor en `DUFFEL_TOKEN`.

La URL base de la API de Duffel se mantiene normalmente con este valor:

```env
DUFFEL_API_BASE_URL=https://api.duffel.com
```

La version de la API se indica en:

```env
DUFFEL_VERSION=v2
```

Si Duffel cambia la version recomendada o el endpoint base, debe actualizarse en el `.env` siguiendo la documentacion oficial de Duffel.

Levantar la base de datos:

```bash
docker compose up -d
docker compose ps
```

Compilar y ejecutar el backend:

```bash
mvn clean package -DskipTests
java -jar target/travel-back-0.0.1-SNAPSHOT.jar
```

Nota: el comando `java -jar target/travel-back-0.0.1-SNAPSHOT.jar` ejecuta el backend en primer plano. Mientras este activo, el terminal queda ocupado mostrando los logs de Spring Boot. Para salir de esa pantalla y parar el backend se pulsa `Ctrl + C`.

Para dejar el backend como servicio permanente, copiar el `.jar` y el `.env`:

```bash
sudo mkdir -p /opt/exploramas/back
sudo cp target/travel-back-0.0.1-SNAPSHOT.jar /opt/exploramas/back/app.jar
sudo cp .env /opt/exploramas/back/.env
sudo chown -R $USER:$USER /opt/exploramas/back
```

Crear `/etc/systemd/system/exploramas-back.service`:

Abrir el fichero del servicio:

```bash
sudo nano /etc/systemd/system/exploramas-back.service
```

Pegar este contenido:

```ini
[Unit]
Description=ExploraMas Spring Boot Backend
After=network.target docker.service

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

Si el usuario de la VM no se llama `ubuntu`, hay que cambiar `User=ubuntu` por el usuario correcto. Para consultar el usuario actual se puede usar:

```bash
whoami
```

Para guardar en `nano`, pulsar `Ctrl + O`, confirmar con `Enter` y salir con `Ctrl + X`.

Activar el servicio:

```bash
sudo systemctl daemon-reload
sudo systemctl enable exploramas-back
sudo systemctl start exploramas-back
sudo systemctl status exploramas-back
```

Comandos utiles para administrar el backend:

```bash
sudo systemctl stop exploramas-back
sudo systemctl restart exploramas-back
sudo systemctl status exploramas-back
sudo journalctl -u exploramas-back -f
```

Configurar el frontend:

```bash
cd ../front
npm ci
```

Editar `src/front/.env`:

Si existe un fichero de ejemplo, copiarlo:

```bash
cp .env.example .env
```

Si no existe, crear el fichero:

```bash
touch .env
```

Abrir el fichero:

```bash
nano .env
```

Pegar o modificar el contenido:

```env
FRONT_API_BASE_URL=http://IP-DE-LA-VM/api
FRONT_REST_COUNTRIES_URL=https://restcountries.com/v3.1/all?fields=name,cca2,translations,flag,idd
```

Para guardar en `nano`, pulsar `Ctrl + O`, confirmar con `Enter` y salir con `Ctrl + X`.

Compilar Angular:

```bash
npm run build
```

Publicar el frontend con Nginx:

```bash
sudo mkdir -p /var/www/exploramas
sudo rm -rf /var/www/exploramas/*
sudo cp -r dist/browser/* /var/www/exploramas/
sudo chown -R www-data:www-data /var/www/exploramas
sudo find /var/www/exploramas -type d -exec chmod 755 {} \;
sudo find /var/www/exploramas -type f -exec chmod 644 {} \;
```

Crear `/etc/nginx/sites-available/exploramas`:

Abrir el fichero de configuracion de Nginx:

```bash
sudo nano /etc/nginx/sites-available/exploramas
```

Pegar este contenido:

```nginx
server {
    listen 80;
    server_name _;

    root /var/www/exploramas;
    index index.html;

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
    }
}
```

Para guardar en `nano`, pulsar `Ctrl + O`, confirmar con `Enter` y salir con `Ctrl + X`.

Activar la web:

```bash
sudo rm -f /etc/nginx/sites-enabled/default
sudo ln -s /etc/nginx/sites-available/exploramas /etc/nginx/sites-enabled/exploramas
sudo nginx -t
sudo systemctl reload nginx
```

Comprobaciones finales en la VM:

```bash
cd ../back
docker compose ps
sudo systemctl status exploramas-back
sudo systemctl status nginx
curl http://localhost:8080/api/experiences
curl http://localhost/api/experiences
```

Desde el equipo anfitrion se accede con:

```text
http://IP-DE-LA-VM
```

Si se quiere arrancar Angular en modo desarrollo en vez de usar Nginx:

```bash
cd src/front
npm start -- --host 0.0.0.0
```

En ese caso el frontend queda disponible en:

```text
http://IP-DE-LA-VM:4200
```

Y `CORS_ALLOWED_ORIGINS` debe incluir `http://IP-DE-LA-VM:4200`.

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

[**<-Anterior**](../README.md)
