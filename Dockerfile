FROM node:lts

VOLUME /rms-backend-node

COPY package.json ./
COPY yarn.lock ./
RUN yarn
RUN yarn global add pm2

COPY . .

EXPOSE 3000

RUN yarn build

CMD ["pm2-runtime", "start", "ecosystem.config.js"]
