FROM node:10.15.3-alpine

RUN mkdir -p /var/www
RUN mkdir -p /var/www/logs
WORKDIR /var/www
EXPOSE 3003

RUN npm install
CMD [ "npm", "run", "start:dev" ]