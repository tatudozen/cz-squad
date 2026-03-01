# Multi-stage build
FROM node:20-alpine AS builder

WORKDIR /app

# Copy workspace root files
COPY package*.json ./
COPY tsconfig.json ./
COPY apps/api ./apps/api
COPY apps/pages ./apps/pages
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

# Copy package files and workspace structure
COPY package*.json ./
COPY apps/api/package*.json ./apps/api/
COPY packages/shared/package*.json ./packages/shared/

# Copy package files for npm install
COPY package*.json ./
COPY apps/api/package*.json ./apps/api/
COPY packages/shared/package*.json ./packages/shared/

# Copy production node_modules (dependencies only)
COPY --from=builder /app/node_modules ./node_modules

# Create @copyzen/shared module with compiled dist
RUN mkdir -p ./node_modules/@copyzen/shared
COPY --from=builder /app/packages/shared/dist ./node_modules/@copyzen/shared/dist
COPY --from=builder /app/packages/shared/package.json ./node_modules/@copyzen/shared/package.json

# Copy built API artifacts
COPY --from=builder /app/apps/api/dist/apps/api/src ./dist

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/health', (r) => {if (r.statusCode !== 200) throw new Error(r.statusCode)})"

EXPOSE 3000

ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "dist/index.js"]
