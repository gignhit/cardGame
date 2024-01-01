FROM node:18-alpine

COPY ./backend ./

RUN npm install &&\
    npm install -g typescript &&\
    npm install -g ts-node

CMD ["ts-node", "./index.ts"]
