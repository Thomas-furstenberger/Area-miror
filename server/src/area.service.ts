import { PrismaClient, Prisma } from '@prisma/client';

export class AreaService {
  constructor(private prisma: PrismaClient) {}

  async createArea(userId: number, data: {
    name: string;
    description?: string;
    actionService: string;
    actionType: string;
    actionConfig?: Record<string, unknown>;
    reactionService: string;
    reactionType: string;
    reactionConfig?: Record<string, unknown>;
  }) {
    return this.prisma.area.create({
      data: {
        userId,
        name: data.name,
        description: data.description,
        actionService: data.actionService,
        actionType: data.actionType,
        // @ts-ignore - Prisma JSON type compatibility issue
        actionConfig: data.actionConfig || {},
        reactionService: data.reactionService,
        reactionType: data.reactionType,
        // @ts-ignore - Prisma JSON type compatibility issue
        reactionConfig: data.reactionConfig || {},
      },
    });
  }

  async getAreasByUserId(userId: number) {
    return this.prisma.area.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getAreaById(id: string, userId: number) {
    return this.prisma.area.findFirst({
      where: { id, userId },
    });
  }

  async toggleArea(id: string, userId: number) {
    const area = await this.getAreaById(id, userId);
    if (!area) {
      throw new Error('Area not found');
    }

    return this.prisma.area.update({
      where: { id },
      data: { active: !area.active },
    });
  }

  async deleteArea(id: string, userId: number) {
    const area = await this.getAreaById(id, userId);
    if (!area) {
      throw new Error('Area not found');
    }

    return this.prisma.area.delete({
      where: { id },
    });
  }

  async getActiveAreas() {
    return this.prisma.area.findMany({
      where: { active: true },
      include: { user: true },
    });
  }

  async updateLastTriggered(id: string) {
    return this.prisma.area.update({
      where: { id },
      data: { lastTriggered: new Date() },
    });
  }
}