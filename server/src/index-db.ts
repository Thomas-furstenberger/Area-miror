import Fastify from 'fastify';
import { PrismaClient } from '@prisma/client';
import 'dotenv/config';
import { UserService } from './user.service';
import { generateAccessToken, generateSessionToken } from './auth';
import { SERVICES } from './services.config';
import { GmailService } from './gmail.service';

const fastify = Fastify({
  logger: true,
});

const prisma = new PrismaClient();
const userService = new UserService(prisma);
const gmailService = new GmailService(prisma);

fastify.get('/', async (_request, _reply) => {
  return { message: 'Welcome to Area Server API' };
});

fastify.get('/health', async (_request, _reply) => {
  return { status: 'ok' };
});

// About endpoint - Required by docker-compose specification
fastify.get('/about.json', async (request, reply) => {
  const clientIp = request.ip || request.headers['x-forwarded-for'] || 'unknown';
  const currentTime = Math.floor(Date.now() / 1000);

  return {
    client: {
      host: clientIp,
    },
    server: {
      current_time: currentTime,
      services: SERVICES.map((service) => ({
        name: service.name,
        actions: service.actions.map((action) => ({
          name: action.name,
          description: action.description,
        })),
        reactions: service.reactions.map((reaction) => ({
          name: reaction.name,
          description: reaction.description,
        })),
      })),
    },
  };
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

// Discord OAuth login initiation
fastify.get('/api/auth/discord', async (request, reply) => {
  const clientId = process.env.DISCORD_CLIENT_ID;
  const redirectUri = process.env.DISCORD_CALLBACK_URL;
  const scope = 'identify email';

  const authUrl = `https://discord.com/api/oauth2/authorize?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&scope=${encodeURIComponent(scope)}`;

  return reply.redirect(authUrl);
});

// Discord OAuth callback
fastify.get('/api/auth/discord/callback', async (request, reply) => {
  try {
    const code = (request.query as any).code;
    const error = (request.query as any).error;

    if (error) {
      return reply.status(401).send({ error: `Discord error: ${error}` });
    }

    if (!code) {
      return reply.status(400).send({ error: 'No authorization code received' });
    }

    // Exchange code for token
    const tokenResponse = await fetch('https://discord.com/api/oauth2/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: process.env.DISCORD_CLIENT_ID || '',
        client_secret: process.env.DISCORD_CLIENT_SECRET || '',
        code: code,
        grant_type: 'authorization_code',
        redirect_uri: process.env.DISCORD_CALLBACK_URL || '',
      }).toString(),
    });

    if (!tokenResponse.ok) {
      return reply.status(401).send({ error: 'Failed to exchange code for token' });
    }

    const tokenData = await tokenResponse.json();
    const accessToken = tokenData.access_token;

    // Fetch user info from Discord
    const userResponse = await fetch('https://discord.com/api/users/@me', {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
    });

    if (!userResponse.ok) {
      return reply.status(401).send({ error: 'Failed to fetch user info' });
    }

    const discordUser = await userResponse.json();

    // Find or create user with OAuth account
    const user = await userService.findOrCreateOAuthUser('discord', discordUser.id, {
      email: discordUser.email || `discord_${discordUser.username}@area.local`,
      name: discordUser.username,
      avatarUrl: discordUser.avatar ? `https://cdn.discordapp.com/avatars/${discordUser.id}/${discordUser.avatar}.png` : null,
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

const start = async () => {
  try {
    await fastify.listen({ port: parseInt(process.env.PORT || '3000'), host: process.env.HOST || '0.0.0.0' });
    console.log(`Server running on http://localhost:${process.env.PORT || 3000}`);
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

// login with google
fastify.get('/api/auth/google', async (request, reply) => {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const redirectUri = process.env.GOOGLE_CALLBACK_URL;
  
  const scope = 'https://www.googleapis.com/auth/userinfo.email https://www.googleapis.com/auth/userinfo.profile https://www.googleapis.com/auth/gmail.modify';

  if (!clientId || !redirectUri) {
    return reply.status(500).send({ error: 'Configuration Google manquante (CLIENT_ID ou CALLBACK_URL)' });
  }

  const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${redirectUri}&response_type=code&scope=${scope}&access_type=offline&prompt=consent`;

  return reply.redirect(authUrl);
});

// Google OAuth callback
fastify.get('/api/auth/google/callback', async (request, reply) => {
  try {
    const code = (request.query as any).code;
    const error = (request.query as any).error;

    if (error) {
      return reply.status(401).send({ error: `Erreur Google: ${error}` });
    }
    if (!code) {
      return reply.status(400).send({ error: 'Code d\'autorisation manquant' });
    }

    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code: code,
        client_id: process.env.GOOGLE_CLIENT_ID || '',
        client_secret: process.env.GOOGLE_CLIENT_SECRET || '',
        redirect_uri: process.env.GOOGLE_CALLBACK_URL || '',
        grant_type: 'authorization_code',
      }),
    });

    if (!tokenResponse.ok) {
      const errText = await tokenResponse.text();
      return reply.status(401).send({ error: `Échec de l'échange de token: ${errText}` });
    }

    const tokenData = await tokenResponse.json();
    const accessToken = tokenData.access_token;
    const refreshToken = tokenData.refresh_token;

    const userResponse = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    if (!userResponse.ok) {
      return reply.status(401).send({ error: 'Impossible de récupérer le profil utilisateur' });
    }

    const googleUser = await userResponse.json();

    const user = await userService.findOrCreateOAuthUser('GOOGLE', googleUser.sub, {
      email: googleUser.email,
      name: googleUser.name || googleUser.given_name,
      avatarUrl: googleUser.picture,
      accessToken: accessToken,
      refreshToken: refreshToken,
    });

    const sessionToken = generateSessionToken();
    await userService.createSession(user.id, sessionToken);
    const jwtToken = generateAccessToken(user.id, user.email);

    return reply.redirect(`http://localhost:8081/login/success?token=${sessionToken}`);

  } catch (error) {
    fastify.log.error(error);
    return reply.status(500).send({ error: 'Authentification Google échouée', details: (error as Error).message });
  }
});

// Gmail send email
fastify.post('/api/area/gmail/send_email', async (request, reply) => {
  try {
    const authHeader = request.headers.authorization;
    if (!authHeader) return reply.status(401).send({ error: 'Token requis' });

    const token = authHeader.split(' ')[1];
    const session = await userService.getSessionByToken(token);
    if (!session) return reply.status(401).send({ error: 'Session invalide ou expirée' });

    const { to, subject, body } = request.body as any;

    if (!to || !subject || !body) {
      return reply.status(400).send({ 
        error: 'Paramètres manquants', 
        required: ['to', 'subject', 'body'] 
      });
    }

    const result = await gmailService.sendEmail(session.user.id, to, subject, body);

    return { 
      success: true, 
      message: 'Email envoyé avec succès', 
      googleId: result.id
    };

  } catch (error) {
    fastify.log.error(error);
    if ((error as Error).message.includes('RefreshToken')) {
        return reply.status(403).send({ error: 'L\'utilisateur n\'a pas connecté son compte Google.' });
    }
    return reply.status(500).send({ error: 'Échec de l\'envoi', details: (error as Error).message });
  }
});

// Cleanup
process.on('SIGTERM', async () => {
  await prisma.$disconnect();
  process.exit(0);
});

// Close on Ctrl+C
process.on('SIGINT', async () => {
  console.log('Arrêt du serveur...');
  await fastify.close();
  await prisma.$disconnect();
  process.exit(0);
});

start();
