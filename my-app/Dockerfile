# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

COPY package.json package-lock.json ./

COPY scripts/seed.mjs ./

RUN npm ci

# Copy project files
COPY . .

# Generate Prisma Client for correct binary target in Alpine
RUN npx prisma generate

# Build the Next.js application
RUN npm run build

# Production stage
FROM node:20-alpine AS runner

WORKDIR /app

# Copy package files and install production dependencies
COPY package*.json ./
RUN npm ci --omit=dev

# Copy the Prisma client that was already generated correctly in builder
COPY --from=builder /app/node_modules/.prisma /app/node_modules/.prisma
COPY --from=builder /app/node_modules/@prisma /app/node_modules/@prisma

# Copy built application
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public

# Also copy prisma schema (if your app uses it at runtime, like migrations, etc)
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/scripts ./scripts

# Expose port 3000
EXPOSE 3000

# Start the application
CMD ["npm", "start"]