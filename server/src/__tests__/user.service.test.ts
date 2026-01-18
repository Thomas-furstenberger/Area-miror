import { UserService } from '../user.service';
import { PrismaClient } from '@prisma/client';

const mockPrisma = {
  user: {
    findUnique: jest.fn(),
    create: jest.fn(),
  },
} as unknown as PrismaClient;

jest.mock('../auth', () => ({
  hashPassword: jest.fn().mockResolvedValue('hashed_password_123'),
  comparePassword: jest.fn().mockResolvedValue(true),
}));

describe('UserService', () => {
  let userService: UserService;

  beforeEach(() => {
    userService = new UserService(mockPrisma);
    jest.clearAllMocks();
  });

  describe('registerUser', () => {
    it("doit créer un nouvel utilisateur si l'email est libre", async () => {
      (mockPrisma.user.findUnique as jest.Mock).mockResolvedValue(null);
      (mockPrisma.user.create as jest.Mock).mockResolvedValue({
        id: 1,
        email: 'test@test.com',
        name: 'test',
        password: 'hashed_password_123',
      });

      const result = await userService.registerUser('test@test.com', 'password123');

      expect(mockPrisma.user.findUnique).toHaveBeenCalledWith({
        where: { email: 'test@test.com' },
      });
      expect(mockPrisma.user.create).toHaveBeenCalled();
      expect(result.email).toBe('test@test.com');
    });

    it("doit lever une erreur si l'utilisateur existe déjà", async () => {
      (mockPrisma.user.findUnique as jest.Mock).mockResolvedValue({
        id: 1,
        email: 'exist@test.com',
      });

      await expect(userService.registerUser('exist@test.com', 'password123')).rejects.toThrow(
        'User already exists'
      );
    });
  });
});
