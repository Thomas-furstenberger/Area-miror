import Fastify from 'fastify';
import cors from '@fastify/cors';
import { PrismaClient } from '@prisma/client';

const fastify = Fastify({ logger: true });
const prisma = new PrismaClient();

// Register CORS
fastify.register(cors, { origin: true });

// Health check
fastify.get('/health', async (request, reply) => {
  return { status: 'ok' };
});

// GET all notes
fastify.get<{ Querystring: { limit?: string; offset?: string } }>(
  '/api/notes',
  async (request, reply) => {
    try {
      const limit = request.query.limit ? parseInt(request.query.limit) : 10;
      const offset = request.query.offset ? parseInt(request.query.offset) : 0;

      const notes = await prisma.note.findMany({
        take: limit,
        skip: offset,
        orderBy: { createdAt: 'desc' },
      });

      return notes;
    } catch (error) {
      reply.code(500);
      return { error: 'Failed to fetch notes' };
    }
  }
);

// GET single note
fastify.get<{ Params: { id: string } }>('/api/notes/:id', async (request, reply) => {
  try {
    const note = await prisma.note.findUniqueOrThrow({
      where: { id: parseInt(request.params.id) },
    });
    return note;
  } catch (error: any) {
    if (error.code === 'P2025') {
      reply.code(404);
      return { error: 'Note not found' };
    }
    reply.code(500);
    return { error: 'Failed to fetch note' };
  }
});

// POST create note
fastify.post<{ Body: { title: string; content: string } }>(
  '/api/notes',
  async (request, reply) => {
    try {
      if (!request.body.title || !request.body.content) {
        reply.code(400);
        return { error: 'Title and content are required' };
      }

      const note = await prisma.note.create({
        data: {
          title: request.body.title,
          content: request.body.content,
        },
      });

      reply.code(201);
      return note;
    } catch (error) {
      reply.code(500);
      return { error: 'Failed to create note' };
    }
  }
);

// PATCH update note
fastify.patch<{ Params: { id: string }; Body: { title?: string; content?: string } }>(
  '/api/notes/:id',
  async (request, reply) => {
    try {
      const note = await prisma.note.update({
        where: { id: parseInt(request.params.id) },
        data: {
          title: request.body.title,
          content: request.body.content,
        },
      });

      return note;
    } catch (error: any) {
      if (error.code === 'P2025') {
        reply.code(404);
        return { error: 'Note not found' };
      }
      reply.code(500);
      return { error: 'Failed to update note' };
    }
  }
);

// DELETE note
fastify.delete<{ Params: { id: string } }>('/api/notes/:id', async (request, reply) => {
  try {
    await prisma.note.delete({
      where: { id: parseInt(request.params.id) },
    });

    return { success: true };
  } catch (error: any) {
    if (error.code === 'P2025') {
      reply.code(404);
      return { error: 'Note not found' };
    }
    reply.code(500);
    return { error: 'Failed to delete note' };
  }
});

// Start server
const start = async () => {
  try {
    await fastify.listen({ port: 3000, host: '0.0.0.0' });
    console.log('Server running on http://localhost:3000');
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();
