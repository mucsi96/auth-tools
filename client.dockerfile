FROM node:20-alpine
ARG DEMO_API_CLIENT_ID
ARG TRAEFIK_CLIENT_ID
WORKDIR /app/client
RUN npm install -g serve

COPY client_lib/package.json client_lib/package-lock.json ./
RUN npm ci
COPY client_lib ./
RUN npm run build

RUN echo "window.demoApiClientId = '$DEMO_API_CLIENT_ID';" > dist/env.js 
RUN echo "window.traefikClientId = '$TRAEFIK_CLIENT_ID';" >> dist/env.js 

COPY test/index.html ./

EXPOSE 3000
CMD ["serve", "--single"]
