FROM node:20-alpine as build-deps
WORKDIR /usr/src/app
COPY package.json yarn.lock ./
RUN yarn --frozen-lockfile
COPY . ./
RUN yarn build

FROM node:20-alpine
COPY --from=build-deps /usr/src/app/package.json ./
COPY --from=build-deps /usr/src/app/node_modules ./node_modules
COPY --from=build-deps /usr/src/app/dist ./
EXPOSE 8080
CMD ["node", "index.js"]
