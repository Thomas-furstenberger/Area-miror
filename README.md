# AREA - Action-REAction Platform

**IFTTT/Zapier-like automation platform** - Create workflows that connect different services together.

A complete monorepo containing a Fastify backend API, a React + Vite web application, and a React Native mobile application.

## 🚀 Quick Start with Docker

The fastest way to run the entire application:

```bash
# 1. Copy environment file
cp .env.example .env

# 2. Configure your OAuth credentials in .env
# Edit GOOGLE_CLIENT_ID, GITHUB_CLIENT_ID, DISCORD_CLIENT_ID, etc.

# 3. Start all services
docker-compose up --build

# 4. Access the application
# Web: http://localhost:8081
# API: http://localhost:3000
# Mobile APK: http://localhost:8082/client.apk
```

## 📋 Features

### ✅ Implemented & Working

**Backend (Fastify + TypeScript)**

- PostgreSQL database with Prisma ORM
- OAuth authentication (Gmail/Google, GitHub, Discord)
- Complete REST API for AREA management
- Hook Executor (automated check every 2 minutes)
- `/about.json` endpoint for mobile client
- CORS configured

**Actions**

- ✅ **Gmail**: `email_received` - Detects new unread emails

**Reactions**

- ✅ **Discord**: `send_message` - Sends message via webhook with custom emojis
- ✅ **Gmail**: `send_email` - Sends email via API endpoint

**Frontend Web (React + Vite)**

- OAuth login (Google, GitHub, Discord)
- AREA management interface (create, list, toggle, delete)
- Real-time sync with backend
- Responsive design

**Mobile (React Native + Expo)**

- Server configuration screen
- OAuth authentication
- Complete AREA management interface
- Modern UI with animations

## 📂 Project Structure

```
.
├── server/              # Fastify API (TypeScript)
│   ├── src/
│   │   ├── area.service.ts       # AREA CRUD operations
│   │   ├── hook.executor.ts      # Automation engine
│   │   ├── actions/              # Action implementations
│   │   │   ├── gmail.action.ts
│   │   │   └── timer.action.ts
│   │   ├── reactions/            # Reaction implementations
│   │   │   └── discord.reaction.ts
│   │   ├── gmail.service.ts      # Gmail API integration
│   │   ├── user.service.ts       # User management
│   │   └── index-db.ts           # Main server file
│   ├── prisma/                   # Database schema & migrations
│   ├── Dockerfile                # Server Docker config
│   └── package.json
│
├── web/                # React + Vite (TypeScript)
│   ├── src/
│   │   ├── pages/
│   │   │   ├── LandingPage.tsx
│   │   │   ├── LoginPage.tsx
│   │   │   ├── LoginSuccessPage.tsx
│   │   │   ├── RegisterPage.tsx
│   │   │   └── AreasPage.tsx     # AREA management
│   │   └── App.tsx
│   ├── Dockerfile                # Web Docker config
│   ├── nginx.conf                # Nginx configuration
│   └── package.json
│
├── mobile/             # React Native (Expo)
│   ├── app/
│   │   ├── (auth)/
│   │   │   ├── login.tsx         # OAuth login
│   │   │   └── register.tsx
│   │   ├── (tabs)/
│   │   │   ├── index.tsx         # Dashboard
│   │   │   ├── areas.tsx         # AREA management
│   │   │   └── explore.tsx       # Services
│   │   └── index.tsx             # Server config
│   ├── Dockerfile                # Mobile Docker config
│   └── package.json
│
├── docker-compose.yml  # Complete stack orchestration
├── .env.example        # Environment variables template
└── README.md           # This file
```

## 🛠️ Development

### Prerequisites

- Node.js 20+
- Docker & Docker Compose (for containerized deployment)
- PostgreSQL 15+ (if running locally)

### Local Development (without Docker)

#### 1. Install dependencies

```bash
npm install
```

#### 2. Configure environment

```bash
cp .env.example .env
# Edit .env with your configuration
```

#### 3. Setup database

```bash
cd server
npx prisma migrate deploy
npx prisma generate
```

#### 4. Start services

```bash
# Terminal 1: Start server
cd server
npm run dev

# Terminal 2: Start web client
cd web
npm run dev

# Terminal 3: Start mobile (optional)
cd mobile
npm start
```

### Docker Development

```bash
# Build and start all services
docker-compose up --build

# Start in background
docker-compose up -d

# View logs
docker-compose logs -f

# Stop all services
docker-compose down

# Rebuild specific service
docker-compose up --build server
```

## 🔧 Configuration

### OAuth Setup

You need to configure OAuth applications for each provider:

#### Google/Gmail

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project
3. Enable Gmail API
4. Create OAuth 2.0 credentials
5. Add redirect URI: `http://localhost:3000/api/auth/gmail/callback`
6. Add scopes: `userinfo.email`, `userinfo.profile`, `gmail.modify`

#### GitHub

1. Go to GitHub Settings → Developer settings → OAuth Apps
2. Create new OAuth App
3. Authorization callback URL: `http://localhost:3000/api/auth/github/callback`

#### Discord

1. Go to [Discord Developer Portal](https://discord.com/developers/applications)
2. Create new application
3. OAuth2 → Add redirect: `http://localhost:3000/api/auth/discord/callback`

### Environment Variables

See `.env.example` for all available configuration options.

Required variables:

- `DATABASE_URL` - PostgreSQL connection string
- `JWT_SECRET` - Secret for JWT tokens
- `GOOGLE_CLIENT_ID` + `GOOGLE_CLIENT_SECRET`
- `GITHUB_CLIENT_ID` + `GITHUB_CLIENT_SECRET`
- `DISCORD_CLIENT_ID` + `DISCORD_CLIENT_SECRET`

## 📱 Mobile App

### Development

```bash
cd mobile
npm start
```

This will start Expo Dev Client. Use Expo Go app to scan the QR code.

### Building APK

```bash
cd mobile
eas build --platform android --profile production
```

## 🧪 Testing

The application includes complete working examples:

### Test: Gmail → Discord

1. **Login** with OAuth Gmail
2. **Create an AREA**:
   - IF: Gmail - email_received
   - THEN: Discord - send_message
   - Configure Discord webhook URL
3. **Test**: Send yourself an email
4. **Result**: Within 2 minutes, you'll receive a Discord notification with email subject

## 🏗️ Architecture

### Database Schema

- **User**: Stores user info and OAuth tokens
- **Session**: JWT sessions for authentication
- **Area**: Automation workflows (action + reaction)

### Hook Executor

Runs every 2 minutes and:

1. Fetches all active AREAs
2. Checks each action (e.g., new email?)
3. Triggers corresponding reaction (e.g., send Discord message)
4. Prevents duplicates with timestamp tracking

## 📦 API Documentation

### API Endpoints

#### Authentication
- `POST /api/auth/register` - Créer un compte
- `POST /api/auth/login` - Connexion email/password
- `GET /api/auth/user` - Obtenir l'utilisateur connecté
- `POST /api/auth/logout` - Déconnexion

#### OAuth
- `GET /api/auth/gmail` - OAuth Gmail/Google
- `GET /api/auth/github` - OAuth GitHub
- `GET /api/auth/discord` - OAuth Discord
- `GET /api/auth/spotify` - OAuth Spotify

#### AREAs (Automatisations)
- `GET /api/areas` - Liste des AREAs de l'utilisateur
- `POST /api/areas` - Créer une nouvelle AREA
- `PUT /api/areas/:id/toggle` - Activer/Désactiver une AREA
- `DELETE /api/areas/:id` - Supprimer une AREA

#### Services
- `GET /about.json` - Configuration des services (Actions/REActions)

#### Health
- `GET /` - Message de bienvenue
- `GET /health` - Status du serveur

## 👥 Team

This project was developed by a team of 5 students at Epitech.

## 📄 License

This project is part of an Epitech school project.

---

**MVP Status**: ✅ Core functionality complete and working
