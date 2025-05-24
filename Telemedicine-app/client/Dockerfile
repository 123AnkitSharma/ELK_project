# Build stage for dependencies
FROM node:24-alpine3.20 AS build

WORKDIR /build
COPY package*.json ./
RUN npm install

# Development stage
FROM node:24-alpine3.20

WORKDIR /app
COPY --from=build /build/node_modules ./node_modules
COPY . .

EXPOSE 3000

CMD ["npm", "start"]