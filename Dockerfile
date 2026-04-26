# Multi-stage build for production

# Stage 1: Build client
FROM node:20-alpine AS client-builder
WORKDIR /app/client
COPY client/package*.json ./
RUN npm ci
COPY client/ ./
RUN npm run build

# Stage 2: Build server
FROM node:20-alpine AS server-builder
WORKDIR /app/server
COPY server/package*.json ./
RUN npm ci
COPY server/ ./
RUN npx prisma generate
RUN npm run build

# Stage 3: Production
FROM node:20-alpine
WORKDIR /app

# Install production dependencies
COPY server/package*.json ./
RUN npm ci --only=production

# Copy built server
COPY --from=server-builder /app/server/dist ./dist
COPY --from=server-builder /app/server/node_modules/.prisma ./node_modules/.prisma
COPY --from=server-builder /app/server/src/prisma ./src/prisma

# Copy built client
COPY --from=client-builder /app/client/dist ./public

# Create uploads directory
RUN mkdir -p /app/uploads

# Expose port
EXPOSE 3001

# Start server
CMD ["node", "dist/index.js"]
