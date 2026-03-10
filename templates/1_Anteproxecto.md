# Anteproxecto

- [Anteproxecto](#anteproxecto)
  - [1- Idea do proxecto](#1--idea-do-proxecto)
  - [2- Contextualización](#2--contextualización)
  - [3- Estudio de alternativas e viabilidade](#3--estudio-de-alternativas-e-viabilidade)
    - [3.1- Estudio de alternativas](#31--estudio-de-alternativas)
    - [3.2 Xustificación da alternativa](#32-xustificación-da-alternativa)
  - [4- Requirimentos técnicos](#4--requirimentos-técnicos)
  - [5- Planificación](#5--planificación)

> _EXPLICACIÓN_: Este documento será a páxina de explicación de en que consiste o teu proxecto. Coida a súa redacción con todo ou teu mimo. Elimina posteriormente todas as lineas "EXPLICACIÓN" cando creas finalizada a súa redacción.
> Podes acompañar á redacción deste ficheiro con imaxes, pero non abuses deles.
> Explica da mellor forma posible de en que consiste o proxecto é que ferramentas e linguaxes de programación empregarás.

## 1- Idea do proxecto

> _EXPLICACIÓN_: Realiza unha breve descrición do anteproxecto. Resalta o fundamental *coas túas propias palabras\*\*. Utiliza unha linguaxe correcta,*pero natural\*\*, que o entenda todo o mundo, mesmo e en especial, as persoas que non teñan un coñecemento técnico avanzado. Pode ser un estracto ou resumo de apartados que xa contemples noutros ficheiros.

## 2- Contextualización

> _EXPLICACIÓN_: Realiza unha contextualización que identifique as necesidades ás que dará resposta o proxecto.
>
> Neste apartado trátase de describir a análise realizada e a toma de decisións adoptada sobre aspectos básicos ou iniciais do proxecto como:
>
> - En que consiste o noso proxecto? Cal é o propósito principal da aplicación a desenvolver? Cales son os obxectivos?
> - O desenvolvemento da aplicación abre unha oportunidade de negocio? É posible comercializala? Como?

## 3- Estudio de alternativas e viabilidade

### 3.1- Estudio de alternativas

> _EXPLICACIÓN_: Neste apartado enumerarás unha serie de alternativas que se tiveron en conta e xustificarase a alternativa elixida, razoando o motivo de rexeitamento das outras.
> Teranse en conta os seguintes criterios de valoración para determinar a mellor alternativa:
>
> - Técnicos.
> - Económicos.
> - Temporalidade.
> - Recursos.
> ...
>
> **Exemplo**
>
> Un cliente dunha clínica odontolóxica precisa unha plataforma web para rexistrar, xestionar datos dos clientes. Analizamos tres alternativas para o desenrolo:
>
> Alternativas
>
> - A1- Desenvolvemento dende cero con API Rest java spring Boot + HTML5 + CSS3 + javascript nativo.
> - A2- Desenvolvemento desde cero con API Rest Node.js + HTML5 + CSS3 + javascript nativo.
> - A3- Desenvolvemento desde cero modelo MVC en php + HTML5 + CSS3 + javascript nativo.
> - A4- Framework larabel + React.js + Tailwind.
> 
> | **Alternativa** |  **Viabilidade técnica** | **Viabilidade económica** | **Temporalidade** | **Valoración Global** |
> | ------ | ------ |  ------ | ------ | ------ |
> | A1 | Baixa-media (4/10): contrólanse todas as tecnoloxías salvo java spring boot. Spring Boot é un framework empresarial potente, pero con una curva de aprendizaxe considerable. **Fortalezas**: Arquitectura sólida, escalabre, profesional. **Debilidades**: Curva de aprendizaxe alta, configuración complexa. | Medio (6/10): precisaríamos un hosting con soporte java e servidor de aplicacións ou ben un VPS. Custe máis elevado no hosting. O resto de SW gratuíto. | Viabilidade baixa (3/10): curva de aprendizaxe de Spring Boot. Larga duración, de 4 a 6 meses | **5/10** |
> | A2 | Media-Alta (6/10): Node permite construír APIs REST facilmente. **Fortalezas:** Simplicidade, entorno JavaScript unificado (backend e frontend). **Debilidades:** Necesidade de estruturar ben o proxecto dende cero. | Alta (8/10): Require hosting compatible con Node.js (plataformas como Render, Railway, Verceo o Fly.io) permiten despregar de forma gratuita ou de baixo custe. | Viabilidade media (6/10): duración entre 2 meses e medio e 4. | **7/10** |
> | A3 | Alta (9/10): non existe curva de aprendizaxe coas linguaxes seleccionadas. **Fortalezas:** Linguaxe coñecido, baixo limiar de entrada, execución rápida. **Debilidades:** Require implementar manualmente aspectos como seguridade, rutas y validacións. | Alta (9/10): Hosting compartido PHP/MySQL dende 2–5 €/mes. | Viabilidade alta (8/10): desenvolvemento e despregue rápido, de 2 a 3 meses.| **9/10** |
> | A4 | Media (6/10): Laravel ten unha curva de aprendizaxe intermedia. React e Tailwind requiren aprendizaxe adicional. Require coñecementos do frontend moderno. **Fortalezas:** Stack profesional, mantible e modular. **Debilidades:** Exceso de complexidade para un só desarrollador sen experiencia en frameworks front. | Alta (8/10): Ferramentas gratuitas. Laravel require hosting con Composer, PHP ≥ 8 e a miudo acceso SSH. React require build e despregue separado ou integración tipo SPA servida dende Laravel. Hosting adecuados (con SSH e Composer) entre 5-10€/mes. Posible despregue gratuíto de frontend (Vercel) y backend en hosting PHP. | Viabilidade baixa (5/10): curva de aprendizaxe e configuración elevada (4-5 meses) | **5/10** |

### 3.2 Xustificación da alternativa

>_EXPLICACIÓN_: Tras analizar os resultados seleccionamos unha alternativa. Xustifica a elección indicando as razóns da elección.
>
> **Exemplo**
>
> - A alternativa A3 (PHP MVC desde cero) se consolida como a máis viable globalmente, e polo tanto é a elexida xa que:
>
>   - É a máis económica (hosting moi barato).
>   - Ten mínima fricción técnica para o despregue.
>   - Permite obter un prototipo funcional en pouco tempo.
>   - Emprega tecnoloxías coñecidas polo alumno.
>   - Rapidez de desenvolvemento.
>
> - A2 (Node.js) poderíase considerar como unha opción moderna e máis axeitada se se dispuxera de máis tempo para implementala. Permitiría ampliar os coñecementos técnicos.
>
> - As opcións A1 (Spring Boot) e A4 (Larabel + React) resultan menos axeitadas pola súa complexidade e custo.

## 4- Requirimentos técnicos

>_EXPLICACIÓN_: - Que tecnoloxías son as máis axeitadas para a realización do proxecto?

> _EXPLICACIÓN_: Descrición dos medios materiais e das tecnoloxías necesarias que se usarán para desenvolver o proxecto incluíndo as linguaxes de programación frontend e backend, técnicas, librerías, bases de datos, servizos usados, servidores, API’s, etc.
>
> - **Infraestructura:** dominio web, hosting, servidor de base de datos, almacenamento, memoria, ...
> - **Backend:** tecnoloxías usadas.
> - **Frontend:** tecnoloxías usadas

## 5- Planificación

> _EXPLICACIÓN_: Inclúe un calendario co tempo estimado a adicar a cada fase do proxecto.
>
> O proxecto estará formado polas seguintes fases:
>
> - Estudo preliminar
> - Análise
> - Deseño
> - Codificación e probas (debe ser a fase máis longa).
>
> Debe facerse un calendario ou un diagrama de Gantt indicando, para cada fase, a data de inicio, a súa duración e breve descrición das tarefas a realizar.

[**<-Anterior**](../README.md)
