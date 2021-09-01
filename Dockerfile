FROM node:10.19.0 AS builder

WORKDIR /usr/src/app

COPY package.json ./

RUN apt-get install gcc g++

RUN npm run install-dev && npm run build

COPY . .

RUN npm run build

############

FROM node:10.19.0

LABEL version="1.0"
LABEL description="This is the base docker image for Sport Legends react app."
LABEL maintainer = ["raelix@hotmail.it"]

WORKDIR /usr/src/app

COPY package.json ./

RUN npm run install-prod

COPY --from=builder /usr/src/app/build .

EXPOSE 8081

CMD [ "npm", "run", "static" ]
