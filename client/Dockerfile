FROM node:20-alpine
WORKDIR /app/client
RUN npm install -g serve
COPY package.json package-lock.json ./
RUN npm ci
COPY . ./
RUN yarn build

COPY test/index.html ./

EXPOSE 3000
CMD ["serve", "--single"]
