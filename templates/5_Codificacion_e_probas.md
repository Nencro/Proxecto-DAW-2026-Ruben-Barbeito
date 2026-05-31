# FASE DE CODIFICACION E PROBAS

- [FASE DE CODIFICACION E PROBAS](#fase-de-codificacion-e-probas)
  - [1- Codificacion](#1--codificacion)
  - [2- Prototipos](#2--prototipos)
  - [3- Innovacion](#3--innovacion)
  - [4- Probas](#4--probas)

Este documento recolle o traballo realizado durante a fase de codificacion e probas da aplicacion ExploraMas.

## 1- Codificacion

O proxecto desenvolveuse separando claramente a parte cliente e a parte servidor:

- `src/front`: aplicacion web feita con Angular.
- `src/back`: API REST feita con Spring Boot.
- `src/back/db/init.sql`: script de creacion e carga inicial da base de datos.

Durante a codificacion foronse implementando e axustando os principais modulos da aplicacion:

- Rexistro, login, recuperacion de contrasinal e peche de sesion.
- Perfil de usuario, con edicion de datos persoais, pais e telefono.
- Roles de usuario: `USUARIO`, `EMPRESA` e `ADMIN`.
- Xestion de viaxes: creacion, listado, detalle, participantes, actividades, custos e invitacions.
- Busqueda de voos usando a API de Duffel.
- Xestion de experiencias: listado, filtros, detalle, creacion, edicion e eliminacion.
- Engadir experiencias e voos a viaxes existentes mediante modais CDK.
- Paxinas auxiliares: contacto, axuda, preguntas frecuentes, legal, cookies e condicions.
- Melloras responsive para vista mobil: header, footer despregable, taboas adaptadas e boton de volver arriba.

A medida que avanzou o desenvolvemento, realizáronse cambios sobre o deseño inicial para mellorar a experiencia de uso. Algúns exemplos foron a reorganizacion das tarxetas de voos, a simplificacion da parte de hoteis, a creacion dun modulo propio de experiencias e a mellora da accesibilidade mediante atributos `aria`.

Tamén se separou a configuracion sensible en ficheiros `.env`, deixando exemplos `.env.example` e configurando `.gitignore` para evitar subir tokens, contrasinais ou datos privados ao repositorio.

## 2- Prototipos

Para o deseño visual empregouse Figma. O prototipo principal da aplicacion pode consultarse na seguinte ligazon:

[Explora - Figma](https://www.figma.com/design/uKYEPh0pMD1AgcECwWXYnQ/Explora?m=auto&t=VAhKRjJim1a62RFA-1)

O prototipo serviu como referencia para definir:

- Estrutura xeral da landing page.
- Deseño do header e footer.
- Formularios de rexistro, login, perfil.
- Adaptacion da interface a dispositivos mobiles.

Durante a implementacion houbo axustes con respecto ao prototipo inicial, especialmente nos compoñentes interactivos. Por exemplo, algunhas accions pasaron a mostrarse en modais usando Angular CDK para mellorar a accesibilidade e evitar confirmacions nativas do navegador.

## 3- Innovacion

Como parte innovadora do proxecto empregáronse Spring Boot e Angular como tecnoloxias principais.

Angular permitiu crear unha aplicacion de paxina unica, con compoñentes reutilizables, rutas protexidas, formularios validados, servizos para comunicacion coa API e unha interface responsive. Un dos retos foi organizar correctamente os compoñentes a medida que a aplicacion medraba, separando funcionalidades como viaxes, experiencias, perfil, busqueda e elementos compartidos.

Spring Boot empregouse para desenvolver unha API REST estruturada en controladores, servizos, DTOs e manexo global de excepcions. Isto permitiu centralizar a logica de negocio, validar permisos segundo o rol do usuario e conectar a aplicacion cunha base de datos MySQL/TiDB. Un dos retos principais foi controlar correctamente a seguridade mediante tokens JWT, evitando que usuarios non autorizados accedesen a datos doutros usuarios.

Outros aspectos destacados foron:

- Integracion coa API de Duffel para consulta de aeroportos e voos.
- Uso de RestCountries para autocompletado de paises.
- Uso de Angular CDK para modais accesibles.
- Xestion de roles e permisos para usuarios normais, empresas e administradores.
- Deseño responsive adaptado a mobil, tablet e escritorio.

## 4- Probas

As probas realizáronse de forma progresiva durante o desenvolvemento. Comprobáronse tanto aspectos funcionais como tecnicos.

Probas funcionais realizadas:

- Rexistro de usuarios novos.
- Control de erros cando o usuario ou email xa existen.
- Inicio de sesion e peche de sesion.
- Recuperacion de contrasinal.
- Edicion do perfil.
- Acceso restrinxido a vistas de administrador.
- Creacion, edicion e eliminacion de viaxes.
- Consulta de viaxes nos que participa un usuario.
- Engadir e eliminar participantes dun viaxe.
- Creacion e uso de ligazons de invitacion.
- Engadir actividades a un viaxe e gardar os cambios.
- Calculo de custos de billetes, actividades e total do viaxe.
- Busqueda de voos e engadir prezo dun voo a un viaxe.
- Listado, filtrado, creacion, edicion e borrado de experiencias.
- Engadir experiencias a viaxes futuros do mesmo pais.

Usuarios empregados nas probas:

- `admin@exploramas.com`: usuario administrador, empregado para comprobar o acceso a vistas restrinxidas e a xestion de roles.
- `empresa@exploramas.com`: usuario con rol de empresa, empregado para comprobar a creacion e xestion de experiencias.
- `user@exploramas.com`: usuario normal, empregado para comprobar rexistro, login, perfil, viaxes, invitacions e participacion en viaxes.
- Usuarios creados manualmente durante as probas, para verificar rexistros novos, erros por email repetido e funcionamento con distintas contas.

Probas tecnicas realizadas:

- Compilacion do front:

```bash
npx tsc -p tsconfig.app.json --noEmit
```

- Compilacion do back:

```bash
mvn -q -DskipTests compile
```

- Comprobacion de rutas protexidas con usuarios non autenticados.
- Comprobacion de permisos segundo rol (`USUARIO`, `EMPRESA`, `ADMIN`).
- Comprobacion de que os tokens caducados eliminan o estado de sesion.
- Comprobacion de que os ficheiros `.env` quedan ignorados por Git.
- Comprobacion visual da interface en vista escritorio e mobil.

Probas de seguridade realizadas:

- Revisouse o comportamento dos formularios introducindo datos inesperados ou maliciosos.
- Empregouse a IA de GitHub Copilot como apoio para propoñer posibles intentos de ataque controlados.
- Probouse a introducion de cadeas relacionadas con cross-site scripting (XSS), como etiquetas HTML ou scripts, nos campos de texto da aplicacion.
- Probouse a introducion de cadeas relacionadas con SQL injection nos formularios de login, rexistro, busqueda e creacion de contido.
- Comprobouse que os formularios validan os datos antes de envialos e que o backend traballa con DTOs, validacions e consultas controladas mediante JPA, reducindo o risco de execucion directa de SQL introducido polo usuario.
- Tamén se revisaron accesos sen autenticacion, tokens caducados e permisos insuficientes para confirmar que a API responde con erros controlados.

Problemas atopados e solucionados:

- Habia datos sensibles hardcodeados na configuracion. Solucionouse movendo URLs, tokens, credenciais e claves a ficheiros `.env`.
- As taboas non eran comodas en mobil. Adaptáronse os estilos para mellorar a lectura e a interaccion.
- Algúns modais usaban confirmacions nativas do navegador. Substituíronse por modais feitos con Angular CDK.
- A seleccion de paises e aeroportos necesitaba autocompletado. Engadíronse chamadas a APIs externas e filtrado desde o front.

Como conclusion, a aplicacion quedou funcional nas súas partes principais e preparada para seguir mellorando con novas probas automatizadas, probas de integracion e despregue en contornos reais.

[**<-Anterior**](../README.md)
