import { PrismaClient } from '@prisma/client';

interface GitHubUserData {
  githubId: number;
  login: string;
  email: string | null;
  name: string | null;
  avatarUrl: string;
  accessToken?: string;
}

export class UserRepository {
  constructor(private prisma: PrismaClient) {}

  async findByGithubId(githubId: number) {
    return this.prisma.user.findUnique({
      where: { githubId },
    });
  }

  async findByLogin(login: string) {
    return this.prisma.user.findUnique({
      where: { githubLogin: login },
    });
  }

  async upsertUser(data: GitHubUserData) {
    return this.prisma.user.upsert({
      where: { githubId: data.githubId },
      update: {
        email: data.email || '',
        name: data.name,
        avatarUrl: data.avatarUrl,
      },
      create: {
        githubId: data.githubId,
        githubLogin: data.login,
        email: data.email || '',
        name: data.name,
        avatarUrl: data.avatarUrl,
      },
    });
  }

  async findById(id: number) {
    return this.prisma.user.findUnique({
      where: { id },
    });
  }
}
