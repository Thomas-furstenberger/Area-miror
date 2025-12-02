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

// GitHub OAuth login initiation
fastify.get('/api/auth/github', async (request, reply) => {
  const clientId = process.env.GITHUB_CLIENT_ID;
  const redirectUri = process.env.GITHUB_CALLBACK_URL;
  const scope = 'user:email,read:user';

  const authUrl = `https://github.com/login/oauth/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&scope=${scope}`;

  return reply.redirect(authUrl);
});

// GitHub OAuth callback
fastify.get('/api/auth/github/callback', async (request, reply) => {
  try {
    const code = (request.query as any).code;
    const error = (request.query as any).error;

    if (error) {
      return reply.status(401).send({ error: `GitHub error: ${error}` });
    }

    if (!code) {
      return reply.status(400).send({ error: 'No authorization code received' });
    }

    // Exchange code for token
    const tokenResponse = await fetch('https://github.com/login/oauth/access_token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({
        client_id: process.env.GITHUB_CLIENT_ID,
        client_secret: process.env.GITHUB_CLIENT_SECRET,
        code: code,
        redirect_uri: process.env.GITHUB_CALLBACK_URL,
      }),
    });

    if (!tokenResponse.ok) {
      return reply.status(401).send({ error: 'Failed to exchange code for token' });
    }

    const tokenData = await tokenResponse.json();

    if (tokenData.error) {
      return reply.status(401).send({ error: `Token error: ${tokenData.error}` });
    }

    const accessToken = tokenData.access_token;

    // Fetch user info from GitHub
    const userResponse = await fetch('https://api.github.com/user', {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Accept': 'application/vnd.github.v3+json',
      },
    });

    if (!userResponse.ok) {
      return reply.status(401).send({ error: 'Failed to fetch user info' });
    }

    const githubUser = await userResponse.json();

    // Find or create user with OAuth account
    const user = await userService.findOrCreateOAuthUser('github', githubUser.id.toString(), {
      email: githubUser.email || `github_${githubUser.login}@area.local`,
      name: githubUser.name || githubUser.login,
      avatarUrl: githubUser.avatar_url,
      accessToken: accessToken,
    });

    // Create session
    const sessionToken = generateSessionToken();
    await userService.createSession(user.id, sessionToken);
    const jwtToken = generateAccessToken(user.id, user.email);

    return {
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        avatarUrl: user.avatarUrl,
      },
      accessToken: jwtToken,
      sessionToken,
    };
  } catch (error) {
    fastify.log.error(error);
    return reply.status(500).send({ error: 'Authentication failed', details: (error as Error).message });
  }
});

// Get user's connected OAuth accounts
fastify.get('/api/user/oauth-accounts', async (request, reply) => {
  try {
    const authHeader = request.headers.authorization;
    if (!authHeader) {
      return reply.status(401).send({ error: 'No token provided' });
    }

    const token = authHeader.split(' ')[1];
    const session = await userService.getSessionByToken(token);

    if (!session) {
      return reply.status(401).send({ error: 'Invalid token' });
    }

    const oauthAccounts = await prisma.oAuthAccount.findMany({
      where: { userId: session.user.id },
      select: {
        id: true,
        provider: true,
        createdAt: true,
      },
    });

    return {
      success: true,
      accounts: oauthAccounts,
    };
  } catch (error) {
    fastify.log.error(error);
    return reply.status(500).send({ error: 'Failed to fetch OAuth accounts' });
  }
});

// Disconnect OAuth account
fastify.post('/api/user/oauth/disconnect/:provider', async (request, reply) => {
  try {
    const authHeader = request.headers.authorization;
    if (!authHeader) {
      return reply.status(401).send({ error: 'No token provided' });
    }

    const token = authHeader.split(' ')[1];
    const session = await userService.getSessionByToken(token);

    if (!session) {
      return reply.status(401).send({ error: 'Invalid token' });
    }

    const { provider } = request.params as any;

    // Check user has at least one password-based auth
    const user = await userService.getUserById(session.user.id);
    if (!user?.password && provider === 'github') {
      return reply.status(400).send({ error: 'Cannot disconnect only auth method' });
    }

    // Delete OAuth account
    await prisma.oAuthAccount.deleteMany({
      where: {
        userId: session.user.id,
        provider,
      },
    });

    return {
      success: true,
      message: `${provider} account disconnected`,
    };
  } catch (error) {
    fastify.log.error(error);
    return reply.status(500).send({ error: 'Failed to disconnect OAuth account' });
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
