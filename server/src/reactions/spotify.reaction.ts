import { PrismaClient } from '@prisma/client';

export class SpotifyService {
  constructor(private prisma: PrismaClient) {}

  async getValidToken(userId: number): Promise<string> {
    const account = await this.prisma.oAuthAccount.findFirst({
      where: { userId, provider: 'SPOTIFY' },
    });

    if (!account || !account.refreshToken) {
      throw new Error('Compte Spotify non connecté ou Refresh Token manquant.');
    }

    const now = new Date();
    if (
      !account.accessToken ||
      !account.expiresAt ||
      now.getTime() >= account.expiresAt.getTime() - 300000
    ) {
      console.log(
        `[Spotify Service] Token expiré pour l'utilisateur ${userId}, rafraîchissement...`
      );
      return this.refreshAccessToken(account.id, account.refreshToken);
    }

    return account.accessToken;
  }

  private async refreshAccessToken(accountId: string, refreshToken: string): Promise<string> {
    const params = new URLSearchParams({
      grant_type: 'refresh_token',
      refresh_token: refreshToken,
      client_id: process.env.SPOTIFY_CLIENT_ID!,
      client_secret: process.env.SPOTIFY_CLIENT_SECRET!,
    });

    const response = await fetch('https://accounts.spotify.com/api/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: params,
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[Spotify Service] Erreur refresh token:', errorText);
      throw new Error('Impossible de rafraîchir le token Spotify');
    }

    const data = (await response.json()) as { access_token: string; expires_in: number };

    const newExpiresAt = new Date(Date.now() + data.expires_in * 1000);

    await this.prisma.oAuthAccount.update({
      where: { id: accountId },
      data: {
        accessToken: data.access_token,
        expiresAt: newExpiresAt,
      },
    });

    return data.access_token;
  }

  async skipTrack(userId: number) {
    try {
      const token = await this.getValidToken(userId);

      const response = await fetch('https://api.spotify.com/v1/me/player/next', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Length': '0',
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`[Spotify Reaction] Erreur Skip (${response.status}):`, errorText);

        if (response.status === 404) {
          console.warn(
            '[Spotify] Conseil : Assurez-vous que Spotify est ouvert et en lecture sur un appareil.'
          );
        }
        return;
      }

      console.log(`[Spotify] Musique passée au titre suivant pour l'user ${userId}`);
    } catch (error) {
      console.error('[Spotify Reaction Error]', error);
    }
  }

  async playPlaylist(userId: number, config: { playlist_uri: string }) {
    try {
      const token = await this.getValidToken(userId);

      const response = await fetch('https://api.spotify.com/v1/me/player/play', {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          context_uri: config.playlist_uri,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`[Spotify Reaction] Erreur Play Playlist (${response.status}):`, errorText);

        if (response.status === 404) {
          console.warn(
            "[Spotify] Erreur 404 : Aucun appareil actif trouvé. Lancez Spotify sur un appareil d'abord."
          );
        } else if (response.status === 403) {
          console.warn(
            "[Spotify] Erreur 403 : L'utilisateur n'a peut-être pas Spotify Premium ou les scopes sont insuffisants."
          );
        }
        return;
      }

      console.log(
        `[Spotify] Lecture de la playlist ${config.playlist_uri} lancée pour l'user ${userId}`
      );
    } catch (error) {
      console.error('[Spotify Reaction Error]', error);
    }
  }
}
