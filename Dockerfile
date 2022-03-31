FROM node:14-alpine

RUN mkdir -p /home/www/word2swagger
WORKDIR /home/www/word2swagger
COPY . /home/www/word2swagger
RUN npm install --registry=https://registry.npm.taobao.org

EXPOSE 8000
COPY . /var/www/html
WORKDIR /var/www/html
ENTRYPOINT ["npm", "run"]
CMD ["mock"]