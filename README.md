# ExploraMas

- [ExploraMas](#exploramas)
  - [Estado do proxecto](#estado-do-proxecto)
  - [Descrición](#descrición)
  - [Tecnoloxías](#tecnoloxías)
  - [Instalación / posta en marcha](#instalación--posta-en-marcha)
  - [Uso](#uso)
  - [Sobre o autor](#sobre-o-autor)
  - [Licenza](#licenza)
  - [Índice da documentación](#índice-da-documentación)
  - [Guía de contribución](#guía-de-contribución)
  - [Ligazóns](#ligazóns)

## Estado do proxecto

ExploraMas é un proxecto de fin de ciclo en fase de desenvolvemento avanzado. A aplicación conta cun frontend Angular, unha API REST con Spring Boot, autenticación mediante token, xestión de usuarios, viaxes, experiencias e integración con servizos externos para a busca de voos e datos de países.

## Descrición

ExploraMas é unha aplicación web para organizar viaxes dunha forma sinxela. O obxectivo é que unha persoa usuaria poida crear os seus propios plans de viaxe, indicar destino, datas, custo do billete, actividades e participantes, mantendo toda a información nun único lugar.

A plataforma tamén permite consultar experiencias turísticas publicadas por usuarios con rol de empresa ou administración. Ademais, a aplicación incorpora un buscador de voos conectado coa API de Duffel para ampliar as opcións dispoñibles durante a planificación.

O proxecto está dividido en dúas partes principais: unha aplicación cliente desenvolvida con Angular e unha API REST desenvolvida con Spring Boot. A persistencia realízase nunha base de datos MySQL, que pode levantarse en local mediante Docker Compose, despregarse nunha máquina Ubuntu Server ou localizarse nun servizo externo compatible, como unha base de datos xestionada na nube.

## Tecnoloxías

- Angular 17.
- TypeScript.
- Spring Boot 3.
- Java 21.
- Maven.
- MySQL 8.
- Docker Compose.
- Nginx.
- AWS EC2 e AWS Amplify para o despregue.
- Duffel API para a busca de voos.
- RestCountries API para datos de países.

## Instalación / posta en marcha

Requisitos principais:

- Java 21.
- Maven.
- Node.js 20 ou superior.
- npm.
- Docker e Docker Compose.
- MySQL 8 ou contedor MySQL.

Clonar o repositorio:

```bash
git clone <url-do-repositorio>
cd Proxecto-DAW-2026-Ruben-Barbeito
```

Configurar o backend:

```bash
cd src/back
cp .env.example .env
docker compose up -d
mvn spring-boot:run
```

Configurar o frontend noutra terminal:

```bash
cd src/front
cp .env.example .env
npm install
npm start
```

Tamén se pode levantar a aplicación completa con contedores Docker desde a carpeta `docker`:

```bash
cd docker
cp .env.example .env
docker compose up --build
```

Neste caso quedan dispoñibles:

```text
Frontend: http://localhost:4200
Backend:  http://localhost:8080
MySQL:    localhost:3306
```

A aplicación queda dispoñible normalmente en:

```text
http://localhost:4200
```

A guía completa de instalación local, instalación nunha máquina virtual Ubuntu Server e despregue en AWS está documentada en [Implantación](templates/6_Implantación.md).

## Uso

Un usuario anónimo pode consultar experiencias e acceder ao rexistro ou ao inicio de sesión. Un usuario rexistrado pode crear viaxes, consultar os seus detalles, organizar actividades por días, engadir o custo dun voo e xestionar participantes. Os usuarios con rol `EMPRESA` poden crear e xestionar as súas propias experiencias turísticas. Os usuarios con rol `ADMIN` poden administrar usuarios e roles.

Fluxo principal de uso:

1. Rexistrarse ou iniciar sesión.
2. Crear unha viaxe indicando destino, país e datas.
3. Buscar voos e engadir o custo do billete á viaxe.
4. Engadir actividades ou experiencias ao itinerario.
5. Invitar participantes ou consultar os detalles da viaxe.

## Sobre o autor

Proxecto desenvolvido por Rubén Barbeito como proxecto de fin de ciclo de Desenvolvemento de Aplicacións Web. O proxecto combina desenvolvemento frontend, backend, base de datos, despregue e documentación técnica, cun enfoque práctico orientado á creación dunha aplicación web completa.

## Licenza

O código fonte de ExploraMas distribúese baixo a licenza GNU General Public License v3.0 ou posterior. O texto da licenza está dispoñible no ficheiro [LICENSE](LICENSE).

A documentación do proxecto distribúese baixo a GNU Free Documentation License v1.3 ou posterior, sen seccións invariantes nin textos de portada ou contraportada. O texto aplicable está dispoñible en [LICENSE-DOCUMENTATION](LICENSE-DOCUMENTATION).

As librarías, frameworks e servizos externos utilizados manteñen as súas propias licenzas. O resumo das principais dependencias pode consultarse en [THIRD_PARTY_LICENSES.md](THIRD_PARTY_LICENSES.md).

## Índice da documentación

1. [Anteproxecto](templates/1_Anteproxecto.md)
2. [Empresa](templates/2_Empresa.md)
3. [Análise](templates/3_Analise.md)
4. [Deseño](templates/4_Deseño.md)
5. [Codificación e probas](templates/5_Codificacion_e_probas.md)
6. [Implantación](templates/6_Implantación.md)
7. [Referencias](templates/7_Referencias.md)

## Guía de contribución

As contribucións poden realizarse mediante melloras no código, corrección de erros, ampliación de probas, melloras na documentación ou novas funcionalidades. Recoméndase traballar nunha rama separada, describir claramente os cambios realizados e comprobar que o frontend e o backend compilan antes de integrar modificacións.

Comprobacións recomendadas:

```bash
cd src/front
npx tsc -p tsconfig.app.json --noEmit
```

```bash
cd src/back
mvn test
```

## Ligazóns

- [Documentación de Angular](https://angular.dev/)
- [Documentación de Spring Boot](https://spring.io/projects/spring-boot)
- [MySQL](https://www.mysql.com/)
- [Docker](https://www.docker.com/)
- [Duffel API](https://duffel.com/docs)
- [RestCountries](https://restcountries.com/)
