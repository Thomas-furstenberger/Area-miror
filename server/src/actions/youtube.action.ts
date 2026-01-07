import { PrismaClient } from '@prisma/client';
import { GmailService } from '../reactions/gmail.reaction';

export class YoutubeAction {
  private gmailService: GmailService;

  constructor(private prisma: PrismaClient) {
    this.gmailService = new GmailService(prisma);
  }

  async checkNewVideo(userId: number, config: { channel_url: string }, lastTriggered: Date | null): Promise<boolean> {
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

      if (!response.ok) {
        const errorBody = await response.text();
        console.error(`[YouTube Debug] Erreur API Activities (${response.status}): ${errorBody}`);
        return false;
      }
      
      const data = (await response.json()) as {
        items?: {
          snippet: { type: string; publishedAt: string; title: string };
          contentDetails: unknown;
        }[];
        };
      
      if (!data.items || data.items.length === 0) {
        console.warn('[YouTube Debug] Aucune activité trouvée pour cette chaîne (data.items est vide).');
        return false;
      }

      const latestVideo = data.items[0];
      const type = latestVideo.snippet.type;

      if (type !== 'upload') {
        console.log('[YouTube Debug] Ignoré: Ce n\'est pas un upload (upload vs ' + type + ')');
        return false;
      }

      const videoDate = new Date(latestVideo.snippet.publishedAt);

      if (!lastTriggered) {
        console.log(`[YouTube] Init: Première exécution pour ${config.channel_url}. Date vidéo: ${videoDate.toISOString()}`);
        return false;
      }

      if (videoDate.getTime() > lastTriggered.getTime()) {
        return true;
      }

      return false;
    } catch (error) {
      console.error('[YouTube Action Error]', error);
      return false;
    }
  }

  private async resolveChannelId(accessToken: string, url: string): Promise<string | null> {
    let handle = '';
    
    const idMatch = url.match(/channel\/(UC[\w-]{21}[AQgw])/);
    if (idMatch) {
        return idMatch[1];
    }

    if (url.includes('@')) {
      handle = url.split('@')[1].split('/')[0];
    } else {
      console.warn(`[YouTube Debug] Pas de '@' trouvé, tentative de recherche brute: ${url}`);
      handle = url.split('/').pop() || url;
    }

    const handlesToTry = [`@${handle}`, handle];

    for (const h of handlesToTry) {
        try {
            const requestUrl = `https://www.googleapis.com/youtube/v3/channels?part=id&forHandle=${encodeURIComponent(h)}`;
            console.log(`[YouTube Debug] Tentative API forHandle: ${h}`);

            const response = await fetch(requestUrl, {
                headers: { Authorization: `Bearer ${accessToken}` },
            });

            if (!response.ok) {
                const errorText = await response.text();
                console.error(`[YouTube Debug] Erreur API (${response.status}) pour ${h}:`, errorText);
                continue;
            }

            const data = (await response.json()) as any;
            if (data.items && data.items.length > 0) {
                console.log(`[YouTube Debug] Succès ! ID trouvé: ${data.items[0].id}`);
                return data.items[0].id;
            }
        } catch (e) {
            console.error('[YouTube Debug] Exception durant forHandle:', e);
        }
    }

    try {
        const searchUrl = `https://www.googleapis.com/youtube/v3/search?part=snippet&type=channel&q=${encodeURIComponent(handle)}&maxResults=1`;
        const response = await fetch(searchUrl, {
            headers: { Authorization: `Bearer ${accessToken}` },
        });

        if (!response.ok) {
             const errorText = await response.text();
             console.error(`[YouTube Debug] Erreur Search (${response.status}):`, errorText);
             return null;
        }

        const data = (await response.json()) as { items?: { snippet: { channelId: string } }[] };
        if (data.items && data.items.length > 0) {
            console.log(`[YouTube Debug] Succès via Search ! ID trouvé: ${data.items[0].snippet.channelId}`);
            return data.items[0].snippet.channelId;
        }
    } catch (e) {
        console.error('[YouTube Debug] Exception durant Search:', e);
    }

    console.log('[YouTube Debug] Aucun ID trouvé après toutes les tentatives.');
    return null;
  }
}