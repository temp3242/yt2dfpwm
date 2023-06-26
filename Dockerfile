FROM node:alpine
WORKDIR /home/user/Code/ts4
COPY . .
RUN yarn install --production
RUN apk add  --no-cache ffmpeg
CMD ["node", "bin/index.js"]
EXPOSE 3000
