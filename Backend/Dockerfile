# ---------- Build stage ----------
FROM node:20-alpine AS builder

WORKDIR /app

# Install dependencies first (better caching)
COPY package*.json ./
RUN npm ci

# Copy source
COPY . .

# Generate Prisma Client (needed even if DB is not in container)
RUN npx prisma generate

# Build TypeScript -> dist
RUN npm run build

# ---------- Runtime stage ----------
FROM node:20-alpine AS runner

WORKDIR /app
ENV NODE_ENV=production

# ✅ Default runtime configuration
ENV PORT=3000
ENV DATABASE_URL=postgresql://postgres:aymane2002@host.docker.internal:5432/school_library

COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma

EXPOSE 3000

CMD ["node", "dist/app.js"]

