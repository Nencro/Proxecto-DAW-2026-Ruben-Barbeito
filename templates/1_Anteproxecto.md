# Anteproxecto

- [Anteproxecto](#anteproxecto)
  - [1- Idea do proxecto](#1--idea-do-proxecto)
  - [2- Contextualización](#2--contextualización)
  - [3- Estudio de alternativas e viabilidade](#3--estudio-de-alternativas-e-viabilidade)
    - [3.1- Estudio de alternativas](#31--estudio-de-alternativas)
    - [3.2 Xustificación da alternativa](#32-xustificación-da-alternativa)
  - [4- Requirimentos técnicos](#4--requirimentos-técnicos)
  - [5- Planificación](#5--planificación)

## 1- Idea do proxecto

ExploraMas é unha plataforma web deseñada para transformar a forma en que planeamos as nosas escapadas e viaxes de longa distancia. A idea central é ofrecer ao usuario unha ferramenta planificar o  itinerario do teu viaxe e descubrir actividades locais.

## 2- Contextualización

O proxecto xorde para cubrir un oco no sector dos viaxes cunha aplicación web de xestión integral de viaxes con foco na personalización do itinerario.


## 3- Estudio de alternativas e viabilidade

### 3.1- Estudio de alternativas


| **Alternativa** | **Viabilidade técnica** | **Viabilidade económica** | **Temporalidade** | **Valoración Global** |
| :--- | :--- | :--- | :--- | :--- |
| **A1: Java Spring Boot + Angular(TypeScript)** | **Alta (7/10):** **Fortalezas**:Lenguaxe e aplicacións usadas durante o proceso das practicas. **Debilidades** Curva de aprendizaxe alta e configuración complexa. | **Media (6/10):** Hosting máis caro debido ao uso de servidores Java/VPS. | **Baixa (7/10):** Longa duración (4-6 meses). | **7/10** |
| **A2: PHP (Laravel) + Blade/JS** | **Baixa (2/10):** **Fortalezas**: Framework e linguaxe coñecidos e rapidez de execución con ferramentas integradas. **Debilidades**:Aprender un novo framework  | **Alta (8/10):** Hosting compartido moi barato (2–5 €/mes). | **Alta (8/10):** Desenvolvemento rápido (2-3 meses). | **6/10** |
| **A3: Node.js + React** | **Baixa (2/10):** **Fortalezas**:Coñecemento dos linguaxes **Debilidades**: require máis tempo para estruturar ben o proxecto dende cero e total descoñecemento. | **Alta (7/10):** Despregue en plataformas como Vercel ou Render con baixo custo. | **Media (6/10):** Duración media (3-4 meses). | **5/10** |

### 3.2 Xustificación da alternativa




- A alternativa A1 e a elexida por falta de tempo para aprender os outros linguaxes ao mesmo tempo.

## 4- Requirimentos técnicos


>
Para o desenvolvemento de **ExploraMás** baixo a arquitectura da alternativa A1, empregaremos tecnoloxías de corte empresarial que garanten robustez e escalabilidade:

* **Infraestrutura**:
    * **Servidor**: AWS debido a que ten unha capa gratuita para o primeiro ano.
    * **Base de datos**: Amazon RDS (MySQL)
    * **Almacenamento**: Amazon S3 (Simple Storage Service)
* **Backend**:
    * **Linguaxe**: Java 17.
    * **Framework**: Spring Boot.
    * **Ferramenta de construción**: Maven.
* **Frontend**:
    * **Framework**: Angular 17   con TypeScript.
    * **Linguaxe**: HTML5 e CSS3.
    * **Comunicación**: Consumo de API RESTful mediante servizos de Angular.

## 5- Planificación
Dada a elección da alternativa A1 (Java + Angular) e a necesidade de completar o proxecto en 8 semanas, seguirase unha metodoloxía de desenvolvemento áxil centrada nun MVP (Produto Mínimo Viable).

| Fase | Duración | Descrición das tarefas |
| :--- | :--- | :--- |
| **Fase 1: Definición e Setup** | Semana 1 | Requisitos mínimos, deseño da DB en MySQL e configuración de AWS (EC2/RDS). |
| **Fase 2: Backend Core** | Semanas 2-3 | Creación da API con Spring Boot (Maven), seguridade básica e conexión coa base de datos. |
| **Fase 3: Frontend Core** | Semanas 4-5 | Desenvolvemento da interface en Angular 17 e integración cos servizos do backend. |
| **Fase 4: Integración e S3** | Semana 6 | Implementación do almacenamento de imaxes en Amazon S3 e refinamento da UI. |
| **Fase 5: Probas e Debug** | Semana 7 | Probas unitarias en Java e corrección de erros na navegación de Angular. |
| **Fase 6: Despregue Final** | Semana 8 | Axuste final en AWS e posta en marcha de ExploraMás para a súa presentación. |

[**<-Anterior**](../README.md)
