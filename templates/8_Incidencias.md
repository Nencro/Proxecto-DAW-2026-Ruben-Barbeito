# INCIDENCIAS E TAREFAS
- [INCIDENCIAS E TAREFAS](#incidencias-e-tarefas)
  - [1- Incidencias](#1--incidencias)
  - [2- Tarefas](#2--tarefas)

## 1- Incidencias

| Incidencia | Causa | Solucion | Estado |
|---|---|---|---|
| Problemas cos `pattern` dos formularios en Firefox. | Algúns atributos `pattern` dos inputs non eran interpretados correctamente por Firefox, que mostraba avisos indicando que a expresión regular non era válida. | Revisáronse os patróns dos formularios e axustáronse para que fosen compatibles cos navegadores principais. Tamén se mellorou a validación no lado cliente para mostrar os erros de forma máis clara. | Pechada |
| Problemas de conexión entre Amplify e o backend de EC2 por HTTPS. | AWS Amplify serve o frontend mediante HTTPS, polo que o navegador bloqueaba chamadas ao backend se este estaba exposto só por HTTP. | Configurouse o backend en EC2 detrás de Nginx e engadiuse un certificado HTTPS para o dominio da API, permitindo que o frontend de Amplify chamase correctamente ao backend. | Pechada |

## 2- Tarefas

[**<-Anterior**](../../README.md)
