import { PrismaClient } from '@prisma/client';

export class GmailAction {
  constructor(private prisma: PrismaClient) {}

  async checkEmailReceived(userId: number, config: any): Promise<boolean> {
    const oauthAccount = await this.prisma.oAuthAccount.findFirst({
      where: {
        userId,
        provider: 'GOOGLE',
      },
    });

    if (!oauthAccount || !oauthAccount.accessToken) {
      console.log(`[Gmail Action] No Gmail account connected for user ${userId}`);
      return false;
    }

    try {
      const response = await fetch(
        'https://gmail.googleapis.com/gmail/v1/users/me/messages?maxResults=5&q=is:unread',
        {
          headers: {
            Authorization: `Bearer ${oauthAccount.accessToken}`,
          },
        }
      );

      if (!response.ok) {
        console.error(`[Gmail Action] Failed to fetch messages: ${response.status}`);
        return false;
      }

      const data = await response.json() as { messages?: Array<{ id: string }> };

      if (data.messages && data.messages.length > 0) {
        console.log(`[Gmail Action] Found ${data.messages.length} unread emails for user ${userId}`);
        return true;
      }

      return false;
    } catch (error) {
      console.error('[Gmail Action] Error checking emails:', error);
      return false;
    }
  }

  async getLatestEmailSubject(userId: number): Promise<string> {
    const oauthAccount = await this.prisma.oAuthAccount.findFirst({
      where: {
        userId,
        provider: 'GOOGLE',
      },
    });

    if (!oauthAccount || !oauthAccount.accessToken) {
      return 'Unknown email';
    }

    try {
      const listResponse = await fetch(
        'https://gmail.googleapis.com/gmail/v1/users/me/messages?maxResults=1',
        {
          headers: {
            Authorization: `Bearer ${oauthAccount.accessToken}`,
          },
        }
      );

      const listData = await listResponse.json() as { messages?: Array<{ id: string }> };

      if (!listData.messages || listData.messages.length === 0) {
        return 'No emails found';
      }

      const messageId = listData.messages[0].id;

      const messageResponse = await fetch(
        `https://gmail.googleapis.com/gmail/v1/users/me/messages/${messageId}?format=metadata&metadataHeaders=Subject`,
        {
          headers: {
            Authorization: `Bearer ${oauthAccount.accessToken}`,
          },
        }
      );

      const messageData = await messageResponse.json() as { payload?: { headers?: Array<{ name: string; value: string }> } };
      const subjectHeader = messageData.payload?.headers?.find((h: { name: string; value: string }) => h.name === 'Subject');

      return subjectHeader?.value || 'No subject';
    } catch (error) {
      console.error('[Gmail Action] Error fetching email subject:', error);
      return 'Error fetching subject';
    }
  }
}
