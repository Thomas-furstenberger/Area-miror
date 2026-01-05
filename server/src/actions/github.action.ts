import { PrismaClient } from '@prisma/client';

export class GithubAction {
  constructor(private prisma: PrismaClient) {}

  async checkNewCommit(
    userId: number,
    config: { repo_owner: string; repo_name: string },
    lastTriggered: Date | null
  ): Promise<boolean> {
    try {
      const account = await this.prisma.oAuthAccount.findFirst({
        where: { userId, provider: 'GITHUB' },
      });

      if (!account || !account.accessToken) {
        console.error(`[GitHub] Pas de compte connecté pour user ${userId}`);
        return false;
      }

      const url = `https://api.github.com/repos/${config.repo_owner}/${config.repo_name}/commits?per_page=1`;
      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${account.accessToken}`,
          Accept: 'application/vnd.github.v3+json',
          'User-Agent': 'Area-App',
        },
      });

      if (!response.ok) return false;
      const commits = await response.json();

      if (!commits || commits.length === 0) return false;

      const latestCommitDate = new Date(commits[0].commit.committer.date);

      if (!lastTriggered) {
        return false;
      }

      return latestCommitDate.getTime() > lastTriggered.getTime();
    } catch (e) {
      console.error('[GitHub Action Error]', e);
      return false;
    }
  }

  async createIssue(
    userId: number,
    config: { repo_owner: string; repo_name: string; title: string; body: string }
  ) {
    try {
      const account = await this.prisma.oAuthAccount.findFirst({
        where: { userId, provider: 'GITHUB' },
      });

      if (!account || !account.accessToken) return;

      await fetch(`https://api.github.com/repos/${config.repo_owner}/${config.repo_name}/issues`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${account.accessToken}`,
          Accept: 'application/vnd.github.v3+json',
          'User-Agent': 'Area-App',
        },
        body: JSON.stringify({
          title: config.title || 'Automated Issue',
          body: config.body || 'Created by Area',
        }),
      });
      console.log(`[GitHub] Issue créée sur ${config.repo_owner}/${config.repo_name}`);
    } catch (e) {
      console.error('[GitHub Reaction Error]', e);
    }
  }
}
