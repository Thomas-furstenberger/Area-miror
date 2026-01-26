import Fastify from 'fastify';
import cors from '@fastify/cors';
import swagger from '@fastify/swagger';
import swaggerUi from '@fastify/swagger-ui';
import { PrismaClient } from '@prisma/client';
import 'dotenv/config';
import { UserService } from './user.service';
import { GmailService } from './reactions/gmail.reaction';
import { AreaService } from './area.service';
import { HookExecutor } from './hook.executor';
import { swaggerOptions, swaggerUiOptions } from './swagger.config';
import { registerRoutes } from './routes';

const fastify = Fastify({
  logger: true,
});

fastify.register(cors, {
  origin: true,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
});

fastify.register(swagger, swaggerOptions);
fastify.register(swaggerUi, swaggerUiOptions);

const prisma = new PrismaClient();
const hookExecutor = new HookExecutor(prisma);
const userService = new UserService(prisma);
const gmailService = new GmailService(prisma);
const areaService = new AreaService(prisma);

// Register all routes
fastify.register(async function (fastify) {
  await registerRoutes(fastify, prisma, userService, gmailService, areaService);
});

// --- SERVER STARTUP ---
const start = async () => {
  try {
    const port = parseInt(process.env.PORT || '8080');
    const host = process.env.HOST || '0.0.0.0';
    await fastify.listen({ port, host });
    console.log(`Server running at http://${host}:${port}`);
    console.log(`Swagger documentation available at http://${host}:${port}/documentation`);

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
