FROM node:latest

RUN apt update

RUN apt install -y inkscape fonts-noto-core

WORKDIR /app

# RUN npm install
RUN npm install -g nodemon

ENTRYPOINT ["nodemon", "/app/src/server.js"]
# ENTRYPOINT ["node", "/app/src/server.js"]
