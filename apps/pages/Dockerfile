# Stage 1: Build
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files (root workspace)
COPY package.json package-lock.json tsconfig.json ./

# Copy workspace package.json files
COPY apps/pages/package.json ./apps/pages/
COPY packages/ ./packages/

# Install dependencies
RUN npm ci --workspaces

# Copy source code
COPY apps/pages/ ./apps/pages/

# Build Astro
WORKDIR /app/apps/pages
RUN npm run build

# Stage 2: Serve
FROM nginx:alpine

COPY --from=builder /app/apps/pages/dist /usr/share/nginx/html

# Copy nginx config (optional, for SPA routing)
RUN cat > /etc/nginx/conf.d/default.conf <<EOF
server {
    listen 80;
    server_name _;
    root /usr/share/nginx/html;
    index index.html;

    # SPA routing - serve index.html for all routes
    location / {
        try_files \$uri \$uri/ /index.html;
    }

    # Cache static assets
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
EOF

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
