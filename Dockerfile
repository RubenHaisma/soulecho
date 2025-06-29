###############################################
# ----------  Builder stage  ---------- #
###############################################
# Use the official light-weight Node.js image to build the application
FROM node:20-alpine AS builder

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

# Install tini for proper signal handling
RUN apk add --no-cache tini

# Set workdir
WORKDIR /app

# Copy node_modules from the builder for production only (prune out dev dependencies)
COPY --from=builder /app/node_modules ./node_modules

# Copy built Next.js output and the rest of the application code
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/backend ./backend
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/app ./app
COPY --from=builder /app/lib ./lib
COPY --from=builder /app/components ./components
COPY --from=builder /app/scripts ./scripts

# Remove dev dependencies to keep image slim (succeeds even if none)
RUN npm prune --production || true

# Environment variables that can be overridden at runtime
ENV FRONTEND_PORT=3000 \
    BACKEND_PORT=3001 \
    NODE_ENV=production

# Optionally expose the default ports (can be overridden when the container is run)
EXPOSE $FRONTEND_PORT $BACKEND_PORT

# Use tini as the init system
ENTRYPOINT ["/sbin/tini", "--"]

# Start both the backend and the Next.js server.  Ports are NOT hard-coded and can be
# overridden by providing FRONTEND_PORT and/or BACKEND_PORT when running the container.
CMD ["sh", "-c", "\n  : ${FRONTEND_PORT:=3000}; \
  : ${BACKEND_PORT:=3001}; \
  PORT=$BACKEND_PORT node backend/server.js & \
  npx prisma migrate deploy && \
  next start -p $FRONTEND_PORT\n"] 