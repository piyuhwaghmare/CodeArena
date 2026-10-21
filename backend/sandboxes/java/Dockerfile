# Java 17 Sandbox
FROM eclipse-temurin:17-jdk-alpine

# Non-root sandbox user
RUN adduser -D sandbox_user
USER sandbox_user

WORKDIR /sandbox

CMD ["java"]
