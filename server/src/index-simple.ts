import Fastify from 'fastify';
import 'dotenv/config';
import crypto from 'crypto';

const fastify = Fastify({
  logger: true,
});

// In-memory store for sessions (in production, use a database)
const sessions = new Map<string, any>();

fastify.get('/', async (_request, _reply) => {
  return { message: 'Welcome to Area Server API' };
});

fastify.get('/health', async (_request, _reply) => {
  return { status: 'ok' };
});

// Start GitHub OAuth flow
fastify.get('/api/auth/github', async (request, reply) => {
  const clientId = process.env.GITHUB_CLIENT_ID;
  const redirectUri = process.env.GITHUB_CALLBACK_URL;
  const scope = 'user:email,read:user';

  const authUrl = `https://github.com/login/oauth/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&scope=${scope}`;

  return reply.redirect(authUrl);
});

// Handle GitHub callback
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

    // Fetch user info
    const userResponse = await fetch('https://api.github.com/user', {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Accept': 'application/vnd.github.v3+json',
      },
    });

    if (!userResponse.ok) {
      return reply.status(401).send({ error: 'Failed to fetch user info' });
    }

    const user = await userResponse.json();

    // Create session
    const sessionToken = crypto.randomBytes(32).toString('hex');
    sessions.set(sessionToken, {
      userId: user.id,
      login: user.login,
      email: user.email,
      name: user.name,
      avatarUrl: user.avatar_url,
      accessToken: accessToken,
      createdAt: new Date(),
    });

    return {
      success: true,
      user: {
        id: user.id,
        login: user.login,
        email: user.email,
        name: user.name,
        avatarUrl: user.avatar_url,
      },
      token: sessionToken,
    };
  } catch (error) {
    fastify.log.error(error);
    return reply.status(500).send({ error: 'Authentication failed', details: (error as Error).message });
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
    const session = sessions.get(sessionToken);

    if (!session) {
      return reply.status(401).send({ error: 'Invalid or expired token' });
    }

    return {
      id: session.userId,
      login: session.login,
      email: session.email,
      name: session.name,
      avatarUrl: session.avatarUrl,
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
    sessions.delete(sessionToken);

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

start();
