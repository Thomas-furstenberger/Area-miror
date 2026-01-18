import { AreaService } from '../area.service';
import { PrismaClient } from '@prisma/client';

const mockPrisma = {
  area: {
    create: jest.fn(),
    findUnique: jest.fn(),
    findFirst: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    findMany: jest.fn(),
  },
} as unknown as PrismaClient;

describe('AreaService', () => {
  let areaService: AreaService;

  beforeEach(() => {
    areaService = new AreaService(mockPrisma);
    jest.clearAllMocks();
  });

  describe('createArea', () => {
    it('doit créer une AREA avec les bons paramètres', async () => {
      const areaData = {
        name: 'Test Area',
        actionService: 'github',
        actionType: 'new_commit',
        actionConfig: {},
        reactionService: 'discord',
        reactionType: 'send_message',
        reactionConfig: {},
      };

      (mockPrisma.area.create as jest.Mock).mockResolvedValue({ id: 'uuid', ...areaData });

      await areaService.createArea(1, areaData);

      expect(mockPrisma.area.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            userId: 1,
            name: 'Test Area',
          }),
        })
      );
    });
  });

  describe('toggleArea', () => {
    it('doit inverser le statut actif/inactif', async () => {
      (mockPrisma.area.findFirst as jest.Mock).mockResolvedValue({ id: 'uuid', active: true });

      await areaService.toggleArea('uuid', 1);

      expect(mockPrisma.area.update).toHaveBeenCalledWith({
        where: { id: 'uuid' },
        data: { active: false },
      });
    });

    it("doit lever une erreur si l'area n'existe pas", async () => {
      (mockPrisma.area.findFirst as jest.Mock).mockResolvedValue(null);

      await expect(areaService.toggleArea('uuid', 1)).rejects.toThrow('Area not found');
    });
  });
});
