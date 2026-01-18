import { HookExecutor } from '../hook.executor';
import { PrismaClient, Area, User } from '@prisma/client';
import { AreaService } from '../area.service';
import { TimerAction } from '../actions/timer.action';
import { DiscordReaction } from '../reactions/discord.reaction';

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
        createdAt: new Date(),
        updatedAt: new Date(),
        description: null,
        user: {
          id: 1,
          email: 'test@test.com',
          name: 'Test User',
          password: 'hashed_password',
          avatarUrl: null,
          emailVerified: true,
          createdAt: new Date(),
          updatedAt: new Date(),
          githubId: null,
          githubLogin: null,
        },
      },
    ];

    const areaService = executor['areaService'] as AreaService;
    const timerAction = executor['timerAction'] as TimerAction;
    const discordReaction = executor['discordReaction'] as DiscordReaction;

    jest
      .spyOn(areaService, 'getActiveAreas')
      .mockResolvedValue(mockAreas as unknown as (Area & { user: User })[]);
    jest.spyOn(areaService, 'updateLastTriggered').mockResolvedValue({} as unknown as Area);

    jest.spyOn(timerAction, 'checkTimeReached').mockResolvedValue(true);

    const discordSpy = jest.spyOn(discordReaction, 'sendMessage').mockResolvedValue(true);

    await executor.execute();

    expect(timerAction.checkTimeReached).toHaveBeenCalled();
    expect(discordSpy).toHaveBeenCalledWith(
      'http://discord.hook',
      expect.stringContaining('Time alert')
    );
  });
});
