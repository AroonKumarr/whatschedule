# Multi-stage production build for WhatsSchedule on Railway
FROM node:20-alpine AS builder

WORKDIR /app

# Install build dependencies
RUN apk add --no-cache python3 make g++

# Copy root and package manifests
COPY package*.json ./
COPY server/package*.json ./server/
COPY client/package*.json ./client/

# Install dependencies across all workspaces
RUN npm install
RUN cd server && npm install
RUN cd client && npm install

# Copy source code and Prisma schema
COPY server/ ./server/
COPY client/ ./client/

# Generate Prisma Client and build server and client
RUN cd server && npx prisma generate && npm run build
RUN cd client && npm run build

# --- Production Runner Stage ---
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=5001

# Copy package manifests and installed server dependencies
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/server/package*.json ./server/
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/server/node_modules ./server/node_modules

# Copy Prisma schema & migrations
COPY --from=builder /app/server/prisma ./server/prisma

# Copy built server and client assets
COPY --from=builder /app/server/dist ./server/dist
COPY --from=builder /app/client/dist ./client/dist

# Create uploads directory and session directories
RUN mkdir -p /app/uploads /app/server/baileys_auth_info /app/server/prisma

EXPOSE 5001

CMD ["node", "server/dist/index.js"]
