# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Build argument for API URL
ARG API_URL=http://backend:3000/api

# Copy package files
COPY package*.json ./
COPY nx.json ./
COPY tsconfig*.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Replace API URL in environment.prod.ts using Node.js
RUN node -e "const fs = require('fs'); const file = 'apps/frontend/src/environments/environment.prod.ts'; const content = fs.readFileSync(file, 'utf8'); const updated = content.replace(/apiUrl: '[^']*'/, \"apiUrl: '${API_URL}'\"); fs.writeFileSync(file, updated);"

# Build the frontend application
RUN npx nx build frontend --configuration=production

# Production stage with Nginx
FROM nginx:alpine

# Copy custom nginx configuration
COPY apps/frontend/nginx.conf /etc/nginx/conf.d/default.conf

# Copy built application from builder stage
COPY --from=builder /app/dist/apps/frontend/browser /usr/share/nginx/html

# Expose port 80
EXPOSE 80

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --quiet --tries=1 --spider http://localhost:80/ || exit 1

# Start nginx
CMD ["nginx", "-g", "daemon off;"]
