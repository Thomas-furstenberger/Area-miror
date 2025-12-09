FROM node:20-alpine AS base

# Install dependencies
FROM base AS deps
WORKDIR /app

COPY package*.json ./
RUN npm install

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

# Create APK directory and copy if exists
RUN mkdir -p /app/apk
RUN if [ -f client.apk ]; then cp client.apk /app/apk/client.apk; else echo "APK placeholder" > /app/apk/client.apk; fi

# Final stage - Just copy APK to shared volume
FROM alpine:latest AS runner
WORKDIR /app

COPY --from=builder /app/apk /app/apk

# Keep container running
CMD ["tail", "-f", "/dev/null"]
