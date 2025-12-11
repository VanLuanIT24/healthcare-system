# Healthcare Frontend - Production Dockerfile
# Multi-stage build with Nginx for optimal performance

# Stage 1: Build
FROM node:22-alpine AS builder

WORKDIR /app

# Install build tools
RUN apk add --no-cache curl

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy application code
COPY . .

# Build for production
RUN npm run build

# Stage 2: Serve with Nginx
FROM nginx:alpine

WORKDIR /usr/share/nginx/html

# Install curl for health checks
RUN apk add --no-cache curl

# Copy nginx configuration
COPY nginx.conf /etc/nginx/nginx.conf

# Copy built application from builder
COPY --from=builder /app/dist .

# Create necessary permissions
RUN chmod -R 755 /usr/share/nginx/html

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
    CMD curl -f http://localhost:80/ || exit 1

# Expose port
EXPOSE 80

# Start nginx
CMD ["nginx", "-g", "daemon off;"]
