FROM node:20-alpine AS base

# Install dependencies
FROM base AS deps
WORKDIR /app

COPY package*.json ./
RUN npm ci

# Build stage
FROM base AS builder
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Build for production
RUN npm run build

# Production stage with nginx
FROM nginx:alpine AS runner

# Copy built files
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 8081

CMD ["nginx", "-g", "daemon off;"]
