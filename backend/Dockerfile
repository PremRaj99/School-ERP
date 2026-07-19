# ==========================================
# Stage 1: Build stage
# ==========================================
FROM oven/bun:1-alpine AS builder

# Install build dependencies, openssl, and compatibility libraries for Alpine (needed for Prisma)
RUN apk add --no-cache openssl ca-certificates libc6-compat

WORKDIR /app

# Copy package files
COPY package.json bun.lock* ./
COPY prisma ./prisma/

# Install all dependencies (including devDependencies to compile TS)
RUN bun install --frozen-lockfile

# Generate Prisma Client
RUN bunx prisma generate

# Copy tsconfig and source code
COPY tsconfig.json ./
COPY src ./src/

# Compile TypeScript to JavaScript
RUN bun run build

# Copy assets like template files that aren't compiled by tsc
RUN mkdir -p dist/modules/log && cp src/modules/log/log.ejs dist/modules/log/

# ==========================================
# Stage 2: Install production dependencies
# ==========================================
FROM oven/bun:1-alpine AS prod-deps
WORKDIR /app
COPY package.json bun.lock* ./
COPY prisma ./prisma/
RUN bun install --frozen-lockfile --production
RUN bunx prisma generate

# ==========================================
# Stage 3: Production runner stage
# ==========================================
FROM oven/bun:1-alpine AS runner

# Install runtime dependencies (Prisma needs openssl and libc6-compat on Alpine)
RUN apk add --no-cache openssl ca-certificates libc6-compat

WORKDIR /app

# Set default production environment variables
ENV NODE_ENV=production
ENV PORT=3000

# Copy only the compiled code, production node_modules, and prisma schema
COPY --from=prod-deps /app/package.json ./
COPY --from=prod-deps /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma

# Expose port
EXPOSE 3000

# Run the app and push schema updates on startup
CMD ["sh", "-c", "bunx prisma db push && bun dist/index.js"]


