import { PrismaClient } from '@prisma/client';

export class SessionRepository {
  constructor(private prisma: PrismaClient) {}

  async createSession(userId: number, token: string, expiresAt: Date) {
    return this.prisma.session.create({
      data: {
        userId,
        token,
        expiresAt,
      },
    });
  }

  async findSessionByToken(token: string) {
    return this.prisma.session.findUnique({
      where: { token },
      include: { user: true },
    });
  }

  async deleteSession(token: string) {
    return this.prisma.session.delete({
      where: { token },
    });
  }

  async deleteExpiredSessions() {
    return this.prisma.session.deleteMany({
      where: {
        expiresAt: {
          lt: new Date(),
        },
      },
    });
  }

  async findByUserId(userId: number) {
    return this.prisma.session.findMany({
      where: { userId },
    });
  }
}
