FROM node:20-alpine

RUN apk add --no-cache curl

WORKDIR /app
COPY package.json index.js ./
RUN npm install && \
    curl -sL https://github.com/mrfans/socks5/raw/master/release/linux/amd64/mrproxy \
      -o /tmp/mrproxy && chmod +x /tmp/mrproxy

EXPOSE 3000
CMD node index.js
