import { PrismaClient } from '@prisma/client';
import { hashPassword, comparePassword } from './auth';

export class UserService {
  constructor(private prisma: PrismaClient) {}

  async registerUser(email: string, password: string, name?: string) {
    // Check if user already exists
    const existingUser = await this.prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      throw new Error('User already exists');
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Create user
    const user = await this.prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name: name || email.split('@')[0],
      },
    });

    return user;
  }

  async loginUser(email: string, password: string) {
    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (!user || !user.password) {
      throw new Error('Invalid credentials');
    }

    const isPasswordValid = await comparePassword(password, user.password);
    if (!isPasswordValid) {
      throw new Error('Invalid credentials');
    }

    return user;
  }

  async getUserById(id: number) {
    return this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        name: true,
        avatarUrl: true,
        emailVerified: true,
        createdAt: true,
      },
    });
  }

  async findOrCreateOAuthUser(provider: string, providerAccountId: string, userData: any) {
    // Check if OAuth account exists
    let oauthAccount = await this.prisma.oAuthAccount.findUnique({
      where: {
        provider_providerAccountId: {
          provider,
          providerAccountId,
        },
      },
      include: { user: true },
    });

    if (oauthAccount) {
      // Update tokens if provided
      if (userData.accessToken) {
        await this.prisma.oAuthAccount.update({
          where: { id: oauthAccount.id },
          data: {
            accessToken: userData.accessToken,
            refreshToken: userData.refreshToken,
          },
        });
      }
      return oauthAccount.user;
    }

    // Create new user with OAuth account
    const user = await this.prisma.user.create({
      data: {
        email: userData.email,
        name: userData.name,
        avatarUrl: userData.avatarUrl,
        emailVerified: true, // OAuth providers verify email
        oauthAccounts: {
          create: {
            provider,
            providerAccountId,
            accessToken: userData.accessToken,
            refreshToken: userData.refreshToken,
          },
        },
      },
      include: {
        oauthAccounts: true,
      },
    });

    return user;
  }

  async createSession(userId: number, token: string) {
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

    return this.prisma.session.create({
      data: {
        userId,
        token,
        expiresAt,
      },
    });
  }

  async getSessionByToken(token: string) {
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
}
