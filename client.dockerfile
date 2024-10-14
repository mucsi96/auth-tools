FROM node:22-alpine

ARG DEMO_API_CLIENT_ID
ARG MOCK_AUTH_SERVICE

ENV VITE_DEMO_API_CLIENT_ID=$DEMO_API_CLIENT_ID
ENV VITE_MOCK_AUTH_SERVICE=$MOCK_AUTH_SERVICE

RUN npm install -g serve

WORKDIR /app/client_lib

COPY client_lib/package.json client_lib/package-lock.json ./
RUN npm ci
COPY client_lib ./
RUN npm run build
RUN npm pack

WORKDIR /app/client

COPY client/package.json client/package-lock.json ./
RUN npm ci
COPY client ./
RUN npm install /app/client_lib/mucsi96-auth-tools-1.0.0.tgz
RUN npm run build

EXPOSE 3000
CMD ["serve", "--single", "dist"]
