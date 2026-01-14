import { PrismaClient } from '@prisma/client';

interface AddCommentConfig {
  repo_owner: string;
  repo_name: string;
  issue_option: 'specific' | 'last';
  issue_number?: number;
  comment: string;
}

interface CreateIssueConfig {
  repo_owner: string;
  repo_name: string;
  title: string;
  body: string;
}

export class GithubReaction {
  constructor(private prisma: PrismaClient) {}

  async createIssue(userId: number, config: CreateIssueConfig) {
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

  async addComment(userId: number, config: AddCommentConfig) {
    try {
      const account = await this.prisma.oAuthAccount.findFirst({
        where: { userId, provider: 'GITHUB' },
      });

      if (!account || !account.accessToken) return;

      let targetIssueNumber = config.issue_number;

      if (config.issue_option === 'last') {
        try {
          const issuesResponse = await fetch(
            `https://api.github.com/repos/${config.repo_owner}/${config.repo_name}/issues?per_page=1&sort=created&direction=desc`,
            {
              headers: {
                Authorization: `Bearer ${account.accessToken}`,
                Accept: 'application/vnd.github.v3+json',
                'User-Agent': 'Area-App',
              },
            }
          );

          if (issuesResponse.ok) {
            const issues = (await issuesResponse.json()) as Array<{ number: number }>;

            if (issues && issues.length > 0) {
              targetIssueNumber = issues[0].number;
              console.log(`[GitHub] Dernière issue trouvée : #${targetIssueNumber}`);
            }
          }
        } catch (err) {
          console.error('[GitHub] Erreur récupération dernière issue:', err);
        }
      }

      if (!targetIssueNumber) {
        console.error("[GitHub] Aucun numéro d'issue déterminé pour le commentaire.");
        return;
      }

      await fetch(
        `https://api.github.com/repos/${config.repo_owner}/${config.repo_name}/issues/${targetIssueNumber}/comments`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${account.accessToken}`,
            Accept: 'application/vnd.github.v3+json',
            'User-Agent': 'Area-App',
          },
          body: JSON.stringify({
            body: config.comment,
          }),
        }
      );
      console.log(
        `[GitHub] Commentaire ajouté à l'issue #${targetIssueNumber} sur ${config.repo_owner}/${config.repo_name}`
      );
    } catch (e) {
      console.error('[GitHub Reaction Error]', e);
    }
  }
}
