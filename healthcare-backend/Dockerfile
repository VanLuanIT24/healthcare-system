# Backend Dockerfile - Production Build
# Multi-stage build for optimized image

# Stage 1: Build & Dependencies
FROM node:22-alpine AS builder

WORKDIR /app

# Install build tools
RUN apk add --no-cache python3 make g++ curl

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production && npm cache clean --force

# Stage 2: Runtime
FROM node:22-alpine

WORKDIR /app

# Install dumb-init for proper signal handling
RUN apk add --no-cache dumb-init curl

# Copy from builder
COPY --from=builder /app/node_modules ./node_modules

# Copy application code
COPY . .

# Create non-root user for security
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001 && \
    chown -R nodejs:nodejs /app

# Create necessary directories
RUN mkdir -p uploads logs && \
    chown -R nodejs:nodejs uploads logs

USER nodejs

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=40s --retries=3 \
    CMD curl -f http://localhost:5000/api/v1/health || exit 1

# Expose port
EXPOSE 5000

# Use dumb-init to handle signals properly
ENTRYPOINT ["dumb-init", "--"]

# Start application
CMD ["node", "server.js"]
