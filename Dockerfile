FROM node:13-alpine

WORKDIR /home/app
RUN npm i --global nodemon gulp-cli
RUN npm install

EXPOSE 3000

CMD ["npm", "start"]