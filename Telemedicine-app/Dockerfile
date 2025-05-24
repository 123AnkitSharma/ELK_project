FROM node:24-alpine3.20 AS build

WORKDIR /build
COPY package*.json ./
RUN npm install

FROM node:24-alpine3.20

WORKDIR /app
COPY --from=build /build/node_modules ./node_modules
COPY . .  
RUN npm install -g nodemon && \
    apk add --no-cache curl  

EXPOSE 5000

CMD ["nodemon", "server.js"]