FROM node:22-alpine
WORKDIR /app

# Chromium via apk — o puppeteer-core não baixa/roda o próprio binário
# em Alpine (musl), então usamos o do sistema.
RUN apk add --no-cache chromium
ENV PUPPETEER_SKIP_DOWNLOAD=true
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser

COPY package.json package-lock.json* ./
RUN npm install --omit=dev
COPY . .
EXPOSE 3000
CMD ["node", "index.js"]
