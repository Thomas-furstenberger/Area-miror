import { PrismaClient } from '@prisma/client';

interface DiscordMessage {
  id: string;
  timestamp: string;
  content: string;
}

interface DiscordMember {
  user: { id: string; username: string };
  joined_at: string;
}

export class DiscordAction {
  constructor(private prisma: PrismaClient) {}

  async checkMessageReceived(
    userId: number,
    config: { webhook_url: string; guild_id?: string; channel_id?: string },
    lastTriggered: Date | null
  ): Promise<boolean> {
    try {
      const account = await this.prisma.oAuthAccount.findFirst({
        where: { userId, provider: 'DISCORD' },
      });

      if (!account || !account.accessToken) {
        console.error(`[Discord] Pas de compte connecté pour user ${userId}`);
        return false;
      }

      // Pour Discord, on utilise l'API pour récupérer les messages récents
      // Note: Cette implémentation nécessite un bot Discord ou OAuth avec les permissions appropriées
      if (!config.channel_id) {
        console.error('[Discord] channel_id manquant dans la configuration');
        return false;
      }

      const url = `https://discord.com/api/v10/channels/${config.channel_id}/messages?limit=1`;
      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${account.accessToken}`,
        },
      });

      if (!response.ok) {
        console.error(`[Discord] API Error: ${response.status}`);
        return false;
      }

      const messages = (await response.json()) as DiscordMessage[];

      if (!messages || messages.length === 0) return false;

      const latestMessageDate = new Date(messages[0].timestamp);

      if (!lastTriggered) {
        return false;
      }

      return latestMessageDate.getTime() > lastTriggered.getTime();
    } catch (e) {
      console.error('[Discord Action Error]', e);
      return false;
    }
  }

  async checkUserJoined(
    userId: number,
    config: { guild_id: string },
    lastTriggered: Date | null
  ): Promise<boolean> {
    try {
      const account = await this.prisma.oAuthAccount.findFirst({
        where: { userId, provider: 'DISCORD' },
      });

      if (!account || !account.accessToken) {
        console.error(`[Discord] Pas de compte connecté pour user ${userId}`);
        return false;
      }

      // Récupère la liste des membres récemment rejoints
      const url = `https://discord.com/api/v10/guilds/${config.guild_id}/members?limit=1`;
      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${account.accessToken}`,
        },
      });

      if (!response.ok) {
        console.error(`[Discord] API Error: ${response.status}`);
        return false;
      }

      const members = (await response.json()) as DiscordMember[];

      if (!members || members.length === 0) return false;

      const latestJoinDate = new Date(members[0].joined_at);

      if (!lastTriggered) {
        return false;
      }

      return latestJoinDate.getTime() > lastTriggered.getTime();
    } catch (e) {
      console.error('[Discord Action Error]', e);
      return false;
    }
  }
}
