import Fastify from 'fastify';
import cors from '@fastify/cors';
import { PrismaClient } from '@prisma/client';
import 'dotenv/config';
import { UserService } from './user.service';
import { generateAccessToken, generateSessionToken } from './auth';
import { SERVICES } from './services.config';
import { GmailService } from './gmail.service';
import { AreaService } from './area.service';
import { HookExecutor } from './hook.executor';

const fastify = Fastify({
  logger: true,
});

// Register CORS to allow frontend requests
fastify.register(cors, {
  origin: [
    'http://localhost:5173',
    'http://localhost:8081',
    'http://172.20.10.10:3000',
    'http://172.20.10.10:8081',
    'https://web-production-963ad.up.railway.app',
    'https://mobile-production-e73e.up.railway.app',
    /^http:\/\/192\.168\.\d+\.\d+:\d+$/, // Allow local network IPs
    /^http:\/\/172\.\d+\.\d+\.\d+:\d+$/, // Allow 172.x.x.x IPs
    /^http:\/\/10\.\d+\.\d+\.\d+:\d+$/,  // Allow 10.x.x.x IPs
  ],
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
fastify.post('/api/auth/register', async (request, _reply) => {
  try {
    const { email, password, name } = request.body as { email: string; password: string; name?: string };

    if (!email || !password) {
      return _reply.status(400).send({ error: 'Email and password are required' });
    }

    const user = await userService.registerUser(email, password, name);

    return _reply.status(201).send({
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

    // Check if session is expired
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
  const clientId = process.env.GITHUB_CLIENT_ID;
  const redirectUri = process.env.GITHUB_CALLBACK_URL;
  const scope = 'user:email,read:user';

  const authUrl = `https://github.com/login/oauth/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&scope=${scope}`;

  return _reply.redirect(authUrl);
});

// GitHub OAuth callback
fastify.get('/api/auth/github/callback', async (request, _reply) => {
  try {
    const query = request.query as { code?: string; error?: string };
    const code = query.code;
    const error = query.error;

    if (error) {
      return _reply.status(401).send({ error: `GitHub error: ${error}` });
    }

    if (!code) {
      return _reply.status(400).send({ error: 'No authorization code received' });
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
      return _reply.status(401).send({ error: 'Failed to exchange code for token' });
    }

    const tokenData = await tokenResponse.json() as { access_token: string; error?: string };

    if (tokenData.error) {
      return _reply.status(401).send({ error: `Token error: ${tokenData.error}` });
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
      return _reply.status(401).send({ error: 'Failed to fetch user info' });
    }

    const githubUser = await userResponse.json() as { id: number; email: string; login: string; name: string; avatar_url: string };

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

    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    return _reply.redirect(`${frontendUrl}/login/success?token=${sessionToken}`);
  } catch (error) {
    fastify.log.error(error);
    return _reply.status(500).send({ error: 'Authentication failed', details: (error as Error).message });
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

// Disconnect OAuth account
fastify.post('/api/user/oauth/disconnect/:provider', async (request, _reply) => {
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

    const { provider } = request.params as { provider: string };

    // Check user has at least one password-based auth
    const oauthAccounts = await prisma.oAuthAccount.findMany({
      where: { userId: session.user.id },
    });

    if (oauthAccounts.length === 1 && provider === 'github') {
      return _reply.status(400).send({ error: 'Cannot disconnect only auth method' });
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
    return _reply.status(500).send({ error: 'Failed to disconnect OAuth account' });
  }
});

// Discord OAuth login initiation
fastify.get('/api/auth/discord', async (request, _reply) => {
  const clientId = process.env.DISCORD_CLIENT_ID;
  const redirectUri = process.env.DISCORD_CALLBACK_URL;
  const scope = 'identify email';

  if (!clientId || !redirectUri) {
    return _reply.status(500).send({ error: 'Configuration Discord manquante (CLIENT_ID ou CALLBACK_URL)' });
  }

  const authUrl = `https://discord.com/api/oauth2/authorize?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&scope=${encodeURIComponent(scope)}`;

  return _reply.redirect(authUrl);
});

// Discord OAuth callback
fastify.get('/api/auth/discord/callback', async (request, _reply) => {
  try {
    const query = request.query as { code?: string; error?: string };
    const code = query.code;
    const error = query.error;

    if (error) {
      return _reply.status(401).send({ error: `Discord error: ${error}` });
    }

    if (!code) {
      return _reply.status(400).send({ error: 'No authorization code received' });
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
      return _reply.status(401).send({ error: 'Failed to exchange code for token' });
    }

    const tokenData = await tokenResponse.json() as { access_token: string };
    const accessToken = tokenData.access_token;

    // Fetch user info from Discord
    const userResponse = await fetch('https://discord.com/api/users/@me', {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
    });

    if (!userResponse.ok) {
      return _reply.status(401).send({ error: 'Failed to fetch user info' });
    }

    const discordUser = await userResponse.json() as { id: string; email: string; username: string; avatar: string | null };

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

    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    return _reply.redirect(`${frontendUrl}/login/success?token=${sessionToken}`);
  } catch (error) {
    fastify.log.error(error);
    return _reply.status(500).send({ error: 'Authentication failed', details: (error as Error).message });
  }
});

const start = async () => {
  try {
    await fastify.listen({ port: parseInt(process.env.PORT || '3000'), host: process.env.HOST || '0.0.0.0' });
    console.log(`Server running on http://localhost:${process.env.PORT || 3000}`);

    // Start the hook executor
    hookExecutor.start(2); // Check every 2 minutes
    console.log('Hook executor started');
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

// login with gmail google
fastify.get('/api/auth/gmail', async (request, _reply) => {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const redirectUri = process.env.GOOGLE_CALLBACK_URL;

  const scopes = [
    'https://www.googleapis.com/auth/userinfo.email',
    'https://www.googleapis.com/auth/userinfo.profile',
    'https://www.googleapis.com/auth/gmail.modify'
  ];
  const scope = encodeURIComponent(scopes.join(' '));

  if (!clientId || !redirectUri) {
    return _reply.status(500).send({ error: 'Configuration Google manquante (CLIENT_ID ou CALLBACK_URL)' });
  }

  const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${encodeURIComponent(clientId)}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&scope=${scope}&access_type=offline&prompt=consent`;

  console.log('[Gmail OAuth] Authorization URL:', authUrl);
  return _reply.redirect(authUrl);
});

// Google gmail OAuth callback
fastify.get('/api/auth/gmail/callback', async (request, _reply) => {
  try {
    const query = request.query as { code?: string; error?: string; state?: string };
    const code = query.code;
    const error = query.error;

    if (error) {
      return _reply.status(401).send({ error: `Erreur Google: ${error}` });
    }
    if (!code) {
      return _reply.status(400).send({ error: 'Code d\'autorisation manquant' });
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
      return _reply.status(401).send({ error: `Échec de l'échange de token: ${errText}` });
    }

    const tokenData = await tokenResponse.json() as { access_token: string; refresh_token?: string };
    const accessToken = tokenData.access_token;
    const refreshToken = tokenData.refresh_token;

    const userResponse = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    if (!userResponse.ok) {
      return _reply.status(401).send({ error: 'Impossible de récupérer le profil utilisateur' });
    }

    const googleUser = await userResponse.json() as { sub: string; email: string; name?: string; given_name?: string; picture?: string };

    const user = await userService.findOrCreateOAuthUser('GOOGLE', googleUser.sub, {
      email: googleUser.email,
      name: googleUser.name || googleUser.given_name,
      avatarUrl: googleUser.picture,
      accessToken: accessToken,
      refreshToken: refreshToken,
    });

    const sessionToken = generateSessionToken();
    await userService.createSession(user.id, sessionToken);

    // Check if request is from mobile (via state parameter or user-agent)
    const isMobile = query.state === 'mobile';

    if (isMobile) {
      // For mobile, return a simple HTML page that displays the token
      return _reply.type('text/html').send(`
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Login Success</title>
            <style>
              body {
                font-family: system-ui, -apple-system, sans-serif;
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                min-height: 100vh;
                margin: 0;
                padding: 20px;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white;
              }
              .container {
                background: rgba(255, 255, 255, 0.1);
                backdrop-filter: blur(10px);
                padding: 30px;
                border-radius: 20px;
                text-align: center;
                max-width: 400px;
              }
              h1 { margin: 0 0 20px 0; font-size: 24px; }
              .token {
                background: rgba(0, 0, 0, 0.2);
                padding: 15px;
                border-radius: 10px;
                word-break: break-all;
                font-family: monospace;
                font-size: 12px;
                margin: 20px 0;
              }
              button {
                background: white;
                color: #667eea;
                border: none;
                padding: 12px 30px;
                border-radius: 25px;
                font-size: 16px;
                font-weight: 600;
                cursor: pointer;
                margin: 10px;
              }
              .success { font-size: 48px; margin-bottom: 10px; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="success">✅</div>
              <h1>Connexion réussie !</h1>
              <p>Copiez votre token et retournez à l'application :</p>
              <div class="token" id="token">${sessionToken}</div>
              <button onclick="copyToken()">📋 Copier le token</button>
              <p style="font-size: 12px; margin-top: 20px; opacity: 0.8;">
                Fermez cette page après avoir copié le token
              </p>
            </div>
            <script>
              function copyToken() {
                const token = document.getElementById('token').textContent;
                navigator.clipboard.writeText(token).then(() => {
                  alert('Token copié ! Retournez à l\\'application et collez-le.');
                }).catch(() => {
                  // Fallback for older browsers
                  const textArea = document.createElement('textarea');
                  textArea.value = token;
                  document.body.appendChild(textArea);
                  textArea.select();
                  document.execCommand('copy');
                  document.body.removeChild(textArea);
                  alert('Token copié ! Retournez à l\\'application et collez-le.');
                });
              }
            </script>
          </body>
        </html>
      `);
    }

    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    return _reply.redirect(`${frontendUrl}/login/success?token=${sessionToken}`);

  } catch (error) {
    fastify.log.error(error);
    return _reply.status(500).send({ error: 'Authentification Google échouée', details: (error as Error).message });
  }
});

// AREA endpoints
// Create a new AREA
fastify.post('/api/areas', async (request, reply) => {
  try {
    const authHeader = request.headers.authorization;
    if (!authHeader) return reply.status(401).send({ error: 'Token required' });

    const token = authHeader.split(' ')[1];
    const session = await userService.getSessionByToken(token);
    if (!session) return reply.status(401).send({ error: 'Invalid session' });

    const { name, description, actionService, actionType, actionConfig, reactionService, reactionType, reactionConfig } = request.body as CreateAreaRequest;

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

// Get all user's AREAs
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

// Toggle AREA active status
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

// Delete AREA
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
    if (!session) return _reply.status(401).send({ error: 'Session invalide ou expirée' });

    const { to, subject, body } = request.body as { to: string; subject: string; body: string };

    if (!to || !subject || !body) {
      return _reply.status(400).send({ 
        error: 'Paramètres manquants', 
        required: ['to', 'subject', 'body'] 
      });
    }

    const result = await gmailService.sendEmail(session.user.id, to, subject, body);

    return { 
      success: true, 
      message: 'Email envoyé avec succès', 
      googleId: (result as { id: string }).id
    };

  } catch (error) {
    fastify.log.error(error);
    if ((error as Error).message.includes('RefreshToken')) {
        return _reply.status(403).send({ error: 'L\'utilisateur n\'a pas connecté son compte Google.' });
    }
    return _reply.status(500).send({ error: 'Échec de l\'envoi', details: (error as Error).message });
  }
});

// login with google drive
fastify.get('/api/auth/google-drive', async (request, _reply) => {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const redirectUri = process.env.DRIVE_CALLBACK_URL;
  
  const scope = 'https://www.googleapis.com/auth/userinfo.email https://www.googleapis.com/auth/userinfo.profile https://www.googleapis.com/auth/drive';

  if (!clientId || !redirectUri) {
    return _reply.status(500).send({ error: 'Configuration Google manquante' });
  }

  const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${redirectUri}&response_type=code&scope=${scope}&access_type=offline&prompt=consent`;

  return _reply.redirect(authUrl);
});

// Google drive OAuth callback
fastify.get('/api/auth/drive/callback', async (request, _reply) => {
  try {
    const query = request.query as { code?: string; error?: string };
    const code = query.code;
    const error = query.error;

    if (error) {
      return _reply.status(401).send({ error: `Erreur Google: ${error}` });
    }
    if (!code) {
      return _reply.status(400).send({ error: 'Code d\'autorisation manquant' });
    }

    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code: code,
        client_id: process.env.GOOGLE_CLIENT_ID || '',
        client_secret: process.env.GOOGLE_CLIENT_SECRET || '',
        redirect_uri: process.env.DRIVE_CALLBACK_URL || '',
        grant_type: 'authorization_code',
      }),
    });

    if (!tokenResponse.ok) {
      const errText = await tokenResponse.text();
      return _reply.status(401).send({ error: `Échec de l'échange de token: ${errText}` });
    }

    const tokenData = await tokenResponse.json() as { access_token: string; refresh_token?: string };
    const accessToken = tokenData.access_token;
    const refreshToken = tokenData.refresh_token;

    const userResponse = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    if (!userResponse.ok) {
      return _reply.status(401).send({ error: 'Impossible de récupérer le profil utilisateur' });
    }

    const googleUser = await userResponse.json() as { sub: string; email: string; name?: string; given_name?: string; picture?: string };

    const user = await userService.findOrCreateOAuthUser('GOOGLE_DRIVE', googleUser.sub, {
      email: googleUser.email,
      name: googleUser.name || googleUser.given_name,
      avatarUrl: googleUser.picture,
      accessToken: accessToken,
      refreshToken: refreshToken,
    });

    const sessionToken = generateSessionToken();
    await userService.createSession(user.id, sessionToken);

    return _reply.redirect(`http://localhost:8081/login/success?token=${sessionToken}`);

  } catch (error) {
    fastify.log.error(error);
    return _reply.status(500).send({ error: 'Authentification Google échouée', details: (error as Error).message });
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