import crypto from 'crypto';

interface GitHubUser {
  id: number;
  login: string;
  email: string | null;
  name: string | null;
  avatar_url: string;
}

interface AuthToken {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export class AuthService {
  private jwtSecret = process.env.JWT_SECRET || 'your_jwt_secret_key';

  /**
   * Create a simple JWT-like token (in production, use jsonwebtoken library)
   */
  createToken(userId: number, login: string): AuthToken {
    const payload = {
      userId,
      login,
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + 3600 * 24 * 7, // 7 days
    };

    // Simple token creation (in production, use proper JWT library)
    const token = Buffer.from(JSON.stringify(payload)).toString('base64');

    return {
      accessToken: token,
      refreshToken: crypto.randomBytes(32).toString('hex'),
      expiresIn: 3600 * 24 * 7,
    };
  }

  /**
   * Verify token validity
   */
  verifyToken(token: string): { userId: number; login: string } | null {
    try {
      const decoded = JSON.parse(Buffer.from(token, 'base64').toString());

      if (decoded.exp * 1000 < Date.now()) {
        return null; // Token expired
      }

      return {
        userId: decoded.userId,
        login: decoded.login,
      };
    } catch {
      return null;
    }
  }

  /**
   * Store user session (in-memory, use database in production)
   */
  private sessions = new Map<string, GitHubUser & { createdAt: number }>();

  saveSession(user: GitHubUser, token: string): void {
    this.sessions.set(token, {
      ...user,
      createdAt: Date.now(),
    });
  }

  getSession(token: string): (GitHubUser & { createdAt: number }) | undefined {
    return this.sessions.get(token);
  }

  clearSession(token: string): void {
    this.sessions.delete(token);
  }
}
