import Fastify from 'fastify';
import OAuth2 from '@fastify/oauth2';
import { PrismaClient } from '@prisma/client';
import 'dotenv/config';
import { UserRepository } from './user.repository';
import { SessionRepository } from './session.repository';
import { generateToken, verifyToken } from './auth.utils';

const fastify = Fastify({
  logger: true,
});

const prisma = new PrismaClient();
const userRepository = new UserRepository(prisma);
const sessionRepository = new SessionRepository(prisma);

// Register OAuth2 plugin for GitHub
fastify.register(OAuth2, {
  name: 'github',
  scope: ['user:email', 'read:user'],
  credentials: {
    client: {
      id: process.env.GITHUB_CLIENT_ID || '',
      secret: process.env.GITHUB_CLIENT_SECRET || '',
    },
    auth: {
      authorizeHost: 'https://github.com',
      authorizePath: '/login/oauth/authorize',
      tokenHost: 'https://github.com',
      tokenPath: '/login/oauth/access_token',
    },
  },
  startRedirectPath: '/api/auth/github',
  callbackUri: process.env.GITHUB_CALLBACK_URL || 'http://localhost:3000/api/auth/github/callback',
});

fastify.get('/', async (_request, _reply) => {
  return { message: 'Welcome to Area Server API' };
});

fastify.get('/health', async (_request, _reply) => {
  return { status: 'ok' };
});

// OAuth GitHub callback
fastify.get('/api/auth/github/callback', async (request, reply) => {
  try {
    // Get the OAuth token from GitHub
    const token = await fastify.getOAuthToken('github', request);

    // Fetch user information from GitHub API
    const userResponse = await fetch('https://api.github.com/user', {
      headers: {
        Authorization: `token ${token.access_token}`,
        Accept: 'application/vnd.github.v3+json',
      },
    });

    if (!userResponse.ok) {
      return reply.status(401).send({ error: 'Failed to fetch user info' });
    }

    const githubUser = await userResponse.json();

    // Save/update user in database
    const user = await userRepository.upsertUser({
      githubId: githubUser.id,
      login: githubUser.login,
      email: githubUser.email,
      name: githubUser.name,
      avatarUrl: githubUser.avatar_url,
      accessToken: token.access_token,
    });

    // Generate session token
    const sessionToken = generateToken();
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

    // Create session in database
    await sessionRepository.createSession(user.id, sessionToken, expiresAt);

    return {
      success: true,
      user: {
        id: user.id,
        login: user.login,
        email: user.email,
        name: user.name,
        avatarUrl: user.avatarUrl,
      },
      token: sessionToken,
      expiresAt: expiresAt.toISOString(),
    };
  } catch (error) {
    fastify.log.error(error);
    return reply.status(500).send({ error: 'Authentication failed' });
  }
});

// Get current user
fastify.get('/api/auth/user', async (request, reply) => {
  try {
    const authHeader = request.headers.authorization;
    if (!authHeader) {
      return reply.status(401).send({ error: 'No token provided' });
    }

    const sessionToken = authHeader.split(' ')[1];
    if (!sessionToken) {
      return reply.status(401).send({ error: 'Invalid authorization format' });
    }

    // Find session in database
    const session = await sessionRepository.findSessionByToken(sessionToken);
    if (!session) {
      return reply.status(401).send({ error: 'Invalid or expired token' });
    }

    // Check if session is expired
    if (new Date() > session.expiresAt) {
      await sessionRepository.deleteSession(sessionToken);
      return reply.status(401).send({ error: 'Token expired' });
    }

    return {
      id: session.user.id,
      login: session.user.login,
      email: session.user.email,
      name: session.user.name,
      avatarUrl: session.user.avatarUrl,
    };
  } catch (error) {
    fastify.log.error(error);
    return reply.status(500).send({ error: 'Failed to fetch user info' });
  }
});

// Logout
fastify.post('/api/auth/logout', async (request, reply) => {
  try {
    const authHeader = request.headers.authorization;
    if (!authHeader) {
      return reply.status(400).send({ error: 'No token provided' });
    }

    const sessionToken = authHeader.split(' ')[1];
    await sessionRepository.deleteSession(sessionToken);

    return { success: true, message: 'Logged out successfully' };
  } catch (error) {
    fastify.log.error(error);
    return reply.status(500).send({ error: 'Logout failed' });
  }
});

const start = async () => {
  try {
    await fastify.listen({ port: parseInt(process.env.PORT || '3000'), host: process.env.HOST || '0.0.0.0' });
    console.log(`Server running on http://localhost:${process.env.PORT || 3000}`);
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

// Cleanup
process.on('SIGTERM', async () => {
  await prisma.$disconnect();
  process.exit(0);
});

start();
