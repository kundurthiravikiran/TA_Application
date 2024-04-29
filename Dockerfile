FROM node:18.17.1
WORKDIR /usr/src/app1
# COPY package*.json ./
COPY . .
RUN npm install -g npm@10.2.4
RUN npm install
WORKDIR /usr/src/app1/Frontend
RUN npm install
RUN npm run build
WORKDIR /usr/src/app1
EXPOSE 3000

CMD ["node", "app.js"]
