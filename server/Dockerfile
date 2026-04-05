FROM node:22-alpine

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci --production=false

COPY tsconfig.json ./
COPY src/ ./src/

RUN npx tsc

ENV NODE_ENV=production
EXPOSE 3001

CMD ["node", "dist/index.js"]
