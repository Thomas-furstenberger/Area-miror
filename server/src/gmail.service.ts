import { PrismaClient } from '@prisma/client';

export class GmailService {
  constructor(private prisma: PrismaClient) {}

  async getValidToken(userId: number): Promise<string> {
    const oauthAccount = await this.prisma.oAuthAccount.findFirst({
      where: { userId, provider: 'GOOGLE' }, //
    });

    if (!oauthAccount || !oauthAccount.refreshToken) {
      throw new Error("Compte Google non connecté ou Refresh Token manquant.");
    }

    const now = new Date();
    const expiryDate = oauthAccount.expiresAt || new Date(0); 
    
    if (now >= expiryDate) {
      console.log('Token Google expiré, rafraîchissement...');
      return this.refreshAccessToken(oauthAccount.id, oauthAccount.refreshToken);
    }

    return oauthAccount.accessToken!;
  }


  private async refreshAccessToken(accountId: string, refreshToken: string): Promise<string> {
    const response = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id: process.env.GOOGLE_CLIENT_ID!,
        client_secret: process.env.GOOGLE_CLIENT_SECRET!,
        refresh_token: refreshToken,
        grant_type: 'refresh_token',
      }),
    });

    if (!response.ok) {
      throw new Error(`Impossible de rafraîchir le token: ${await response.text()}`);
    }

    const data = await response.json();
    
    const newExpiresAt = new Date(Date.now() + data.expires_in * 1000);

    await this.prisma.oAuthAccount.update({
      where: { id: accountId },
      data: {
        accessToken: data.access_token,
        expiresAt: newExpiresAt,
        refreshToken: data.refresh_token || refreshToken, 
      },
    });

    return data.access_token;
  }


  async sendEmail(userId: number, to: string, subject: string, body: string) {
    const token = await this.getValidToken(userId);

    const utf8Subject = `=?utf-8?B?${Buffer.from(subject).toString('base64')}?=`;
    const messageParts = [
      `To: ${to}`,
      'Content-Type: text/html; charset=utf-8',
      'MIME-Version: 1.0',
      `Subject: ${utf8Subject}`,
      '',
      body
    ];
    const message = messageParts.join('\n');
    
    const encodedMessage = Buffer.from(message)
      .toString('base64')
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '');

    const response = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/messages/send', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        raw: encodedMessage,
      }),
    });

    if (!response.ok) {
      throw new Error(`Erreur envoi email: ${await response.text()}`);
    }

    return response.json();
  }
}