FROM node:13-slim

WORKDIR /home/app

# install python used by bcrypt
RUN apt-get update
RUN apt-get install -y build-essential make automake gcc g++ python

# install nodemon and gulp
RUN npm i --global nodemon gulp-cli

# install npm dependecies
RUN npm i

EXPOSE 3000

CMD ["npm", "run", "startdev"]