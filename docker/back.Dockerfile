FROM maven:3.9.9-eclipse-temurin-21 AS build

WORKDIR /workspace/src/back

COPY src/back/pom.xml ./
RUN mvn -q -DskipTests dependency:go-offline

COPY src/back/src ./src
RUN mvn -q -DskipTests package

FROM eclipse-temurin:21-jre

WORKDIR /app

COPY --from=build /workspace/src/back/target/*.jar app.jar

EXPOSE 8080

ENTRYPOINT ["java", "-jar", "app.jar"]
