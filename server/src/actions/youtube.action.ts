import { PrismaClient } from '@prisma/client';
import { GmailService } from '../reactions/gmail.reaction';

export class YoutubeAction {
  private gmailService: GmailService;

  constructor(private prisma: PrismaClient) {
    this.gmailService = new GmailService(prisma);
  }

  async checkNewVideo(
    userId: number,
    config: { channel_url: string },
    lastTriggered: Date | null
  ): Promise<boolean> {
    try {
      const accessToken = await this.gmailService.getValidToken(userId);

      const channelId = await this.resolveChannelId(accessToken, config.channel_url);
      if (!channelId) {
        console.error(`[YouTube Action] Impossible de trouver l'ID pour: ${config.channel_url}`);
        return false;
      }

      const response = await fetch(
        `https://www.googleapis.com/youtube/v3/activities?part=snippet,contentDetails&channelId=${channelId}&maxResults=1&order=date`,
        {
          headers: { Authorization: `Bearer ${accessToken}` },
        }
      );

      if (!response.ok) return false;

      const data = (await response.json()) as any;
      if (!data.items || data.items.length === 0) return false;

      const latestVideo = data.items[0];

      if (latestVideo.snippet.type !== 'upload') return false;

      const videoDate = new Date(latestVideo.snippet.publishedAt);

      if (!lastTriggered) {
        console.log(`[YouTube] Init: Première exécution pour ${config.channel_url}`);
        return false;
      }

      if (videoDate.getTime() > lastTriggered.getTime()) {
        console.log(`[YouTube] Nouvelle vidéo détectée: ${latestVideo.snippet.title}`);
        return true;
      }

      return false;
    } catch (error) {
      console.error('[YouTube Action Error]', error);
      return false;
    }
  }

  private async resolveChannelId(accessToken: string, url: string): Promise<string | null> {
    const idMatch = url.match(/channel\/(UC[\w-]{21}[AQgw])/);
    if (idMatch) return idMatch[1];

    let handle = '';
    if (url.includes('@')) {
      handle = url.split('@')[1].split('/')[0];
    } else if (url.includes('/c/') || url.includes('/user/')) {
      const parts = url.split('/').filter((p) => p.length > 0);
      handle = parts[parts.length - 1];
    } else {
      handle = url;
    }

    const searchUrl = `https://www.googleapis.com/youtube/v3/search?part=snippet&type=channel&q=${encodeURIComponent(handle)}&maxResults=1`;
    const response = await fetch(searchUrl, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    if (!response.ok) return null;
    const data = (await response.json()) as any;

    if (data.items && data.items.length > 0) {
      return data.items[0].snippet.channelId;
    }

    return null;
  }
}
