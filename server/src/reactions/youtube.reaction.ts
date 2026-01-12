import { PrismaClient } from '@prisma/client';
import { GmailService } from './gmail.reaction';

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

  private extractVideoId(url: string): string | null {
    const match = url.match(/(?:v=|\/)([0-9A-Za-z_-]{11}).*/);
    return match ? match[1] : null;
  }
}
