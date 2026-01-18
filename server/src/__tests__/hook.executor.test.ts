import { HookExecutor } from '../hook.executor';
import { PrismaClient } from '@prisma/client';

const mockPrisma = {
  area: {
    findMany: jest.fn(),
    update: jest.fn(),
  },
} as unknown as PrismaClient;

const executor = new HookExecutor(mockPrisma);

describe('HookExecutor', () => {
  it("doit exécuter la réaction si l'action est déclenchée", async () => {
    const mockAreas = [
      {
        id: 'area-1',
        userId: 1,
        name: 'Test Area',
        active: true,
        actionService: 'timer',
        actionType: 'time_reached',
        actionConfig: { hour: 12, minute: 0 },
        reactionService: 'discord',
        reactionType: 'send_message',
        reactionConfig: { webhookUrl: 'http://discord.hook' },
        lastTriggered: new Date('2020-01-01'),
      },
    ];

    jest.spyOn((executor as any).areaService, 'getActiveAreas').mockResolvedValue(mockAreas);
    jest.spyOn((executor as any).areaService, 'updateLastTriggered').mockResolvedValue(true);

    jest.spyOn((executor as any).timerAction, 'checkTimeReached').mockResolvedValue(true);

    const discordSpy = jest
      .spyOn((executor as any).discordReaction, 'sendMessage')
      .mockResolvedValue(true);

    await executor.execute();

    expect((executor as any).timerAction.checkTimeReached).toHaveBeenCalled();
    expect(discordSpy).toHaveBeenCalledWith(
      'http://discord.hook',
      expect.stringContaining('Time alert')
    );
  });
});
