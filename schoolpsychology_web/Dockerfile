# -------- Build stage --------
FROM node:22.14.0-alpine AS builder

WORKDIR /app

# Copy package.json và cài dependency
COPY package*.json ./
RUN npm ci

# Copy source code và build
COPY . .
RUN npm run build

# -------- Run stage --------
FROM node:22.14.0-alpine AS runner

WORKDIR /app

# Cài serve để phục vụ dist
RUN npm install -g serve

# Copy build từ builder
COPY --from=builder /app/dist ./dist

EXPOSE 3000

# Chạy production server
CMD ["serve", "-s", "dist", "-l", "3000"]
