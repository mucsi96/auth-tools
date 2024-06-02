FROM node:20-alpine
WORKDIR /app/client
RUN npm install -g serve

COPY client_lib/package.json client_lib/package-lock.json ./
RUN npm ci
COPY client_lib ./
RUN npm run build

COPY test/index.html ./

EXPOSE 3000
CMD ["serve", "--single"]
