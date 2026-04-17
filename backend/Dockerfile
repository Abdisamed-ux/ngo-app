FROM node:20-slim AS builder

WORKDIR /app

# Install openssl for Prisma
RUN apt-get update && apt-get install -y openssl

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
FROM node:20-slim

WORKDIR /app

# Install openssl in final image too
RUN apt-get update && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*

COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/src/shared/prisma ./src/shared/prisma

EXPOSE 3000
ENV NODE_ENV=production

CMD ["npm", "start"]
