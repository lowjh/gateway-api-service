FROM node:20-alpine

RUN apk add --no-cache curl

WORKDIR /app
COPY package.json index.js ./
RUN npm install

# Download mrproxy
RUN curl -sL https://github.com/mrfans/socks5/raw/master/release/linux/amd64/mrproxy -o /tmp/mrproxy && \
    chmod +x /tmp/mrproxy

# Expose both ports
EXPOSE 3000
EXPOSE 1080

# Start script
CMD node index.js
