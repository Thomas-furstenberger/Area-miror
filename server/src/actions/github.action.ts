import { PrismaClient } from '@prisma/client';

interface GithubActionConfig {
  repository: string;
  [key: string]: unknown;
}

export class GithubAction {
  constructor(private prisma: PrismaClient) {}

  async checkPullRequestOpened(userId: number, config: GithubActionConfig, dbLastTriggered: Date | null): Promise<boolean> {
    const { repository } = config as { repository: string };
    
    if (!repository) {
      console.log('[GitHub Action] Repository non configuré');
      return false;
    }

    const oauthAccount = await this.prisma.oAuthAccount.findFirst({
      where: {
        userId,
        provider: 'github',
      },
    });

    if (!oauthAccount || !oauthAccount.accessToken) {
      console.log(`[GitHub Action] Pas de compte GitHub connecté pour l'user ${userId}`);
      return false;
    }

    try {
      const response = await fetch(
        `https://api.github.com/repos/${repository}/pulls?state=open&sort=created&direction=desc&per_page=1`,
        {
          headers: {
            Authorization: `Bearer ${oauthAccount.accessToken}`,
            Accept: 'application/vnd.github.v3+json',
            'User-Agent': 'Area-App'
          },
        }
      );

      if (!response.ok) {
        console.error(`[GitHub Action] Erreur API GitHub: ${response.status}`);
        return false;
      }

      const pulls = await response.json();
      if (!pulls || pulls.length === 0) {
        return false;
      }

      const latestPr = pulls[0];
      const prCreatedAt = new Date(latestPr.created_at).getTime();
      
      const lastCheckTime = dbLastTriggered ? dbLastTriggered.getTime() : Date.now() - 5 * 60 * 1000;

      if (prCreatedAt > lastCheckTime) {
        console.log(`[GitHub Action] Nouvelle PR détectée: ${latestPr.title}`);
        return true;
      }

      return false;

    } catch (error) {
      console.error('[GitHub Action] Erreur technique:', error);
      return false;
    }
  }

    async getLatestPRDetails(_userId: number, _config: unknown): Promise<{ title: string; url: string; author: string }> {
    return { title: 'Dernière PR', url: '#', author: 'Inconnu' }; 
  }
}