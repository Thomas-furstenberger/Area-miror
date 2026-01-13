import Fastify from 'fastify';
import cors from '@fastify/cors';
import { PrismaClient } from '@prisma/client';
import 'dotenv/config';
import { UserService } from './user.service';
import { generateAccessToken, generateSessionToken } from './auth';
import { SERVICES } from './services.config';
import { GmailService } from './reactions/gmail.reaction';
import { AreaService } from './area.service';
import { HookExecutor } from './hook.executor';

const fastify = Fastify({
  logger: true,
});

// Register CORS
fastify.register(cors, {
  origin: true,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
});

const prisma = new PrismaClient();
const userService = new UserService(prisma);
const gmailService = new GmailService(prisma);
const areaService = new AreaService(prisma);
const hookExecutor = new HookExecutor(prisma);

interface CreateAreaRequest {
  name: string;
  description?: string;
  actionService: string;
  actionType: string;
  actionConfig: Record<string, unknown>;
  reactionService: string;
  reactionType: string;
  reactionConfig: Record<string, unknown>;
}

interface IdParams {
  id: string;
}

fastify.get('/', async (_request, _reply) => {
  return { message: 'Welcome to Area Server API' };
});

fastify.get('/health', async (_request, _reply) => {
  return { status: 'ok' };
});

fastify.get('/about.json', async (request, _reply) => {
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
          configFields: action.configFields || [],
        })),
        reactions: service.reactions.map((reaction) => ({
          name: reaction.name,
          description: reaction.description,
          configFields: reaction.configFields || [],
        })),
      })),
    },
  };
});

// Register endpoint
fastify.post('/api/auth/register', async (request, _reply) => {
  try {
    const { email, password, name } = request.body as {
      email: string;
      password: string;
      name?: string;
    };

    if (!email || !password) {
      return _reply.status(400).send({ error: 'Email and password are required' });
    }

    const user = await userService.registerUser(email, password, name);

    const sessionToken = generateSessionToken();
    await userService.createSession(user.id, sessionToken);

    const accessToken = generateAccessToken(user.id, user.email);

    return _reply.status(201).send({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
      },
      accessToken,
      sessionToken,
      message: 'User registered successfully',
    });
  } catch (error) {
    fastify.log.error(error);
    const message = (error as Error).message;
    return _reply.status(400).send({ error: message });
  }
});

// Login endpoint
fastify.post('/api/auth/login', async (request, _reply) => {
  try {
    const { email, password } = request.body as { email: string; password: string };

    if (!email || !password) {
      return _reply.status(400).send({ error: 'Email and password are required' });
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
    return _reply.status(401).send({ error: 'Invalid credentials' });
  }
});

// Get current user
fastify.get('/api/auth/user', async (request, _reply) => {
  try {
    const authHeader = request.headers.authorization;
    if (!authHeader) {
      return _reply.status(401).send({ error: 'No token provided' });
    }

    const token = authHeader.split(' ')[1];
    const session = await userService.getSessionByToken(token);

    if (!session) {
      return _reply.status(401).send({ error: 'Invalid or expired token' });
    }

    if (new Date() > session.expiresAt) {
      await userService.deleteSession(token);
      return _reply.status(401).send({ error: 'Token expired' });
    }

    return {
      id: session.user.id,
      email: session.user.email,
      name: session.user.name,
      avatarUrl: session.user.avatarUrl,
    };
  } catch (error) {
    fastify.log.error(error);
    return _reply.status(500).send({ error: 'Failed to fetch user info' });
  }
});

// Logout
fastify.post('/api/auth/logout', async (request, _reply) => {
  try {
    const authHeader = request.headers.authorization;
    if (!authHeader) {
      return _reply.status(400).send({ error: 'No token provided' });
    }

    const token = authHeader.split(' ')[1];
    await userService.deleteSession(token);

    return { success: true, message: 'Logged out successfully' };
  } catch (error) {
    fastify.log.error(error);
    return _reply.status(500).send({ error: 'Logout failed' });
  }
});

// --- GITHUB OAUTH ---
fastify.get('/api/auth/github', async (request, _reply) => {
  const query = request.query as { token?: string; state?: string };
  const redirectState = query.token || query.state;
  const clientId = process.env.GITHUB_CLIENT_ID;
  const redirectUri = process.env.GITHUB_CALLBACK_URL;
  const scope = 'user:email,read:user';

  if (!clientId || !redirectUri) {
    return _reply.status(500).send({ error: 'Configuration GitHub manquante' });
  }

  let authUrl = `https://github.com/login/oauth/authorize?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=${scope}`;

  if (redirectState) {
    authUrl += `&state=${encodeURIComponent(redirectState)}`;
  }

  return _reply.redirect(authUrl);
});

fastify.get('/api/auth/github/callback', async (request, _reply) => {
  try {
    const query = request.query as { code?: string; error?: string; state?: string };
    const code = query.code;
    const error = query.error;
    const rawState = query.state;

    if (error) return _reply.status(401).send({ error: `GitHub error: ${error}` });
    if (!code) return _reply.status(400).send({ error: 'No authorization code received' });

    const tokenResponse = await fetch('https://github.com/login/oauth/access_token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({
        client_id: process.env.GITHUB_CLIENT_ID,
        client_secret: process.env.GITHUB_CLIENT_SECRET,
        code: code,
        redirect_uri: process.env.GITHUB_CALLBACK_URL,
      }),
    });

    if (!tokenResponse.ok) return _reply.status(401).send({ error: 'Failed to exchange code' });
    const tokenData = (await tokenResponse.json()) as { access_token: string; error?: string };
    if (tokenData.error)
      return _reply.status(401).send({ error: `Token error: ${tokenData.error}` });

    const accessToken = tokenData.access_token;

    const userResponse = await fetch('https://api.github.com/user', {
      headers: { Authorization: `Bearer ${accessToken}`, Accept: 'application/vnd.github.v3+json' },
    });

    if (!userResponse.ok) return _reply.status(401).send({ error: 'Failed to fetch user info' });

    const githubUser = (await userResponse.json()) as {
      id: number;
      email: string;
      login: string;
      name: string;
      avatar_url: string;
    };

    let finalRedirectUrl = (process.env.FRONTEND_URL || 'http://localhost:8081') + '/login/success';
    let sessionTokenToLink = null;

    const userAgent = request.headers['user-agent']?.toLowerCase() || '';
    if (userAgent.includes('mobile') || userAgent.includes('okhttp')) {
      if (process.env.MOBILE_REDIRECT_URI) finalRedirectUrl = process.env.MOBILE_REDIRECT_URI;
    }

    if (rawState) {
      try {
        const stateObj = JSON.parse(rawState);
        if (stateObj.redirect) finalRedirectUrl = stateObj.redirect;
        if (stateObj.userToken) sessionTokenToLink = stateObj.userToken;
      } catch {
        if (rawState.startsWith('http') || rawState.startsWith('exp://')) {
          finalRedirectUrl = rawState;
        } else if (rawState === 'mobile') {
          if (process.env.MOBILE_REDIRECT_URI) finalRedirectUrl = process.env.MOBILE_REDIRECT_URI;
        } else {
          sessionTokenToLink = rawState;
        }
      }
    }

    let finalSessionToken = null;

    if (sessionTokenToLink) {
      try {
        const session = await userService.getSessionByToken(sessionTokenToLink);
        if (session) {
          await userService.connectOAuthToUser(
            session.user.id,
            'GITHUB',
            githubUser.id.toString(),
            {
              email: githubUser.email || `github_${githubUser.login}@area.local`,
              name: githubUser.name || githubUser.login,
              avatarUrl: githubUser.avatar_url,
              accessToken: accessToken,
            }
          );
          finalSessionToken = sessionTokenToLink;
        }
      } catch (err) {
        console.error('[OAuth] Failed to link account:', err);
      }
    }

    if (!finalSessionToken) {
      const user = await userService.findOrCreateOAuthUser('GITHUB', githubUser.id.toString(), {
        email: githubUser.email || `github_${githubUser.login}@area.local`,
        name: githubUser.name || githubUser.login,
        avatarUrl: githubUser.avatar_url,
        accessToken: accessToken,
      });

      finalSessionToken = generateSessionToken();
      await userService.createSession(user.id, finalSessionToken);
    }
    const separator = finalRedirectUrl.includes('?') ? '&' : '?';

    return _reply.redirect(
      `${finalRedirectUrl}${separator}token=${encodeURIComponent(finalSessionToken)}&service=github&connected=true`
    );
  } catch (error) {
    fastify.log.error(error);
    return _reply.status(500).send({ error: 'Authentication failed' });
  }
});

// --- DISCORD OAUTH ---
fastify.get('/api/auth/discord', async (request, _reply) => {
  const query = request.query as { token?: string; state?: string };
  const redirectState = query.token || query.state;
  const clientId = process.env.DISCORD_CLIENT_ID;
  const redirectUri = process.env.DISCORD_CALLBACK_URL;
  const scope = 'identify email';

  if (!clientId || !redirectUri)
    return _reply.status(500).send({ error: 'Configuration Discord manquante' });

  let authUrl = `https://discord.com/api/oauth2/authorize?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&scope=${encodeURIComponent(scope)}`;
  if (redirectState) authUrl += `&state=${encodeURIComponent(redirectState)}`;

  return _reply.redirect(authUrl);
});

fastify.get('/api/auth/discord/callback', async (request, _reply) => {
  try {
    const query = request.query as { code?: string; error?: string; state?: string };
    const code = query.code;
    const error = query.error;
    const rawState = query.state;

    if (error) return _reply.status(401).send({ error: `Discord error: ${error}` });
    if (!code) return _reply.status(400).send({ error: 'No authorization code' });

    const tokenResponse = await fetch('https://discord.com/api/oauth2/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id: process.env.DISCORD_CLIENT_ID || '',
        client_secret: process.env.DISCORD_CLIENT_SECRET || '',
        code: code,
        grant_type: 'authorization_code',
        redirect_uri: process.env.DISCORD_CALLBACK_URL || '',
      }).toString(),
    });

    if (!tokenResponse.ok) return _reply.status(401).send({ error: 'Failed to exchange code' });
    const tokenData = (await tokenResponse.json()) as { access_token: string };
    const accessToken = tokenData.access_token;

    const userResponse = await fetch('https://discord.com/api/users/@me', {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    if (!userResponse.ok) return _reply.status(401).send({ error: 'Failed to fetch user info' });
    const discordUser = (await userResponse.json()) as {
      id: string;
      email: string;
      username: string;
      avatar: string | null;
    };

    let finalRedirectUrl = (process.env.FRONTEND_URL || 'http://localhost:8081') + '/login/success';
    let sessionTokenToLink = null;

    const userAgent = request.headers['user-agent']?.toLowerCase() || '';
    if (userAgent.includes('mobile') || userAgent.includes('okhttp')) {
      if (process.env.MOBILE_REDIRECT_URI) finalRedirectUrl = process.env.MOBILE_REDIRECT_URI;
    }

    if (rawState) {
      try {
        const stateObj = JSON.parse(rawState);
        if (stateObj.redirect) finalRedirectUrl = stateObj.redirect;
        if (stateObj.userToken) sessionTokenToLink = stateObj.userToken;
      } catch {
        if (rawState.startsWith('http') || rawState.startsWith('exp://')) {
          finalRedirectUrl = rawState;
        } else if (rawState === 'mobile') {
          if (process.env.MOBILE_REDIRECT_URI) finalRedirectUrl = process.env.MOBILE_REDIRECT_URI;
        } else {
          sessionTokenToLink = rawState;
        }
      }
    }

    let finalSessionToken = null;

    if (sessionTokenToLink) {
      try {
        const session = await userService.getSessionByToken(sessionTokenToLink);
        if (session) {
          await userService.connectOAuthToUser(session.user.id, 'DISCORD', discordUser.id, {
            email: discordUser.email || `discord_${discordUser.username}@area.local`,
            name: discordUser.username,
            avatarUrl: discordUser.avatar
              ? `https://cdn.discordapp.com/avatars/${discordUser.id}/${discordUser.avatar}.png`
              : null,
            accessToken: accessToken,
          });
          finalSessionToken = sessionTokenToLink;
        }
      } catch (error) {
        console.error('[OAuth] Error linking Discord account:', error);
      }
    }

    if (!finalSessionToken) {
      const user = await userService.findOrCreateOAuthUser('DISCORD', discordUser.id, {
        email: discordUser.email || `discord_${discordUser.username}@area.local`,
        name: discordUser.username,
        avatarUrl: discordUser.avatar
          ? `https://cdn.discordapp.com/avatars/${discordUser.id}/${discordUser.avatar}.png`
          : null,
        accessToken: accessToken,
      });
      finalSessionToken = generateSessionToken();
      await userService.createSession(user.id, finalSessionToken);
    }

    const separator = finalRedirectUrl.includes('?') ? '&' : '?';
    return _reply.redirect(
      `${finalRedirectUrl}${separator}token=${encodeURIComponent(finalSessionToken)}&service=discord&connected=true`
    );
  } catch (error) {
    fastify.log.error(error);
    return _reply.status(500).send({ error: 'Authentication failed' });
  }
});

// --- GMAIL OAUTH ---
fastify.get('/api/auth/gmail', async (request, _reply) => {
  const query = request.query as { token?: string; state?: string };
  const redirectState = query.token || query.state;
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const redirectUri = process.env.GOOGLE_CALLBACK_URL;
  const scopes = [
    'https://www.googleapis.com/auth/userinfo.email',
    'https://www.googleapis.com/auth/userinfo.profile',
    'https://www.googleapis.com/auth/gmail.readonly',
    'https://www.googleapis.com/auth/gmail.send',
    'https://www.googleapis.com/auth/youtube.readonly',
    'https://www.googleapis.com/auth/youtube.force-ssl',
  ];
  const scope = encodeURIComponent(scopes.join(' '));

  if (!clientId || !redirectUri)
    return _reply.status(500).send({ error: 'Config Google manquante' });

  let authUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${encodeURIComponent(clientId)}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&scope=${scope}&access_type=offline&prompt=consent`;
  if (redirectState) authUrl += `&state=${encodeURIComponent(redirectState)}`;
  return _reply.redirect(authUrl);
});

fastify.get('/api/auth/gmail/callback', async (request, _reply) => {
  try {
    const query = request.query as { code?: string; error?: string; state?: string };
    const code = query.code;
    const error = query.error;
    const rawState = query.state;

    if (error) return _reply.status(401).send({ error: `Erreur Google: ${error}` });
    if (!code) return _reply.status(400).send({ error: 'Code manquant' });

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

    if (!tokenResponse.ok) return _reply.status(401).send({ error: `Token fail` });
    const tokenData = (await tokenResponse.json()) as {
      access_token: string;
      refresh_token?: string;
      expires_in?: number;
    };
    const accessToken = tokenData.access_token;
    const refreshToken = tokenData.refresh_token;

    const userResponse = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    if (!userResponse.ok) return _reply.status(401).send({ error: 'User info fail' });
    const googleUser = (await userResponse.json()) as {
      sub: string;
      email: string;
      name: string;
      given_name: string;
      picture: string;
    };

    let finalRedirectUrl = (process.env.FRONTEND_URL || 'http://localhost:8081') + '/login/success';
    let sessionTokenToLink = null;

    const userAgent = request.headers['user-agent']?.toLowerCase() || '';
    if (userAgent.includes('mobile') || userAgent.includes('okhttp')) {
      if (process.env.MOBILE_REDIRECT_URI) finalRedirectUrl = process.env.MOBILE_REDIRECT_URI;
    }

    if (rawState) {
      try {
        const stateObj = JSON.parse(rawState);
        if (stateObj.redirect) finalRedirectUrl = stateObj.redirect;
        if (stateObj.userToken) sessionTokenToLink = stateObj.userToken;
      } catch {
        if (rawState.startsWith('http') || rawState.startsWith('exp://')) {
          finalRedirectUrl = rawState;
        } else if (rawState === 'mobile') {
          if (process.env.MOBILE_REDIRECT_URI) finalRedirectUrl = process.env.MOBILE_REDIRECT_URI;
        } else {
          sessionTokenToLink = rawState;
        }
      }
    }

    let finalSessionToken = null;

    if (sessionTokenToLink) {
      try {
        const session = await userService.getSessionByToken(sessionTokenToLink);
        if (session) {
          const expiresAt = tokenData.expires_in
            ? new Date(Date.now() + tokenData.expires_in * 1000)
            : undefined;

          await userService.connectOAuthToUser(session.user.id, 'GOOGLE', googleUser.sub, {
            email: googleUser.email,
            name: googleUser.name || googleUser.given_name,
            avatarUrl: googleUser.picture,
            accessToken: accessToken,
            refreshToken: refreshToken,
            expiresAt: expiresAt,
          });
          finalSessionToken = sessionTokenToLink;
        }
      } catch (error) {
        console.error('[OAuth] Error linking Google account:', error);
      }
    }

    if (!finalSessionToken) {
      const user = await userService.findOrCreateOAuthUser('GOOGLE', googleUser.sub, {
        email: googleUser.email,
        name: googleUser.name || googleUser.given_name,
        avatarUrl: googleUser.picture,
        accessToken: accessToken,
        refreshToken: refreshToken,
      });
      finalSessionToken = generateSessionToken();
      await userService.createSession(user.id, finalSessionToken);
    }

    const separator = finalRedirectUrl.includes('?') ? '&' : '?';
    return _reply.redirect(
      `${finalRedirectUrl}${separator}token=${encodeURIComponent(finalSessionToken)}&service=gmail&connected=true`
    );
  } catch (error) {
    fastify.log.error(error);
    return _reply.status(500).send({ error: 'Auth failed' });
  }
});

// --- API USER OAUTH (GET / DELETE) ---
fastify.get('/api/user/oauth-accounts', async (request, _reply) => {
  try {
    const authHeader = request.headers.authorization;
    if (!authHeader) {
      return _reply.status(401).send({ error: 'No token provided' });
    }

    const token = authHeader.split(' ')[1];
    const session = await userService.getSessionByToken(token);

    if (!session) {
      return _reply.status(401).send({ error: 'Invalid token' });
    }

    const oauthAccounts = await prisma.oAuthAccount.findMany({
      where: { userId: session.user.id },
      select: {
        id: true,
        provider: true,
        email: true,
        name: true,
        avatarUrl: true,
        createdAt: true,
      },
    });

    return {
      success: true,
      accounts: oauthAccounts,
    };
  } catch (error) {
    fastify.log.error(error);
    return _reply.status(500).send({ error: 'Failed to fetch OAuth accounts' });
  }
});

fastify.delete('/api/user/oauth/:provider', async (request, _reply) => {
  try {
    const authHeader = request.headers.authorization;
    if (!authHeader) return _reply.status(401).send({ error: 'No token provided' });

    const token = authHeader.split(' ')[1];
    const session = await userService.getSessionByToken(token);
    if (!session) return _reply.status(401).send({ error: 'Invalid token' });

    const { provider } = request.params as { provider: string };

    await prisma.oAuthAccount.deleteMany({
      where: { userId: session.user.id, provider: provider.toUpperCase() },
    });

    return { success: true, message: `${provider} account disconnected` };
  } catch (error) {
    fastify.log.error(error);
    return _reply.status(500).send({ error: 'Failed to disconnect OAuth account' });
  }
});

// --- AREA MANAGEMENT ---
fastify.post('/api/areas', async (request, reply) => {
  try {
    const authHeader = request.headers.authorization;
    if (!authHeader) return reply.status(401).send({ error: 'Token required' });

    const token = authHeader.split(' ')[1];
    const session = await userService.getSessionByToken(token);
    if (!session) return reply.status(401).send({ error: 'Invalid session' });

    const {
      name,
      description,
      actionService,
      actionType,
      actionConfig,
      reactionService,
      reactionType,
      reactionConfig,
    } = request.body as CreateAreaRequest;

    if (!name || !actionService || !actionType || !reactionService || !reactionType) {
      return reply.status(400).send({ error: 'Missing required fields' });
    }

    const area = await areaService.createArea(session.user.id, {
      name,
      description,
      actionService,
      actionType,
      actionConfig,
      reactionService,
      reactionType,
      reactionConfig,
    });

    return reply.status(201).send({ success: true, area });
  } catch (error) {
    fastify.log.error(error);
    return reply.status(500).send({ error: 'Failed to create area' });
  }
});

fastify.get('/api/areas', async (request, reply) => {
  try {
    const authHeader = request.headers.authorization;
    if (!authHeader) return reply.status(401).send({ error: 'Token required' });

    const token = authHeader.split(' ')[1];
    const session = await userService.getSessionByToken(token);
    if (!session) return reply.status(401).send({ error: 'Invalid session' });

    const areas = await areaService.getAreasByUserId(session.user.id);
    return { success: true, areas };
  } catch (error) {
    fastify.log.error(error);
    return reply.status(500).send({ error: 'Failed to fetch areas' });
  }
});

fastify.put('/api/areas/:id/toggle', async (request, reply) => {
  try {
    const authHeader = request.headers.authorization;
    if (!authHeader) return reply.status(401).send({ error: 'Token required' });
    const token = authHeader.split(' ')[1];
    const session = await userService.getSessionByToken(token);
    if (!session) return reply.status(401).send({ error: 'Invalid session' });
    const { id } = request.params as IdParams;
    const area = await areaService.toggleArea(id, session.user.id);
    return { success: true, area };
  } catch (error) {
    fastify.log.error(error);
    return reply.status(404).send({ error: 'Area not found' });
  }
});

fastify.delete('/api/areas/:id', async (request, reply) => {
  try {
    const authHeader = request.headers.authorization;
    if (!authHeader) return reply.status(401).send({ error: 'Token required' });
    const token = authHeader.split(' ')[1];
    const session = await userService.getSessionByToken(token);
    if (!session) return reply.status(401).send({ error: 'Invalid session' });
    const { id } = request.params as IdParams;
    await areaService.deleteArea(id, session.user.id);
    return { success: true, message: 'Area deleted' };
  } catch (error) {
    fastify.log.error(error);
    return reply.status(404).send({ error: 'Area not found' });
  }
});

// --- SERVICES SPECIFIC ENDPOINTS ---
fastify.post('/api/area/gmail/send_email', async (request, _reply) => {
  try {
    const authHeader = request.headers.authorization;
    if (!authHeader) return _reply.status(401).send({ error: 'Token requis' });
    const token = authHeader.split(' ')[1];
    const session = await userService.getSessionByToken(token);
    if (!session) return _reply.status(401).send({ error: 'Session invalide' });
    const { to, subject, body } = request.body as { to: string; subject: string; body: string };
    if (!to || !subject || !body) return _reply.status(400).send({ error: 'Paramètres manquants' });
    const result = await gmailService.sendEmail(session.user.id, to, subject, body);
    return { success: true, message: 'Email envoyé', googleId: (result as { id: string }).id };
  } catch (error) {
    fastify.log.error(error);
    if ((error as Error).message.includes('RefreshToken'))
      return _reply.status(403).send({ error: 'Compte Google non connecté.' });
    return _reply
      .status(500)
      .send({ error: "Échec de l'envoi", details: (error as Error).message });
  }
});

fastify.get('/api/github/repos', async (request, _reply) => {
  try {
    const authHeader = request.headers.authorization;
    if (!authHeader) return _reply.status(401).send({ error: 'No token' });
    const token = authHeader.split(' ')[1];
    const session = await userService.getSessionByToken(token);
    if (!session) return _reply.status(401).send({ error: 'Invalid token' });
    const oauthAccount = await prisma.oAuthAccount.findFirst({
      where: { userId: session.user.id, provider: 'github' },
    });
    if (!oauthAccount || !oauthAccount.accessToken)
      return _reply.status(404).send({ error: 'Aucun compte GitHub connecté' });

    const response = await fetch('https://api.github.com/user/repos?sort=updated&per_page=100', {
      headers: {
        Authorization: `Bearer ${oauthAccount.accessToken}`,
        Accept: 'application/vnd.github.v3+json',
        'User-Agent': 'Area-App',
      },
    });

    if (!response.ok) return _reply.status(response.status).send({ error: 'Erreur GitHub API' });
    const repos = (await response.json()) as Array<{
      id: number;
      name: string;
      full_name: string;
      description: string;
      private: boolean;
      html_url: string;
    }>;
    const formattedRepos = Array.isArray(repos)
      ? repos.map((repo) => ({
          id: repo.id,
          name: repo.name,
          fullName: repo.full_name,
          private: repo.private,
          htmlUrl: repo.html_url,
          description: repo.description,
        }))
      : [];
    return { success: true, repositories: formattedRepos };
  } catch (error) {
    fastify.log.error(error);
    return _reply.status(500).send({ error: 'Erreur serveur' });
  }
});

// --- SPOTIFY OAUTH ---
fastify.get('/api/auth/spotify', async (request, _reply) => {
  const query = request.query as { token?: string; state?: string };
  const redirectState = query.token || query.state;
  const clientId = process.env.SPOTIFY_CLIENT_ID;
  const redirectUri = process.env.SPOTIFY_CALLBACK_URL;
  const scope = 'user-library-read playlist-modify-public playlist-modify-private';

  if (!clientId || !redirectUri)
    return _reply.status(500).send({ error: 'Config Spotify manquante' });

  const params = new URLSearchParams({
    response_type: 'code',
    client_id: clientId,
    scope: scope,
    redirect_uri: redirectUri,
  });

  if (redirectState) params.append('state', redirectState);

  return _reply.redirect(`https://accounts.spotify.com/authorize?${params.toString()}`);
});

fastify.get('/api/auth/spotify/callback', async (request, _reply) => {
  try {
    const query = request.query as { code?: string; error?: string; state?: string };
    const { code, error, state: rawState } = query;

    if (error) return _reply.status(401).send({ error });
    if (!code) return _reply.status(400).send({ error: 'No code' });

    const tokenRes = await fetch('https://accounts.spotify.com/api/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Authorization:
          'Basic ' +
          Buffer.from(
            process.env.SPOTIFY_CLIENT_ID + ':' + process.env.SPOTIFY_CLIENT_SECRET
          ).toString('base64'),
      },
      body: new URLSearchParams({
        code,
        redirect_uri: process.env.SPOTIFY_CALLBACK_URL!,
        grant_type: 'authorization_code',
      }),
    });

    if (!tokenRes.ok) {
      const errText = await tokenRes.text();
      console.error('Spotify Token Error:', errText);
      return _reply.status(401).send({ error: 'Failed to exchange code' });
    }

    const tokenData = (await tokenRes.json()) as {
      access_token: string;
      refresh_token: string;
      expires_in: number;
    };

    const userRes = await fetch('https://api.spotify.com/v1/me', {
      headers: { Authorization: `Bearer ${tokenData.access_token}` },
    });

    if (!userRes.ok) return _reply.status(401).send({ error: 'Failed to fetch user info' });

    const spotifyUser = (await userRes.json()) as {
      id: string;
      display_name: string;
      images?: { url: string }[];
      email: string;
    };

    let finalRedirectUrl = (process.env.FRONTEND_URL || 'http://localhost:8081') + '/login/success';
    let sessionTokenToLink = null;

    const userAgent = request.headers['user-agent']?.toLowerCase() || '';
    if (userAgent.includes('mobile') || userAgent.includes('okhttp')) {
      if (process.env.MOBILE_REDIRECT_URI) finalRedirectUrl = process.env.MOBILE_REDIRECT_URI;
    }

    if (rawState) {
      try {
        const stateObj = JSON.parse(rawState);
        if (stateObj.redirect) finalRedirectUrl = stateObj.redirect;
        if (stateObj.userToken) sessionTokenToLink = stateObj.userToken;
      } catch {
        if (rawState.startsWith('http') || rawState.startsWith('exp://')) {
          finalRedirectUrl = rawState;
        } else if (rawState === 'mobile') {
          if (process.env.MOBILE_REDIRECT_URI) finalRedirectUrl = process.env.MOBILE_REDIRECT_URI;
        } else {
          sessionTokenToLink = rawState;
        }
      }
    }

    let finalSessionToken = null;

    if (sessionTokenToLink) {
      try {
        const session = await userService.getSessionByToken(sessionTokenToLink);
        if (session) {
          const expiresAt = new Date(Date.now() + tokenData.expires_in * 1000);

          await userService.connectOAuthToUser(session.user.id, 'SPOTIFY', spotifyUser.id, {
            email: spotifyUser.email || `spotify_${spotifyUser.id}@area.local`,
            name: spotifyUser.display_name,
            avatarUrl: spotifyUser.images?.[0]?.url || null,
            accessToken: tokenData.access_token,
            refreshToken: tokenData.refresh_token,
            expiresAt: expiresAt,
          });
          finalSessionToken = sessionTokenToLink;
        }
      } catch (err) {
        console.error('[OAuth] Error linking Spotify account:', err);
      }
    }

    if (!finalSessionToken) {
      const expiresAt = new Date(Date.now() + tokenData.expires_in * 1000);

      const user = await userService.findOrCreateOAuthUser('SPOTIFY', spotifyUser.id, {
        email: spotifyUser.email || `spotify_${spotifyUser.id}@area.local`,
        name: spotifyUser.display_name,
        avatarUrl: spotifyUser.images?.[0]?.url || null,
        accessToken: tokenData.access_token,
        refreshToken: tokenData.refresh_token,
        expiresAt: expiresAt,
      });

      finalSessionToken = generateSessionToken();
      await userService.createSession(user.id, finalSessionToken);
    }

    const separator = finalRedirectUrl.includes('?') ? '&' : '?';
    return _reply.redirect(
      `${finalRedirectUrl}${separator}token=${encodeURIComponent(finalSessionToken)}&service=spotify&connected=true`
    );
  } catch (err) {
    fastify.log.error(err);
    return _reply.status(500).send({ error: 'Auth failed' });
  }
});

// --- SERVER STARTUP ---
const start = async () => {
  try {
    const port = parseInt(process.env.PORT || '8080');
    const host = process.env.HOST || '0.0.0.0';
    await fastify.listen({ port, host });
    console.log(`Server running at http://${host}:${port}`);

    // Start hook executor with 15 second interval
    hookExecutor.startWithSeconds(15);
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

process.on('SIGTERM', async () => {
  hookExecutor.stop();
  await fastify.close();
  await prisma.$disconnect();
  process.exit(0);
});
process.on('SIGINT', async () => {
  hookExecutor.stop();
  await fastify.close();
  await prisma.$disconnect();
  process.exit(0);
});

start();
