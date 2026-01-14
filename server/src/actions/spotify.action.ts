import { PrismaClient } from '@prisma/client';
import { SpotifyService } from '../reactions/spotify.reaction';

export class SpotifyAction {
  private spotifyService: SpotifyService;

  constructor(private prisma: PrismaClient) {
    this.spotifyService = new SpotifyService(prisma);
  }

  async checkNewSavedTrack(
    userId: number,
    _config: unknown,
    lastTriggered: Date | null
  ): Promise<boolean> {
    try {
      const token = await this.spotifyService.getValidToken(userId);

      const response = await fetch('https://api.spotify.com/v1/me/tracks?limit=1', {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) {
        console.error(`[Spotify Action] Erreur API (${response.status})`);
        return false;
      }

      const data = (await response.json()) as { items: Array<{ added_at: string }> };

      if (!data.items || data.items.length === 0) return false;

      const latestTrackDate = new Date(data.items[0].added_at);

      if (!lastTriggered) {
        console.log(
          `[Spotify Action] Init: Dernier like daté du ${latestTrackDate.toLocaleString()}`
        );
        return false;
      }

      if (latestTrackDate.getTime() > lastTriggered.getTime()) {
        console.log(`[Spotify Action] Nouveau like détecté ! (${latestTrackDate.toISOString()})`);
        return true;
      }

      return false;
    } catch (error) {
      console.error('[Spotify Action Error]', error);
      return false;
    }
  }
}
