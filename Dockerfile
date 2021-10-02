FROM node:lts

VOLUME /rms-backend-node

COPY package.json ./
COPY yarn.lock ./
RUN yarn

COPY . .

EXPOSE 3000

RUN yarn build

CMD ["yarn", "start:prod"]
