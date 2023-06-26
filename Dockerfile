FROM node:alpine
WORKDIR /home/user/Code/ts4
COPY . .
RUN yarn install
RUN yarn build
RUN rm -rf node_modules
RUN yarn install --production
RUN apk add  --no-cache ffmpeg
CMD ["node", "bin/index.js"]
EXPOSE 3000
