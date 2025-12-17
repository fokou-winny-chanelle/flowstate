# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY tsconfig*.json ./
COPY nx.json ./

# Install dependencies (including dev dependencies for Prisma)
RUN npm ci

# Copy Prisma schema and migrations
COPY backend/prisma ./backend/prisma
COPY backend/tsconfig*.json ./backend/
COPY backend/project.json ./backend/

# Generate Prisma Client
RUN npx prisma generate --schema=./backend/prisma/schema.prisma

# Copy all source files
COPY . .

# Build the backend application
RUN npx nx build backend --prod

# Production stage
FROM node:20-alpine

WORKDIR /app

ENV NODE_ENV=production

# Install tools for database readiness check
RUN apk add --no-cache bash netcat-openbsd

# Create non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nestjs -u 1001

# Copy built application
COPY --from=builder --chown=nestjs:nodejs /app/dist/backend ./dist
COPY --from=builder --chown=nestjs:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=nestjs:nodejs /app/package*.json ./

# Copy Prisma files for migrations
COPY --from=builder --chown=nestjs:nodejs /app/backend/prisma ./prisma
COPY --from=builder --chown=nestjs:nodejs /app/node_modules/.prisma ./node_modules/.prisma

# Copy initialization script and make it executable
COPY --chown=nestjs:nodejs backend/docker-entrypoint.sh ./docker-entrypoint.sh
RUN chmod +x ./docker-entrypoint.sh

USER nestjs

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=3s --start-period=40s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/api/health/live', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

ENTRYPOINT ["./docker-entrypoint.sh"]
CMD ["node", "dist/main.js"]

