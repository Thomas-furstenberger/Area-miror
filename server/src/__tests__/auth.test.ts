import { hashPassword, comparePassword, generateAccessToken } from '../auth';
import jwt from 'jsonwebtoken';

process.env.JWT_SECRET = 'your-secret-key';

describe('Auth Utils', () => {
  describe('hashPassword', () => {
    it('doit hasher le mot de passe', async () => {
      const password = 'mySecretPassword';
      const hash = await hashPassword(password);

      expect(hash).not.toBe(password);
      expect(hash.length).toBeGreaterThan(0);
    });
  });

  describe('comparePassword', () => {
    it('doit renvoyer TRUE pour un mot de passe valide', async () => {
      const password = 'password123';
      const hash = await hashPassword(password);

      const isValid = await comparePassword(password, hash);
      expect(isValid).toBe(true);
    });

    it('doit renvoyer FALSE pour un mauvais mot de passe', async () => {
      const password = 'password123';
      const hash = await hashPassword(password);

      const isValid = await comparePassword('wrongPassword', hash);
      expect(isValid).toBe(false);
    });
  });

  describe('generateAccessToken', () => {
    it('doit générer un JWT valide', () => {
      const token = generateAccessToken(1, 'test@test.com');
      expect(typeof token).toBe('string');

      const secret = 'your-secret-key';

      const decoded = jwt.verify(token, secret) as any;
      expect(decoded.userId).toBe(1);
      expect(decoded.email).toBe('test@test.com');
    });
  });
});
