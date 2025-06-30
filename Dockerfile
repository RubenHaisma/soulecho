###############################################
# ----------  Builder stage  ---------- #
###############################################
# Use the official light-weight Node.js image to build the application
FROM node:20-alpine AS builder

# Install OpenSSL and other required dependencies for Prisma
RUN apk add --no-cache openssl openssl-dev

# Create app directory
WORKDIR /app

# Install dependencies based on the lockfile
COPY package*.json ./

# Copy any other files required for dependency resolution (e.g. Prisma generator)
COPY prisma ./prisma

# Install all deps (including dev-deps needed for building)
RUN npm ci

# Copy the rest of the source code
COPY . .

# Generate Prisma client (database client)
RUN npx prisma generate

# Build the Next.js application for production
RUN npm run build

###############################################
# ----------  Runtime stage  ---------- #
###############################################
FROM node:20-alpine

# Install OpenSSL and tini for proper signal handling
RUN apk add --no-cache openssl tini curl

# Set workdir
WORKDIR /app

# Copy node_modules from the builder for production only (prune out dev dependencies)
COPY --from=builder /app/node_modules ./node_modules

# Copy built Next.js output and the rest of the application code
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/lib ./lib
COPY --from=builder /app/app ./app
COPY --from=builder /app/components ./components
COPY --from=builder /app/next.config.js ./next.config.js

# Remove dev dependencies to keep image slim (succeeds even if none)
RUN npm prune --production || true

# Environment variables that can be overridden at runtime
ENV NODE_ENV=production \
    PORT=3000

# Expose the Next.js port
EXPOSE $PORT

# Use tini as the init system
ENTRYPOINT ["/sbin/tini", "--"]

# Start Next.js application with database migrations
CMD ["sh", "-c", "\
  echo 'Starting SoulEcho application...'; \
  echo 'Running database migrations...'; \
  npx prisma migrate deploy; \
  echo 'Starting Next.js server on port $PORT...'; \
  npx next start -p $PORT"] 