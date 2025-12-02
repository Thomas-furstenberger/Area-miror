import Fastify from 'fastify';
import { PrismaClient } from '@prisma/client';
import 'dotenv/config';
import { UserService } from './user.service';
import { generateAccessToken, generateSessionToken } from './auth';

const fastify = Fastify({
  logger: true,
});

const prisma = new PrismaClient();
const userService = new UserService(prisma);

fastify.get('/', async (_request, _reply) => {
  return { message: 'Welcome to Area Server API' };
});

fastify.get('/health', async (_request, _reply) => {
  return { status: 'ok' };
});

// Register endpoint
fastify.post('/api/auth/register', async (request, reply) => {
  try {
    const { email, password, name } = request.body as any;

    if (!email || !password) {
      return reply.status(400).send({ error: 'Email and password are required' });
    }

    const user = await userService.registerUser(email, password, name);

    return reply.status(201).send({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
      },
      message: 'User registered successfully. Please login to continue.',
    });
  } catch (error) {
    fastify.log.error(error);
    const message = (error as Error).message;
    return reply.status(400).send({ error: message });
  }
});

// Login endpoint
fastify.post('/api/auth/login', async (request, reply) => {
  try {
    const { email, password } = request.body as any;

    if (!email || !password) {
      return reply.status(400).send({ error: 'Email and password are required' });
    }

    const user = await userService.loginUser(email, password);
    const sessionToken = generateSessionToken();

    await userService.createSession(user.id, sessionToken);

    const accessToken = generateAccessToken(user.id, user.email);

    return {
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
      },
      accessToken,
      sessionToken,
    };
  } catch (error) {
    fastify.log.error(error);
    return reply.status(401).send({ error: 'Invalid credentials' });
  }
});

// Get current user
fastify.get('/api/auth/user', async (request, reply) => {
  try {
    const authHeader = request.headers.authorization;
    if (!authHeader) {
      return reply.status(401).send({ error: 'No token provided' });
    }

    const token = authHeader.split(' ')[1];
    const session = await userService.getSessionByToken(token);

    if (!session) {
      return reply.status(401).send({ error: 'Invalid or expired token' });
    }

    // Check if session is expired
    if (new Date() > session.expiresAt) {
      await userService.deleteSession(token);
      return reply.status(401).send({ error: 'Token expired' });
    }

    return {
      id: session.user.id,
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

    const token = authHeader.split(' ')[1];
    await userService.deleteSession(token);

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
