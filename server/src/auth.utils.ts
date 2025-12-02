import crypto from 'crypto';

export function generateToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

export function verifyToken(token: string): boolean {
  return token.length === 64; // hex token should be 64 characters
}
