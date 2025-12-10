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

const handleAuthRedirect = (
  reply: {
    redirect: (url: string) => void;
    type: (type: string) => { send: (html: string) => void };
  },
  token: string,
  state?: string,
  userAgent?: string
) => {
  if (
    state &&
    (state.startsWith('exp://') || state.startsWith('http://') || state.startsWith('https://'))
  ) {
    console.log(`[OAuth] Redirection dynamique vers : ${state}`);
    const separator = state.includes('?') ? '&' : '?';
    return reply.redirect(`${state}${separator}token=${token}`);
  }

  const envMobileUri = process.env.MOBILE_REDIRECT_URI;
  const isMobile =
    userAgent &&
    (userAgent.toLowerCase().includes('mobile') ||
      userAgent.toLowerCase().includes('android') ||
      userAgent.toLowerCase().includes('iphone'));

  if (isMobile && envMobileUri) {
    console.log(`[OAuth] Redirection forcée via .env vers : ${envMobileUri}`);
    const separator = envMobileUri.includes('?') ? '&' : '?';
    return reply.redirect(`${envMobileUri}${separator}token=${token}`);
  }

  const frontendUrl = process.env.FRONTEND_URL;
  if (!isMobile && frontendUrl) {
    return reply.redirect(`${frontendUrl}/login/success?token=${token}`);
  }

  console.log('[OAuth] Aucune URL de redirection trouvée -> Affichage HTML');
  return reply.type('text/html').send(`
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Connexion Réussie</title>
        <style>
          body { font-family: -apple-system, system-ui, sans-serif; display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 100vh; background: #1a202c; color: white; margin: 0; padding: 20px; text-align: center; }
          .card { background: #2d3748; padding: 2rem; border-radius: 1rem; box-shadow: 0 10px 15px -3px rgba(0,0,0,0.3); width: 100%; max-width: 400px; }
          .token-box { background: #4a5568; padding: 15px; border-radius: 8px; word-break: break-all; margin: 20px 0; font-family: monospace; font-size: 0.9rem; border: 1px solid #718096; user-select: all; color: #a0aec0; }
          h1 { margin-top: 0; font-size: 1.5rem; color: #fff; }
          .success-icon { font-size: 3rem; margin-bottom: 1rem; }
          .btn { background: #4299e1; color: white; border: none; padding: 10px 20px; border-radius: 5px; font-weight: bold; cursor: pointer; margin-top: 10px; width: 100%; }
        </style>
      </head>
      <body>
        <div class="card">
          <div class="success-icon">⚠️</div>
          <h1>Redirection automatique impossible</h1>
          <p>Ajoutez <code>MOBILE_REDIRECT_URI</code> dans votre .env pour corriger cela.</p>
          <div class="token-box" id="token">${token}</div>
          <button class="btn" onclick="copyToken()">Copier le Token</button>
        </div>
        <script>
          function copyToken() {
            const token = document.getElementById('token').innerText;
            navigator.clipboard.writeText(token).then(() => alert('Token copié !'));
          }
        </script>
      </body>
    </html>
  `);
};

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

    // Auto-login: create session
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

// GitHub OAuth login initiation
fastify.get('/api/auth/github', async (request, _reply) => {
  const query = request.query as { token?: string };
  const clientId = process.env.GITHUB_CLIENT_ID;
  const redirectUri = process.env.GITHUB_CALLBACK_URL;
  const scope = 'user:email,read:user';

  let authUrl = `https://github.com/login/oauth/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&scope=${scope}`;

  if (query.token) {
    authUrl += `&state=${encodeURIComponent(query.token)}`;
  }

  return _reply.redirect(authUrl);
});

// GitHub OAuth callback
fastify.get('/api/auth/github/callback', async (request, _reply) => {
  try {
    const query = request.query as { code?: string; error?: string; state?: string };
    const code = query.code;
    const error = query.error;
    const state = query.state;

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

    if (state && !state.startsWith('exp://') && !state.includes('://') && state !== 'mobile') {
      try {
        const session = await userService.getSessionByToken(state);
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

          const userAgent = request.headers['user-agent'];
          if (userAgent?.toLowerCase().includes('mobile')) {
            const envMobileUri = process.env.MOBILE_REDIRECT_URI;
            if (envMobileUri) {
              return _reply.redirect(
                `${envMobileUri}?token=${encodeURIComponent(state)}&service=github&connected=true`
              );
            }
          }
          const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:8081';
          return _reply.redirect(
            `${frontendUrl}/services?token=${encodeURIComponent(state)}&service=github&connected=true`
          );
        }
      } catch (error) {
        console.error('[OAuth] Error connecting account:', error);
      }
    }

    const user = await userService.findOrCreateOAuthUser('GITHUB', githubUser.id.toString(), {
      email: githubUser.email || `github_${githubUser.login}@area.local`,
      name: githubUser.name || githubUser.login,
      avatarUrl: githubUser.avatar_url,
      accessToken: accessToken,
    });

    const sessionToken = generateSessionToken();
    await userService.createSession(user.id, sessionToken);

    return handleAuthRedirect(_reply, sessionToken, state, request.headers['user-agent']);
  } catch (error) {
    fastify.log.error(error);
    return _reply.status(500).send({ error: 'Authentication failed' });
  }
});

// Get user's connected OAuth accounts
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

// DELETE endpoint for disconnecting OAuth account (RESTful)
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

// Discord OAuth login initiation
fastify.get('/api/auth/discord', async (request, _reply) => {
  const query = request.query as { token?: string };
  const clientId = process.env.DISCORD_CLIENT_ID;
  const redirectUri = process.env.DISCORD_CALLBACK_URL;
  const scope = 'identify email';

  if (!clientId || !redirectUri)
    return _reply.status(500).send({ error: 'Configuration Discord manquante' });

  let authUrl = `https://discord.com/api/oauth2/authorize?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&scope=${encodeURIComponent(scope)}`;
  if (query.token) authUrl += `&state=${encodeURIComponent(query.token)}`;

  return _reply.redirect(authUrl);
});

// Discord OAuth callback
fastify.get('/api/auth/discord/callback', async (request, _reply) => {
  try {
    const query = request.query as { code?: string; error?: string; state?: string };
    const code = query.code;
    const error = query.error;
    const state = query.state;

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

    if (state && !state.startsWith('exp://') && !state.includes('://')) {
      try {
        const session = await userService.getSessionByToken(state);
        if (session) {
          await userService.connectOAuthToUser(session.user.id, 'DISCORD', discordUser.id, {
            email: discordUser.email || `discord_${discordUser.username}@area.local`,
            name: discordUser.username,
            avatarUrl: discordUser.avatar
              ? `https://cdn.discordapp.com/avatars/${discordUser.id}/${discordUser.avatar}.png`
              : null,
            accessToken: accessToken,
          });
          const userAgent = request.headers['user-agent'];
          if (userAgent?.toLowerCase().includes('mobile')) {
            const envMobileUri = process.env.MOBILE_REDIRECT_URI;
            if (envMobileUri) {
              return _reply.redirect(
                `${envMobileUri}?token=${encodeURIComponent(state)}&service=discord&connected=true`
              );
            }
          }
          const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:8081';
          return _reply.redirect(
            `${frontendUrl}/services?token=${encodeURIComponent(state)}&service=discord&connected=true`
          );
        }
      } catch (error) {
        console.error('[OAuth] Error connecting account:', error);
      }
    }

    const user = await userService.findOrCreateOAuthUser('DISCORD', discordUser.id, {
      email: discordUser.email || `discord_${discordUser.username}@area.local`,
      name: discordUser.username,
      avatarUrl: discordUser.avatar
        ? `https://cdn.discordapp.com/avatars/${discordUser.id}/${discordUser.avatar}.png`
        : null,
      accessToken: accessToken,
    });

    const sessionToken = generateSessionToken();
    await userService.createSession(user.id, sessionToken);

    return handleAuthRedirect(_reply, sessionToken, state, request.headers['user-agent']);
  } catch (error) {
    fastify.log.error(error);
    return _reply.status(500).send({ error: 'Authentication failed' });
  }
});

const start = async () => {
  try {
    await fastify.listen({
      port: parseInt(process.env.PORT || '3000'),
      host: process.env.HOST || '0.0.0.0',
    });
    console.log(`Server running on http://localhost:${process.env.PORT || 3000}`);
    hookExecutor.start(2);
    console.log('Hook executor started');
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

fastify.get('/api/auth/gmail', async (request, _reply) => {
  const query = request.query as { token?: string };
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const redirectUri = process.env.GOOGLE_CALLBACK_URL;
  const scopes = [
    'https://www.googleapis.com/auth/userinfo.email',
    'https://www.googleapis.com/auth/userinfo.profile',
    'https://www.googleapis.com/auth/gmail.readonly',
  ];
  const scope = encodeURIComponent(scopes.join(' '));

  if (!clientId || !redirectUri)
    return _reply.status(500).send({ error: 'Config Google manquante' });

  let authUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${encodeURIComponent(clientId)}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&scope=${scope}&access_type=offline&prompt=consent`;
  if (query.token) authUrl += `&state=${encodeURIComponent(query.token)}`;

  return _reply.redirect(authUrl);
});

fastify.get('/api/auth/gmail/callback', async (request, _reply) => {
  try {
    const query = request.query as { code?: string; error?: string; state?: string };
    const code = query.code;
    const error = query.error;
    const state = query.state;

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

    if (state && !state.startsWith('exp://') && !state.includes('://')) {
      try {
        const session = await userService.getSessionByToken(state);
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
          const userAgent = request.headers['user-agent'];
          if (userAgent?.toLowerCase().includes('mobile')) {
            const envMobileUri = process.env.MOBILE_REDIRECT_URI;
            if (envMobileUri) {
              return _reply.redirect(
                `${envMobileUri}?token=${encodeURIComponent(state)}&service=gmail&connected=true`
              );
            }
          }
          const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:8081';
          return _reply.redirect(
            `${frontendUrl}/services?token=${encodeURIComponent(state)}&service=gmail&connected=true`
          );
        }
      } catch (error) {
        console.error('[OAuth] Error connecting account:', error);
      }
    }

    const user = await userService.findOrCreateOAuthUser('GOOGLE', googleUser.sub, {
      email: googleUser.email,
      name: googleUser.name || googleUser.given_name,
      avatarUrl: googleUser.picture,
      accessToken: accessToken,
      refreshToken: refreshToken,
    });

    const sessionToken = generateSessionToken();
    await userService.createSession(user.id, sessionToken);

    return handleAuthRedirect(_reply, sessionToken, state, request.headers['user-agent']);
  } catch (error) {
    fastify.log.error(error);
    return _reply.status(500).send({ error: 'Auth failed' });
  }
});

// AREA endpoints
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

// Gmail send email
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

// GitHub Repos
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
