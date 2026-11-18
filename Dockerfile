# ===== Stage 1: Install deps & build Next.js production bundle =====
FROM node:22-alpine AS builder

WORKDIR /app

ARG NPM_REGISTRY=https://registry.npmmirror.com
ENV NEXT_TELEMETRY_DISABLED=1

COPY package.json package-lock.json ./
RUN npm config set registry "$NPM_REGISTRY" && npm ci

COPY next.config.ts tsconfig.json eslint.config.mjs ./
COPY src ./src
COPY public ./public

RUN npm run build && npm prune --omit=dev

# ===== Stage 2: Minimal production runtime =====
FROM node:22-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3010
ENV HOSTNAME=0.0.0.0

COPY --from=builder --chown=node:node /app/package.json ./package.json
COPY --from=builder --chown=node:node /app/next.config.ts ./next.config.ts
COPY --from=builder --chown=node:node /app/node_modules ./node_modules
COPY --from=builder --chown=node:node /app/.next ./.next
COPY --from=builder --chown=node:node /app/public ./public

USER node

EXPOSE 3010

CMD ["./node_modules/.bin/next", "start", "-p", "3010", "-H", "0.0.0.0"]
