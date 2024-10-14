FROM maven:3-eclipse-temurin-22 as build
WORKDIR /workspace/server_lib

COPY server_lib/pom.xml .
COPY server_lib/src src

RUN mvn install -DskipTests -B -Dorg.slf4j.simpleLogger.log.org.apache.maven.cli.transfer.Slf4jMavenTransferListener=warn

WORKDIR /workspace/server

COPY server/pom.xml .
COPY server/src src

RUN mvn package -DskipTests -B -Dorg.slf4j.simpleLogger.log.org.apache.maven.cli.transfer.Slf4jMavenTransferListener=warn
RUN mkdir -p target/dependency && (cd target/dependency; jar -xf ../*.jar)


FROM bellsoft/liberica-openjre-alpine-musl:23

RUN apk --no-cache add bash curl

VOLUME /tmp

ARG DEPENDENCY=/workspace/server/target/dependency

COPY --from=build ${DEPENDENCY}/BOOT-INF/lib /server/lib
COPY --from=build ${DEPENDENCY}/META-INF /server/META-INF
COPY --from=build ${DEPENDENCY}/BOOT-INF/classes /server

ENTRYPOINT ["java", "-classpath", "server:server/lib/*", "-Dspring.profiles.active=prod", "io.github.mucsi96.demo.Application"]