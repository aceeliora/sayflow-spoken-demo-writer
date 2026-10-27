FROM node:22-alpine

ENV NODE_ENV=production
WORKDIR /app

RUN corepack enable && corepack prepare pnpm@11.25.0 --activate
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --prod --frozen-lockfile

COPY server.js ./server.js
COPY public ./public

EXPOSE 3000
CMD ["node", "server.js"]
