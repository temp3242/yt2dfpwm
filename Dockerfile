FROM node:alpine AS builder
WORKDIR /home/user/Code/ts4
COPY . .
RUN yarn install
RUN yarn build

FROM node:alpine AS final
WORKDIR /home/user/yt2dfpwm
RUN apk add  --no-cache ffmpeg
COPY --from=builder /home/user/Code/ts4/bin/* bin/
COPY package.json .
COPY yarn.lock .
RUN yarn install --production && mkdir audio
CMD ["yarn", "start"]
EXPOSE 3000