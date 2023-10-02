FROM node:18

RUN apt-get update
RUN apt-get install -y curl

WORKDIR /usr/src/etcd3test

COPY core ./core
COPY etcd3api ./etcd3api

COPY moduleAlias.mjs \
    ServerConfigurations.ts \ 
    package.json \
    package-lock.json \
    gruntfile.cjs \
    tsconfig.json ./

RUN npm install
RUN npm run build:all

EXPOSE 1234
CMD ["npm", "run", "start:etcd3api"]