FROM node:6
RUN mkdir /financesbot
ADD . /financesbot
WORKDIR /financesbot
RUN npm install
EXPOSE 80
CMD ["npm", "start"]