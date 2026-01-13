import { PrismaClient } from '@prisma/client';
import { GmailService } from './gmail.reaction';

// Interfaces pour les réponses API (nécessaires pour la résolution de chaîne)
interface YoutubeChannelResponse {
  items?: Array<{ id: string }>;
}
interface YoutubeSearchResponse {
  items?: Array<{ snippet: { channelId: string } }>;
}
interface YoutubeActivityResponse {
  items?: Array<{
    snippet: {
      type: string;
      title: string;
      publishedAt: string;
    };
    contentDetails?: {
      upload?: {
        videoId: string;
      };
    };
  }>;
}

export class YoutubeReaction {
  private gmailService: GmailService;

  constructor(private prisma: PrismaClient) {
    this.gmailService = new GmailService(prisma);
  }

  async addToPlaylist(
    userId: number,
    config: { playlist_id: string; video_id: string }
  ): Promise<boolean> {
    try {
      const accessToken = await this.gmailService.getValidToken(userId);

      const response = await fetch(
        'https://www.googleapis.com/youtube/v3/playlistItems?part=snippet',
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            snippet: {
              playlistId: config.playlist_id,
              resourceId: {
                kind: 'youtube#video',
                videoId: config.video_id,
              },
            },
          }),
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        console.error(
          `[YouTube Reaction] Erreur ajout à playlist (${response.status}):`,
          errorText
        );
        return false;
      }

      console.log(`[YouTube] Vidéo ${config.video_id} ajoutée à la playlist ${config.playlist_id}`);
      return true;
    } catch (error) {
      console.error('[YouTube Reaction Error]', error);
      return false;
    }
  }

  async likeVideo(userId: number, videoUrl: string) {
    const accessToken = await this.gmailService.getValidToken(userId);

    const videoId = this.extractVideoId(videoUrl);
    if (!videoId) {
      throw new Error(`URL de vidéo invalide : ${videoUrl}`);
    }

    const response = await fetch(
      `https://www.googleapis.com/youtube/v3/videos/rate?id=${videoId}&rating=like`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Length': '0',
        },
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Erreur YouTube API (${response.status}): ${errorText}`);
    }

    console.log(`[YouTube Reaction] Vidéo ${videoId} likée avec succès !`);
  }

  async postComment(userId: number, config: { url: string; comment: string }): Promise<boolean> {
    try {
      const accessToken = await this.gmailService.getValidToken(userId);
      let videoId = this.extractVideoId(config.url);

      if (!videoId) {
        console.log(
          `[YouTube Reaction] URL vidéo non détectée, on regarde si c'est une chaîne: ${config.url}`
        );
        const channelId = await this.resolveChannelId(accessToken, config.url);

        if (channelId) {
          videoId = await this.getLatestVideoFromChannel(accessToken, channelId);
        }
      }

      if (!videoId) {
        console.error(`[YouTube Reaction] Impossible de déterminer l'ID de la vidéo cible.`);
        return false;
      }

      const response = await fetch(
        'https://www.googleapis.com/youtube/v3/commentThreads?part=snippet',
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            snippet: {
              videoId: videoId,
              topLevelComment: {
                snippet: {
                  textOriginal: config.comment,
                },
              },
            },
          }),
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        console.error(
          `[YouTube Reaction] Erreur post commentaire (${response.status}):`,
          errorText
        );
        return false;
      }

      console.log(`[YouTube Reaction] Commentaire posté sur la vidéo ${videoId}`);
      return true;
    } catch (error) {
      console.error('[YouTube Reaction Error]', error);
      return false;
    }
  }

  private extractVideoId(url: string): string | null {
    const match = url.match(/(?:v=|\/)([0-9A-Za-z_-]{11}).*/);
    return match ? match[1] : null;
  }

  private async getLatestVideoFromChannel(
    accessToken: string,
    channelId: string
  ): Promise<string | null> {
    try {
      const response = await fetch(
        `https://www.googleapis.com/youtube/v3/activities?part=snippet,contentDetails&channelId=${channelId}&maxResults=5&order=date`,
        { headers: { Authorization: `Bearer ${accessToken}` } }
      );

      if (!response.ok) return null;
      const data = (await response.json()) as YoutubeActivityResponse;

      const uploadItem = data.items?.find((item) => item.snippet.type === 'upload');

      if (uploadItem && uploadItem.contentDetails?.upload?.videoId) {
        return uploadItem.contentDetails.upload.videoId;
      }
      return null;
    } catch (e) {
      console.error('[YouTube Reaction] Erreur récupération dernière vidéo', e);
      return null;
    }
  }

  private async resolveChannelId(accessToken: string, url: string): Promise<string | null> {
    let handle = '';
    const idMatch = url.match(/channel\/(UC[\w-]{21}[AQgw])/);
    if (idMatch) return idMatch[1];

    if (url.includes('@')) {
      handle = url.split('@')[1].split('/')[0];
    } else {
      handle = url.split('/').pop() || url;
    }

    const handlesToTry = [`@${handle}`, handle];
    for (const h of handlesToTry) {
      try {
        const res = await fetch(
          `https://www.googleapis.com/youtube/v3/channels?part=id&forHandle=${encodeURIComponent(h)}`,
          {
            headers: { Authorization: `Bearer ${accessToken}` },
          }
        );
        if (res.ok) {
          const data = (await res.json()) as YoutubeChannelResponse;
          if (data.items && data.items.length > 0) return data.items[0].id;
        }
      } catch (error) {
        console.warn(`[YouTube Reaction] Échec résolution handle ${h}:`, error);
      }
    }

    try {
      const res = await fetch(
        `https://www.googleapis.com/youtube/v3/search?part=snippet&type=channel&q=${encodeURIComponent(handle)}&maxResults=1`,
        {
          headers: { Authorization: `Bearer ${accessToken}` },
        }
      );
      if (res.ok) {
        const data = (await res.json()) as YoutubeSearchResponse;
        if (data.items && data.items.length > 0) return data.items[0].snippet.channelId;
      }
    } catch (error) {
      console.error('[YouTube Reaction] Erreur fallback recherche chaîne:', error);
    }

    return null;
  }
}
