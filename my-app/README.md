# Node Docker App

## Stack
- Node.js
- Express
- MongoDB
- Docker
- Docker Compose

## Build Image
docker build -t my-app:1.0 .

## Run Container
docker run -p 3000:3000 my-app:1.0

## Run Full Stack
docker compose up -d

## Stop
docker compose down -v
