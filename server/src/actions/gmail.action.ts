import { PrismaClient } from '@prisma/client';
import { GmailService } from '../reactions/gmail.reaction';

export class GmailAction {
  private gmailService: GmailService;

  constructor(private prisma: PrismaClient) {
    this.gmailService = new GmailService(prisma);
  }

  async checkEmailReceived(
    userId: number,
    _config: unknown,
    lastTriggered: Date | null
  ): Promise<boolean> {
    try {
      const accessToken = await this.gmailService.getValidToken(userId);

      // 1. On récupère le dernier message de la boîte (lu ou non lu)
      const response = await fetch(
        'https://gmail.googleapis.com/gmail/v1/users/me/messages?maxResults=1',
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      if (!response.ok) {
        // Si erreur (ex: token expiré), on log et on retourne false
        const errorBody = await response.text();
        console.error(
          `[Gmail Action] Failed to fetch messages for user ${userId}: ${response.status} - ${errorBody}`
        );
        return false;
      }

      const data = (await response.json()) as { messages?: Array<{ id: string }> };

      if (!data.messages || data.messages.length === 0) {
        return false; // Pas de mails du tout
      }

      // 2. On récupère les détails du message pour avoir sa date précise
      const messageId = data.messages[0].id;
      const detailResponse = await fetch(
        `https://gmail.googleapis.com/gmail/v1/users/me/messages/${messageId}?format=minimal`,
        { headers: { Authorization: `Bearer ${accessToken}` } }
      );

      const messageData = (await detailResponse.json()) as { internalDate: string };
      const emailDate = parseInt(messageData.internalDate); // Timestamp en millisecondes

      // 3. LOGIQUE DE COMPARAISON (C'est ici que ça corrige le bug)

      // Si c'est la toute première fois qu'on lance l'action (lastTriggered est null)
      // On retourne 'false' pour initialiser le système sans déclencher sur un vieux mail.
      // La prochaine fois, 'lastTriggered' sera défini sur "maintenant".
      if (!lastTriggered) {
        console.log(
          `[Gmail Action] Init: Dernier mail ignoré (Date: ${new Date(emailDate).toLocaleString()})`
        );
        return false;
      }

      // Si la date du mail est ANTERIEURE ou EGALE à la dernière vérification, ce n'est pas un nouveau mail.
      if (emailDate <= lastTriggered.getTime()) {
        return false;
      }

      // Si on arrive ici, c'est que le mail est plus récent que la dernière fois !
      console.log(
        `[Gmail Action] NOUVEAU mail détecté ! (Reçu le : ${new Date(emailDate).toLocaleString()})`
      );
      return true;
    } catch (error) {
      if (error instanceof Error && error.message.includes('Compte Google non connecté')) {
        console.warn(`[Gmail Action] User ${userId}: ${error.message}`);
      } else {
        console.error(`[Gmail Action] Error checking emails for user ${userId}:`, error);
      }
      return false;
    }
  }

  async getLatestEmailSubject(userId: number): Promise<string> {
    try {
      const accessToken = await this.gmailService.getValidToken(userId);

      const listResponse = await fetch(
        'https://gmail.googleapis.com/gmail/v1/users/me/messages?maxResults=1',
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      const listData = (await listResponse.json()) as { messages?: Array<{ id: string }> };

      if (!listData.messages || listData.messages.length === 0) {
        return 'No emails found';
      }

      const messageId = listData.messages[0].id;

      const messageResponse = await fetch(
        `https://gmail.googleapis.com/gmail/v1/users/me/messages/${messageId}?format=metadata&metadataHeaders=Subject`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      const messageData = (await messageResponse.json()) as {
        payload?: {
          headers?: Array<{ name: string; value: string }>;
        };
      };
      const subjectHeader = messageData.payload?.headers?.find(
        (h: { name: string; value: string }) => h.name === 'Subject'
      );

      return subjectHeader?.value || 'No subject';
    } catch (error) {
      console.error('[Gmail Action] Error fetching email subject:', error);
      return 'Error fetching subject';
    }
  }
}
