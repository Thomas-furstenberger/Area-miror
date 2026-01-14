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
      const commits = (await response.json()) as Array<{
        commit: { committer: { date: string } };
      }>;

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

  async checkNewIssue(
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

      const url = `https://api.github.com/repos/${config.repo_owner}/${config.repo_name}/issues?per_page=1&state=all&sort=created&direction=desc`;
      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${account.accessToken}`,
          Accept: 'application/vnd.github.v3+json',
          'User-Agent': 'Area-App',
        },
      });

      if (!response.ok) return false;
      const issues = (await response.json()) as Array<{ created_at: string }>;

      if (!issues || issues.length === 0) return false;

      const latestIssueDate = new Date(issues[0].created_at);

      if (!lastTriggered) {
        return false;
      }

      return latestIssueDate.getTime() > lastTriggered.getTime();
    } catch (e) {
      console.error('[GitHub Action Error]', e);
      return false;
    }
  }

  async checkNewStar(
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

      const url = `https://api.github.com/repos/${config.repo_owner}/${config.repo_name}/stargazers?per_page=1`;
      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${account.accessToken}`,
          Accept: 'application/vnd.github.v3.star+json',
          'User-Agent': 'Area-App',
        },
      });

      if (!response.ok) return false;
      const stars = (await response.json()) as Array<{ starred_at: string }>;

      if (!stars || stars.length === 0) return false;

      const latestStarDate = new Date(stars[0].starred_at);

      if (!lastTriggered) {
        return false;
      }

      return latestStarDate.getTime() > lastTriggered.getTime();
    } catch (e) {
      console.error('[GitHub Action Error]', e);
      return false;
    }
  }
}
