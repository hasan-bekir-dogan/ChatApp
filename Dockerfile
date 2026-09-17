FROM node:22-alpine AS base
WORKDIR /app
ENV NODE_ENV=production

FROM base AS deps
COPY package.json package-lock.json ./
RUN apk add --no-cache python3 make g++ \
  && npm ci --omit=dev \
  && apk del python3 make g++

FROM base AS runtime
COPY --from=deps /app/node_modules ./node_modules
COPY . .

RUN addgroup -S chatapp && adduser -S chatapp -G chatapp \
  && mkdir -p public/uploads \
  && chown -R chatapp:chatapp /app
USER chatapp

EXPOSE 3000
CMD ["node", "server.js"]
