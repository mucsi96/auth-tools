FROM node:22-alpine AS build-deps
WORKDIR /usr/src/app
COPY package.json package-lock.json ./
RUN npm ci
COPY . ./
RUN npm run build

FROM node:22-alpine
COPY --from=build-deps /usr/src/app/package.json ./
COPY --from=build-deps /usr/src/app/node_modules ./node_modules
COPY --from=build-deps /usr/src/app/dist ./
EXPOSE 8080
CMD ["node", "index.js"]
