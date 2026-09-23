# syntax=docker/dockerfile:1

FROM node:22-alpine AS base

# ---- deps: install once, cached across builds ----
FROM base AS deps
WORKDIR /app
COPY package.json package-lock.json ./
# `npm install` rather than `npm ci` — the lockfile is generated on Windows
# and can be missing Linux-specific optional native deps (Tailwind's oxide
# engine, etc.); install resolves them instead of hard-failing on the mismatch.
RUN npm install --no-audit --no-fund

# ---- builder: generate Prisma client + build the Next.js app ----
# Also doubles as the "migrator" image (see docker-compose.yml) — it has the
# full node_modules tree the Prisma CLI needs, unlike the trimmed runner
# image below, so `prisma migrate deploy` runs from here instead.
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npx prisma generate
RUN npm run build

# ---- runner: minimal production image, just serves the app ----
FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production
RUN addgroup --system --gid 1001 nodejs \
  && adduser --system --uid 1001 nextjs

# Standalone output only bundles the deps actually used at runtime.
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs
EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

CMD ["node", "server.js"]
