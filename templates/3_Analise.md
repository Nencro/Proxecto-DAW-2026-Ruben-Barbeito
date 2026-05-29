# Requirimentos do sistema - ExploraMas

## 1- Descricion xeral

ExploraMas e unha aplicacion web de planificacion de viaxes. A plataforma permite consultar experiencias turisticas, buscar voos, crear viaxes persoais, organizar actividades por dias e xestionar participantes.

A aplicacion esta pensada para tres tipos principais de usuarios: visitantes sen conta, usuarios rexistrados e usuarios con rol de empresa ou administracion. Cada tipo de usuario ten permisos diferentes segundo a accion que queira realizar.

O obxectivo principal e centralizar a organizacion dunha viaxe nunha soa ferramenta: destino, datas, custo do billete, actividades, experiencias e participantes.

## 2- Funcionalidades

| Funcionalidade | Autor / usuario | Datos de entrada | Datos de saida / resultado |
|---|---|---|---|
| Rexistro de usuario | Usuario anonimo | Username, nome, apelidos, email e password | Conta creada, usuario gardado na base de datos e rol base `USUARIO` asignado |
| Inicio de sesion | Usuario rexistrado | Username ou email e password | Token de autenticacion e datos basicos do usuario autenticado |
| Peche de sesion | Usuario rexistrado | Accion de pechar sesion | Eliminacion do token no cliente e volta ao estado de usuario anonimo |
| Consulta de perfil propio | Usuario rexistrado | Token de autenticacion | Datos persoais do usuario: username, nome, apelidos, email, telefono, pais e roles |
| Edicion de perfil | Usuario rexistrado | Nome, apelidos, telefono e pais | Perfil actualizado e datos modificados gardados |
| Consulta de experiencias | Usuario anonimo ou rexistrado | Filtros opcionais por nome, localidade ou pais | Listaxe de experiencias dispoñibles |
| Creacion de experiencias | Usuario con rol `EMPRESA` ou `ADMIN` | Nome, localidade, pais, descricion, tamaño do grupo, duracion, prezo e imaxe opcional | Nova experiencia creada e asociada ao usuario creador |
| Edicion de experiencias | Creador da experiencia ou administrador | Identificador da experiencia e novos datos | Experiencia actualizada |
| Eliminacion de experiencias | Creador da experiencia ou administrador | Identificador da experiencia | Experiencia eliminada da base de datos |
| Busca de voos | Usuario anonimo ou rexistrado | Orixe, destino, data de ida, data de volta e numero de pasaxeiros | Listaxe de ofertas de voo obtidas desde o provedor externo |
| Creacion de viaxe | Usuario rexistrado | Destino, pais, data de inicio, data de fin e custo do billete | Viaxe creada e asociada ao usuario como creador |
| Consulta de viaxes propias | Usuario rexistrado | Token de autenticacion | Listaxe de viaxes nas que participa ou que creou |
| Consulta de detalle dunha viaxe | Creador ou participante da viaxe | Identificador da viaxe | Datos da viaxe, destino, datas, custo do billete, participantes e itinerario |
| Xestion de viaxe | Usuario creador da viaxe | Novas datas, custo do billete, actividades, participantes ou ligazons de invitacion | Viaxe actualizada, participantes modificados ou invitacion xerada |
| Engadir actividades a unha viaxe | Creador da viaxe | Dia, hora, descricion e custo da actividade | Actividade engadida ao itinerario e custo total recalculado |
| Engadir experiencia a unha viaxe | Usuario participante ou creador, segundo permisos da viaxe | Identificador da experiencia e identificador da viaxe compatible | Experiencia incorporada ao itinerario ou usada como actividade planificada |
| Engadir voo a unha viaxe | Usuario rexistrado con viaxe compatible | Oferta de voo seleccionada e viaxe de destino | Custo do billete actualizado na viaxe |
| Borrado de viaxe | Usuario creador da viaxe | Identificador da viaxe e confirmacion na modal | Viaxe eliminada e redireccion a `/travels` |
| Xestion de participantes | Usuario creador da viaxe | Usuario participante ou ligazon de invitacion | Participante engadido ou eliminado da viaxe |
| Saida dunha viaxe | Usuario participante non creador | Identificador da viaxe | O usuario deixa de participar na viaxe |
| Xestion de roles | Administrador | Username do usuario e roles que se queren engadir ou eliminar | Roles actualizados, mantendo sempre o rol base `USUARIO` |
| Consulta de usuarios desde administracion | Administrador | Username do usuario buscado | Perfil administrativo con datos e roles do usuario |

### 2.1- Xestion das viaxes

As viaxes son creadas por usuarios rexistrados. O usuario que crea unha viaxe queda rexistrado como creador e e quen pode xestionala.

O creador dunha viaxe pode:

- Modificar as datas da viaxe.
- Actualizar o custo do billete.
- Engadir, editar ou eliminar actividades do itinerario.
- Xerar ligazons de invitacion.
- Xestionar os participantes.
- Eliminar a viaxe despois de confirmar a accion nunha modal.

Os participantes dunha viaxe poden consultar o detalle da viaxe e abandonar a viaxe se non son os creadores. Un usuario moderador ou administrador non debe borrar viaxes alleas polo feito de ter permisos elevados; so pode borrar a viaxe se e o seu propio creador ou se existe unha regra explicita de administracion para ese caso.

## 3- Tipos de usuarios

| Tipo de usuario | Descricion | Permisos principais |
|---|---|---|
| Usuario anonimo | Persoa que accede sen iniciar sesion | Consultar informacion publica, experiencias e buscador de voos; acceder ao rexistro e ao login |
| Usuario rexistrado | Persoa con conta validada na aplicacion | Crear e xestionar as suas viaxes, editar o seu perfil, consultar experiencias, engadir voos ou experiencias a viaxes compatibles |
| Usuario empresa | Usuario rexistrado con rol `EMPRESA` | Crear, editar e eliminar as experiencias que publicou, ademais das accions dun usuario rexistrado |
| Administrador | Usuario con rol `ADMIN` | Consultar usuarios, xestionar roles e administrar contido cando proceda |

## 4- Contorno operacional

Para utilizar ExploraMas e necesario:

- Navegador web actualizado, como Chrome, Firefox ou Edge.
- Conexion a internet.
- Dispositivo con acceso web: ordenador, tablet ou mobil.

Para a parte servidora son necesarios:

- Backend Spring Boot.
- Base de datos MySQL ou compatible.
- Conexion co provedor externo Duffel para a busca de voos.
- Servizo externo de paises para autocompletado e datos de paises.

## 5- Normativa

ExploraMas debe cumprir coa normativa aplicable en materia de proteccion de datos e informacion ao usuario:

- GDPR ou RGPD, Regulamento Xeral de Proteccion de Datos da Union Europea.
- LOPDGDD, Lei Organica de Proteccion de Datos Persoais e garantia dos dereitos dixitais.
- LSSI-CE, Lei de servizos da sociedade da informacion e comercio electronico, no relativo a aviso legal, cookies e informacion identificativa.

A web debe incluír paxinas ou apartados visibles de:

- Aviso legal.
- Politica de privacidade.
- Politica de cookies.
- Termos de uso, se se queren regular as condicions de uso da plataforma.

### 5.1- Exemplo de aviso legal para a web

Texto orientativo para a paxina de aviso legal:

```text
Este sitio web pertence ao proxecto ExploraMas, unha aplicacion desenvolvida con finalidade academica para a planificacion de viaxes. O acceso e uso da web implica a aceptacion das presentes condicions. As persoas usuarias comprométense a empregar a plataforma de forma correcta, sen realizar accion algunha que poida danar o funcionamento do servizo, a seguridade da aplicacion ou os datos doutras persoas.
```

### 5.2- Exemplo de politica de privacidade

Texto orientativo para a paxina de privacidade:

```text
ExploraMas tratara os datos persoais proporcionados polas persoas usuarias coa finalidade de permitir o rexistro, o inicio de sesion, a xestion do perfil, a creacion de viaxes, a participacion en viaxes compartidas e a xestion de experiencias. Os datos tratados poden incluir nome de usuario, nome, apelidos, email, telefono, pais, roles e informacion relacionada coas viaxes creadas ou compartidas.

A persoa usuaria pode solicitar o acceso, rectificacion ou eliminacion dos seus datos persoais segundo a normativa vixente de proteccion de datos. Os datos non se cederan a terceiros agas obriga legal ou servizos necesarios para o funcionamento tecnico da aplicacion.
```

### 5.3- Exemplo de politica de cookies

Texto orientativo para a paxina de cookies:

```text
ExploraMas pode utilizar cookies tecnicas ou mecanismos equivalentes necesarios para manter a sesion da persoa usuaria e garantir o funcionamento correcto da aplicacion. Estas cookies non teñen finalidade publicitaria. Se no futuro se incorporan cookies analiticas ou de terceiros, informarase previamente e solicitarase o consentimento correspondente cando sexa necesario.
```

### 5.4- Medidas de seguridade previstas

- As contrasinais gardaranse cifradas con BCrypt.
- A autenticacion realizase mediante token.
- Os tokens, passwords e claves de API non deben subirse ao repositorio.
- O backend debe limitar as orixes permitidas mediante `CORS_ALLOWED_ORIGINS`.
- As comunicacions en producion deben realizarse mediante HTTPS.
- Os datos de acceso a Duffel e a base de datos deben almacenarse en ficheiros `.env` ou variables de contorno.

## 6- Melloras futuras

- Aplicacion mobil.
- Sistema de valoracions e opinions.
- Integracion con mais provedores de voos e experiencias.
- Suxestion de viaxes personalizadas.
- Panel de administracion mais completo.
- Sistema de notificacion para invitacions, cambios de viaxe e actividades.
- Exportacion do itinerario da viaxe a PDF ou calendario.

[**<-Anterior**](../README.md)
