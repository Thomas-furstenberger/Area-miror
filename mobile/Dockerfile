FROM node:20-alpine AS base

# Install dependencies
FROM base AS deps
WORKDIR /app

COPY package*.json ./
RUN npm ci

# Install Expo CLI globally
RUN npm install -g expo-cli eas-cli

# Build stage
FROM base AS builder
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Build APK
# Note: This requires EAS Build or local Android SDK
# For now, we'll prepare the app for build
RUN npx expo export --platform android

# Production stage - Serve the exported app
FROM nginx:alpine AS runner

COPY --from=builder /app/dist /usr/share/nginx/html

# For APK download endpoint
COPY client.apk /usr/share/nginx/html/client.apk 2>/dev/null || echo "APK will be added later"

EXPOSE 8081

CMD ["nginx", "-g", "daemon off;"]
