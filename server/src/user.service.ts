import { PrismaClient } from '@prisma/client';
import { hashPassword, comparePassword } from './auth';

export interface OAuthUserData {
  email: string;
  name?: string | null;
  avatarUrl?: string | null;
  accessToken?: string;
  refreshToken?: string;
  expiresAt?: Date;
}

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

  async findOrCreateOAuthUser(
    provider: string,
    providerAccountId: string,
    userData: OAuthUserData
  ) {
    const oauthAccount = await this.prisma.oAuthAccount.findUnique({
      where: {
        provider_providerAccountId: {
          provider,
          providerAccountId,
        },
      },
      include: { user: true },
    });

    if (oauthAccount) {
      const dataToUpdate: { accessToken?: string; refreshToken?: string; expiresAt?: Date } = {};

      if (userData.accessToken) dataToUpdate.accessToken = userData.accessToken;
      if (userData.refreshToken) dataToUpdate.refreshToken = userData.refreshToken;
      if (userData.expiresAt) dataToUpdate.expiresAt = userData.expiresAt;

      if (Object.keys(dataToUpdate).length > 0) {
        await this.prisma.oAuthAccount.update({
          where: { id: oauthAccount.id },
          data: dataToUpdate,
        });
      }
      return oauthAccount.user;
    }

    const existingUser = await this.prisma.user.findUnique({
      where: { email: userData.email },
    });

    if (existingUser) {
      await this.prisma.oAuthAccount.create({
        data: {
          provider,
          providerAccountId,
          accessToken: userData.accessToken,
          refreshToken: userData.refreshToken,
          expiresAt: userData.expiresAt,
          userId: existingUser.id,
        },
      });

      return existingUser;
    }

    const user = await this.prisma.user.create({
      data: {
        email: userData.email,
        name: userData.name,
        avatarUrl: userData.avatarUrl,
        emailVerified: true,
        oauthAccounts: {
          create: {
            provider,
            providerAccountId,
            accessToken: userData.accessToken,
            refreshToken: userData.refreshToken,
            expiresAt: userData.expiresAt,
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

  // Connect OAuth service to existing user
  async connectOAuthToUser(
    userId: number,
    provider: string,
    providerAccountId: string,
    userData: OAuthUserData
  ) {
    // Check if this OAuth account is already connected to another user
    const existingOAuth = await this.prisma.oAuthAccount.findUnique({
      where: {
        provider_providerAccountId: {
          provider,
          providerAccountId,
        },
      },
    });

    if (existingOAuth && existingOAuth.userId !== userId) {
      throw new Error('This OAuth account is already connected to another user');
    }

    // Check if user already has this provider connected
    const userOAuth = await this.prisma.oAuthAccount.findFirst({
      where: {
        userId,
        provider,
      },
    });

    if (userOAuth) {
      // Update existing OAuth account
      return this.prisma.oAuthAccount.update({
        where: { id: userOAuth.id },
        data: {
          accessToken: userData.accessToken,
          refreshToken: userData.refreshToken,
          expiresAt: userData.expiresAt,
          email: userData.email,
          name: userData.name,
          avatarUrl: userData.avatarUrl,
        },
      });
    }

    // Create new OAuth account
    return this.prisma.oAuthAccount.create({
      data: {
        provider,
        providerAccountId,
        accessToken: userData.accessToken,
        refreshToken: userData.refreshToken,
        expiresAt: userData.expiresAt,
        email: userData.email,
        name: userData.name,
        avatarUrl: userData.avatarUrl,
        userId,
      },
    });
  }
}
