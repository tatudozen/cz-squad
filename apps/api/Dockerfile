# Multi-stage build
FROM node:20-alpine AS builder

WORKDIR /app

# Copy workspace root files
COPY package*.json ./
COPY tsconfig.json ./
COPY apps/api ./apps/api
COPY packages/shared ./packages/shared

# Install dependencies
RUN npm ci

# Build
RUN npm run build

# Runtime
FROM node:20-alpine

WORKDIR /app

# Install dumb-init for proper signal handling
RUN apk add --no-cache dumb-init

# Copy package files
COPY package*.json ./

# Copy built artifacts
COPY --from=builder /app/apps/api/dist/apps/api/src ./dist
COPY --from=builder /app/apps/api/dist/packages/shared/src ./node_modules/@copyzen/shared

# Install production dependencies only
RUN npm ci --omit=dev

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/health', (r) => {if (r.statusCode !== 200) throw new Error(r.statusCode)})"

EXPOSE 3000

ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "dist/index.js"]
