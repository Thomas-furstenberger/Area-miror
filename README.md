# Area Project

A monorepo containing a Fastify backend API, a React + Vite web application, and a React Native mobile application.

## Project Structure

```
.
├── server/          # Fastify API (TypeScript)
├── web/            # React + Vite Application (TypeScript)
├── mobile/         # React Native Application (Expo)
└── package.json    # Monorepo configuration
```

## Installation

```bash
npm install
```

This will install all dependencies for the three applications.

## Development

### Server (Fastify)

```bash
npm run dev
```

The API will be available at `http://localhost:3000`

### Web (React + Vite)

```bash
npm run dev
```

The application will be available at `http://localhost:5173`

### Mobile (React Native)

```bash
npm run dev
```

## Build

### Server

```bash
npm run build:server
npm run start:server
```

### Web

```bash
npm run build:web
npm run start:web
```

### Mobile

```bash
npm run build:mobile
```

## Additional Documentation

- **Server**: See `server/README.md` for more details
- **Web**: See `web/README.md` for more details
- **Mobile**: See `mobile/README.md` for more details
