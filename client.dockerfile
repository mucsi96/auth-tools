FROM node:20-alpine
ARG DEMO_API_CLIENT_ID
ENV VITE_DEMO_API_CLIENT_ID=$DEMO_API_CLIENT_ID
WORKDIR /app/client
RUN npm install -g serve

COPY client_lib/package.json client_lib/package-lock.json ./
RUN npm ci
COPY client_lib ./
RUN npm run build

COPY test/index.html ./

EXPOSE 3000
CMD ["serve", "--single"]
