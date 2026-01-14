import { FastifySwaggerUiOptions } from '@fastify/swagger-ui';

export const swaggerOptions = {
  openapi: {
    openapi: '3.0.0',
    info: {
      title: 'AREA API Documentation',
      description:
        'REST API for AREA platform - Automate your tasks by connecting your favorite services. Create powerful automation workflows (IF This THEN That) with GitHub, Discord, Gmail, YouTube, Spotify, and more.',
      version: '1.0.0',
      contact: {
        name: 'AREA Team',
        email: 'contact@area.com',
      },
      license: {
        name: 'MIT',
      },
    },
    servers: [
      {
        url: 'http://localhost:8080',
        description: 'Development server',
      },
      {
        url: 'https://area-api.example.com',
        description: 'Production server',
      },
    ],
    tags: [
      {
        name: 'Health',
        description: 'API health check and status endpoints',
      },
      {
        name: 'Authentication',
        description: 'User authentication and session management. Register, login, and manage user accounts with traditional email/password authentication.',
      },
      {
        name: 'OAuth',
        description: 'OAuth2 authentication with external service providers (GitHub, Discord, Google/Gmail, Spotify). Use these endpoints to link accounts or authenticate users through third-party services.',
      },
      {
        name: 'Areas',
        description: 'Automation workflow management (AREAs). Create, list, enable/disable, and delete automation workflows that connect triggers (actions) from one service to reactions in another service.',
      },
      {
        name: 'Services',
        description: 'Available services catalog and service-specific operations. Get information about all supported integrations and their available actions and reactions.',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http' as const,
          scheme: 'bearer' as const,
          bearerFormat: 'JWT',
          description: 'JWT authentication using Bearer token. Include the session token in the Authorization header: "Bearer <your_token_here>". Obtain tokens through /api/auth/register, /api/auth/login, or OAuth endpoints.',
        },
      },
    },
  },
};

export const swaggerUiOptions: FastifySwaggerUiOptions = {
  routePrefix: '/documentation',
  uiConfig: {
    docExpansion: 'list',
    deepLinking: true,
  },
  staticCSP: true,
};
