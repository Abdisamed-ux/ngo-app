FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm install

# Copy Prisma schema and generate client
COPY src/shared/prisma ./src/shared/prisma
RUN npx prisma generate --schema=src/shared/prisma/schema.prisma

# Copy source code and build
COPY . .
RUN npm run build

# Final Stage
FROM node:20-alpine

WORKDIR /app

COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/src/shared/prisma ./src/shared/prisma

EXPOSE 3000

# Set environment variables (should be provided by host)
ENV NODE_ENV=production

CMD ["npm", "start"]
