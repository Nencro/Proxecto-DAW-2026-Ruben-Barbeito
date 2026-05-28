# 1- Empresa

- [1- Empresa](#1--empresa)
  - [1.1- Idea de negocio](#11--idea-de-negocio)
  - [1.2- Xustificación da idea](#12--xustificación-da-idea)
    - [DAFO](#dafo)
  - [1.3- Segmento de clientes](#13--segmento-de-clientes)
  - [1.4- Competencia](#14--competencia)
  - [1.5- Proposta de valor](#15--proposta-de-valor)
  - [1.6- Forma xurídica](#16--forma-xurídica)
  - [1.7- Investimentos](#17--investimentos)
    - [1.7.1- Custos](#171--custos)
      - [Custos fixos](#custos-fixos)
      - [Custos variables](#custos-variables)
      - [Resumo de custos](#resumo-de-custos)
    - [1.7.2- Ingresos](#172--ingresos)
      - [Previsión de ingresos inicial](#previsión-de-ingresos-inicial)
  - [1.8- Viabilidade](#18--viabilidade)
    - [1.8.1- Viabilidade técnica](#181--viabilidade-técnica)
    - [1.8.2 - Viabilidade económica](#182---viabilidade-económica)
    - [1.8.3- Conclusión](#183--conclusión)

## 1.1- Idea de negocio

A idea de negocio consiste no desenvolvemento dunha aplicación web orientada á organización de viaxes e itinerarios personalizados. A aplicación non realiza reservas directas de voos, hoteis ou outros servizos turísticos, senón que permite ao usuario planificar e organizar a súa viaxe nun único lugar.

O desenvolvemento realizarase empregando Visual Studio Code como contorno de traballo, Angular para a parte visual da aplicación e Java Spring Boot para a parte de servidor, lóxica de negocio e conexión coa base de datos.

O produto central da aplicación é a creación e xestión de itinerarios. O usuario poderá engadir destinos, datas, actividades, horarios e recordatorios para estruturar mellor a súa viaxe. Ademais, a aplicación poderá incorporar unha funcionalidade de busca de voos, que permitirá consultar opcións dispoñibles, aínda que a reserva final deberá realizarse en plataformas externas.

A aplicación non inclúe busca nin reserva de hoteis. O seu punto máis importante é a organización do itinerario, facilitando que o usuario poida visualizar de forma clara que fará en cada momento da viaxe.

Como produto aumentado, a aplicación contará cun apartado de experiencias predefinidas. Estas experiencias serán plans ou actividades xa creadas, como rutas culturais, visitas a monumentos, excursións, plans gastronómicos ou actividades de lecer, que o usuario poderá engadir directamente á súa viaxe.

O valor engadido principal é a facilidade para organizar unha viaxe completa de maneira clara, sinxela e visual, reducindo a desorganización que pode xurdir ao empregar varias aplicacións ou ferramentas diferentes.

## 1.2- Xustificación da idea

A idea xorde da necesidade de mellorar a organización persoal das viaxes. Moitas persoas preparan os seus desprazamentos utilizando diferentes ferramentas: buscadores de voos, mapas, calendarios ou aplicacións de mensaxería. Isto pode provocar desorganización, dificultade para consultar rapidamente o plan da viaxe e falta dunha visión global do itinerario.

O obxectivo do proxecto é crear unha aplicación centrada na planificación e organización de itinerarios. Non se pretende competir directamente coas plataformas de reservas, xa que a aplicación non realizará reservas nin de voos nin de hoteis nun inicio. A súa finalidade será complementar o proceso de viaxe, axudando ao usuario a estruturar mellor as súas actividades, desprazamentos e experiencias.

As necesidades que se pretenden cubrir son:

| Necesidade detectada | Solución proposta pola aplicación |
|---|---|
| Organizar a planificación da viaxe nun único lugar | Creación dun itinerario completo con datas, horarios e actividades |
| Mellorar a distribución do tempo durante a viaxe | Planificación por días e franxas horarias |
| Consultar opcións de voo | Funcionalidade de busca de voos, sen realizar reservas |
| Descubrir plans ou actividades | Apartado de experiencias predefinidas que se poden engadir ao itinerario |
| Reducir a dependencia de varias ferramentas | Centralización da planificación principal da viaxe |

Na actualidade existen aplicacións e plataformas relacionadas co turismo, pero moitas están centradas principalmente na reserva de voos, hoteis ou actividades. Neste caso, a proposta céntrase na organización do itinerario e na incorporación de experiencias predefinidas, deixando as reservas en mans de plataformas externas.

### DAFO

| Fortalezas | Debilidades |
|---|---|
| Aplicación centrada na organización de itinerarios | Non permite realizar reservas directamente |
| Interface sinxela e enfocada á planificación | Non inclúe busca nin reserva de hoteis |
| Apartado de experiencias predefinidas | Posibilidade de engadir plans ao itinerario facilmente | Dependencia de servizos externos para a busca de voos |

| Oportunidades | Ameazas |
|---|---|
| Crecemento do turismo organizado por conta propia | Competencia de grandes plataformas turísticas |
| Usuarios que buscan ferramentas simples de planificación | Aplicacións xa consolidadas no mercado |
| Posibilidade de colaboración con empresas de experiencias turísticas | Cambios nas APIs ou servizos externos de voos |
| Mercado amplo: viaxeiros individuais, parellas e grupos | Dificultade para monetizar sen versión premium |

## 1.3- Segmento de clientes

A aplicación está dirixida a persoas que organizan as súas propias viaxes e necesitan unha ferramenta clara para planificar o itinerario.

| Segmento | Características principais | Necesidade |
|---|---|---|
| Viaxeiros individuais | Persoas que preparan viaxes pola súa conta | Organizar destinos, actividades e horarios |
| Parellas | Usuarios que planifican escapadas ou vacacións | Consultar e modificar o itinerario da viaxe |
| Grupos de amigos | Viaxes con varias persoas e diferentes actividades | Coordinar plans e horarios |
| Estudantes | Persoas novas que viaxan con orzamento limitado | Planificar viaxes de forma sinxela |
| Viaxeiros ocasionais | Persoas que non viaxan con frecuencia | Ter unha ferramenta fácil para organizar a viaxe |

Neste proxecto, o usuario é a persoa que emprega a aplicación para organizar a súa viaxe. Como non existe versión premium, os clientes principais poderían ser empresas do sector turístico interesadas en aparecer na aplicación mediante publicidade, experiencias patrocinadas ou colaboracións comerciais.

## 1.4- Competencia

Existen diferentes aplicacións e servizos relacionados coa planificación de viaxes. Porén, moitos deles están enfocados principalmente á reserva ou comparación de prezos, mentres que esta aplicación se centra na organización do itinerario.

| Competidor | Servizo principal | Diferenza coa nosa proposta |
|---|---|---|
| Google Travel | Organización básica de viaxes e información asociada á conta de Google | Menor enfoque na creación manual e visual do itinerario |
| Skyscanner | Busca e comparación de voos | Non está centrado na organización completa da viaxe |
| Booking | Reserva de aloxamentos e outros servizos | A nosa app non busca nin reserva hoteis |
| TripIt | Organización de plans de viaxe | Pode resultar máis orientada a viaxeiros frecuentes ou profesionais |
| Notion / Google Docs | Organización manual da información | Non están deseñadas especificamente para viaxes |

## 1.5- Proposta de valor

A proposta de valor da aplicación baséase en ofrecer unha ferramenta sinxela, visual e práctica para organizar itinerarios de viaxe.

A diferenza fronte aos competidores é que a aplicación non pretende ser unha plataforma de reservas, senón unha solución especializada na planificación. O usuario poderá consultar voos, pero a función máis importante será construír, editar e consultar o itinerario da súa viaxe.

Ademais, o apartado de experiencias predefinidas permite ao usuario engadir plans xa preparados ao seu itinerario, facilitando a organización da viaxe sen ter que buscar todas as actividades desde cero.

| Aspecto | Valor aportado |
|---|---|
| Organización centralizada | Toda a planificación da viaxe nunha soa aplicación |
| Itinerario claro | Planificación por días, horarios e actividades |
| Busca de voos | Consulta de voos dispoñibles sen reservar desde a app |
| Experiencias predefinidas | Plans e actividades listos para engadir á viaxe |
| Simplicidade | Interface pensada para usuarios sen coñecementos técnicos |
| Flexibilidade | Posibilidade de modificar plans facilmente |
| Utilidade durante a viaxe | Consulta rápida de horarios e actividades |

Os usuarios empregarán esta aplicación porque lles permite ter unha visión clara da súa viaxe, reducir a desorganización e engadir experiencias de forma rápida ao seu itinerario.

## 1.6- Forma xurídica

A forma xurídica escollida será a de empresario individual/autónomo durante a fase inicial do proxecto. Esta opción é adecuada porque permite iniciar a actividade cun menor custo administrativo e cunha xestión máis sinxela.

No caso de que o proxecto medre, aumente o número de usuarios ou se incorporen socios e investidores, poderíase valorar a creación dunha Sociedade Limitada, xa que ofrece maior protección patrimonial e unha estrutura máis profesional.

## 1.7- Investimentos

Para poñer en marcha o proxecto será necesario realizar unha serie de investimentos iniciais relacionados co desenvolvemento da aplicación, a infraestrutura dixital, o deseño e a promoción.

| Investimento | Descrición | Importe estimado |
|---|---|---:|
| Equipo informático | Ordenador para desenvolvemento e probas | 1.200 € |
| Dominio web | Compra do dominio da aplicación | 20 € |
| Aloxamento / servidor | Servidor inicial para despregar a aplicación | 150 € |
| Licenzas de software | Ferramentas de deseño, desenvolvemento ou produtividade | 150 € |
| Configuración do contorno de desenvolvemento | Preparación de Visual Studio Code, Angular e Java Spring Boot | 0 € |
| Deseño UI/UX | Deseño inicial da interface da aplicación | 500 € |
| Marketing inicial | Publicidade en redes sociais e promoción | 600 € |
| Rexistro de marca / trámites | Custos administrativos iniciais | 200 € |
| Fondo para imprevistos | Pequenos gastos non previstos | 300 € |
| **Total investimento inicial** |  | **3.120 €** |

### 1.7.1- Custos

Os custos do proxecto divídense en custos fixos e custos variables. Os custos fixos son aqueles que se manteñen independentemente do número de usuarios, mentres que os variables poden aumentar segundo o uso da aplicación.

#### Custos fixos

| Concepto | Descrición | Custo mensual | Duración | Total |
|---|---|---:|---:|---:|
| Soldo desenvolvedor junior | Desenvolvemento inicial da aplicación | 1.200 € | 3 meses | 3.600 € |
| Cota de autónomo | Cotización á Seguridade Social | 230 € | 3 meses | 690 € |
| Servidor / hosting | Aloxamento da aplicación | 50 € | 3 meses | 150 € |
| Dominio | Dominio web anual | 20 € | 1 ano | 20 € |
| Software e ferramentas | Licenzas de desenvolvemento e deseño. Visual Studio Code, Angular e Spring Boot non teñen custo de licenza | 50 € | 3 meses | 150 € |
| Marketing inicial | Publicidade dixital | 200 € | 3 meses | 600 € |
| Xestoría / asesoramento | Apoio fiscal e administrativo | 60 € | 3 meses | 180 € |
| **Total custos fixos iniciais** |  |  |  | **5.390 €** |

#### Custos variables

| Concepto | Descrición | Custo estimado |
|---|---|---:|
| Consumo adicional de servidor | Aumento de usuarios e tráfico | 100 € |
| Servizos externos / API de voos | Consultas a servizos de información de voos | 300 € |
| Soporte e mantemento puntual | Correccións ou melloras específicas | 200 € |
| **Total custos variables estimados** |  | **600 €** |

#### Resumo de custos

| Tipo de custo | Importe |
|---|---:|
| Investimento inicial | 3.120 € |
| Custos fixos iniciais | 5.390 € |
| Custos variables estimados | 600 € |
| **Total estimado do proxecto** | **9.110 €** |

### 1.7.2- Ingresos

A aplicación non contará cunha versión premium. Polo tanto, o modelo de ingresos estará baseado principalmente en publicidade non intrusiva, experiencias patrocinadas e colaboracións comerciais con empresas relacionadas co sector turístico.

Estas colaboracións poderían realizarse con empresas de experiencias, actividades turísticas, visitas guiadas, museos, transporte local ou servizos complementarios. A aplicación podería destacar certas experiencias predefinidas patrocinadas, sempre mantendo unha boa experiencia de usuario.

| Fonte de ingresos | Descrición | Ingresos estimados |
|---|---|---:|
| Publicidade non intrusiva | Anuncios relacionados con viaxes ou turismo | Variable |
| Experiencias patrocinadas | Empresas pagan por destacar experiencias dentro da app | Variable |
| Colaboracións comerciais | Promoción de servizos turísticos externos | Variable |
| Afiliación | Comisión por redirixir usuarios a servizos externos, se procede | Variable |

#### Previsión de ingresos inicial

| Mes | Usuarios activos estimados | Ingreso medio por usuario | Ingresos estimados |
|---|---:|---:|---:|
| Mes 1 | 500 | 0,10 € | 50 € |
| Mes 2 | 1.000 | 0,10 € | 100 € |
| Mes 3 | 2.000 | 0,12 € | 240 € |
| Mes 4 | 3.500 | 0,12 € | 420 € |
| Mes 5 | 5.000 | 0,15 € | 750 € |
| Mes 6 | 7.500 | 0,15 € | 1.125 € |
| **Total 6 meses** |  |  | **2.685 €** |

## 1.8- Viabilidade

### 1.8.1- Viabilidade técnica

O proxecto é tecnicamente viable, xa que se desenvolverá empregando tecnoloxías coñecidas, accesibles e adecuadas para unha aplicación web moderna. O contorno principal de desenvolvemento será Visual Studio Code, que permite traballar tanto co frontend como co backend de maneira cómoda e organizada.

A parte visual da aplicación desenvolverase con Angular. Esta tecnoloxía permite crear unha interface dinámica, organizada por compoñentes e axeitada para unha aplicación de itinerarios, onde o usuario poderá consultar viaxes, engadir actividades, modificar horarios e incorporar experiencias predefinidas.

A parte de servidor desenvolverase con Java Spring Boot. Esta tecnoloxía empregarase para xestionar a lóxica de negocio, os usuarios, os itinerarios, as experiencias predefinidas e a comunicación coa base de datos. Tamén facilitará a creación dunha API que conectará o backend coa interface feita en Angular.

Non existe un impedimento técnico relevante que impida desenvolver a aplicación. A principal dificultade podería estar na integración con APIs externas para a busca de voos, xa que algunhas poden ter limitacións, custos ou condicións de uso. Con todo, como a aplicación non realiza reservas, a complexidade técnica e legal é menor que a dunha plataforma turística completa.

| Recurso necesario | Ferramenta ou tecnoloxía | Función dentro do proxecto |
|---|---|---|
| Contorno de desenvolvemento | Visual Studio Code | Programar e organizar o código da aplicación |
| Frontend | Angular | Crear a interface visual e interactiva do usuario |
| Backend | Java Spring Boot | Xestionar a lóxica, os datos e a API da aplicación |
| Base de datos | Base de datos relacional | Gardar usuarios, viaxes, itinerarios e experiencias |
| Servidor / hosting | Servizo cloud ou servidor web | Despregar a aplicación para que poida ser utilizada |
| API de voos | Servizo externo | Consultar voos dispoñibles sen realizar reservas |

| Recurso necesario | Dispoñibilidade | Observación |
|---|---|---|
| Desenvolvedor junior | Dispoñible | Encargado do desenvolvemento inicial |
| Equipo informático | Dispoñible mediante investimento | Necesario para programar e probar |
| Visual Studio Code | Dispoñible gratuitamente | Contorno de desenvolvemento principal |
| Angular | Dispoñible gratuitamente | Framework para desenvolver o frontend |
| Java Spring Boot | Dispoñible gratuitamente | Framework para desenvolver o backend |
| Servidor | Dispoñible | Pode contratarse en servizos cloud |
| API de voos | Dispoñible con condicións | Só para busca, non para reserva |
| Deseño UI/UX | Viable | Pode realizarse con ferramentas actuais |

### 1.8.2 - Viabilidade económica

A viabilidade económica dependerá principalmente da capacidade da aplicación para captar usuarios activos e xerar ingresos mediante publicidade, experiencias patrocinadas e colaboracións comerciais.

O investimento inicial estimado é de 9.110 €, incluíndo desenvolvemento, infraestrutura, marketing, custos administrativos e salario dun desenvolvedor junior durante 3 meses.

| Concepto | Importe |
|---|---:|
| Total custos iniciais estimados | 9.110 € |
| Ingresos estimados nos primeiros 6 meses | 2.685 € |
| Resultado estimado inicial | -6.425 € |

Durante os primeiros meses é probable que o proxecto presente perdas, xa que haberá que asumir os custos de desenvolvemento antes de conseguir unha base ampla de usuarios e acordos comerciais. Ao non existir versión premium, a rendibilidade dependerá máis do volume de usuarios activos e da capacidade para establecer colaboracións con empresas do sector turístico.

Tamén se poderían buscar vías de financiamento complementarias, como subvencións para emprendemento, axudas á dixitalización, programas para novos autónomos ou financiamento propio.

### 1.8.3- Conclusión


O proxecto considérase viable desde o punto de vista técnico, xa que os recursos necesarios son accesibles e non existen impedimentos importantes para desenvolver unha aplicación centrada na organización de itinerarios.

Desde o punto de vista económico, o proxecto require un investimento inicial moderado e podería non xerar beneficios nos primeiros meses. Ao non contar cunha versión premium, será necesario conseguir unha base significativa de usuarios activos e desenvolver acordos comerciais con empresas relacionadas co turismo e coas experiencias.

A principal vantaxe da aplicación é que non pretende competir directamente coas grandes plataformas de reservas, senón ofrecer unha solución complementaria centrada na organización da viaxe. A súa proposta de valor baséase na planificación clara, sinxela e centralizada dos itinerarios, xunto coa posibilidade de engadir experiencias predefinidas.

Polo tanto, o proxecto é viable, aínda que será necesario controlar os custos iniciais, mellorar progresivamente a aplicación, captar usuarios e buscar colaboracións comerciais que permitan monetizar o servizo sen depender dunha versión premium.

[**<-Anterior**](../README.md)
