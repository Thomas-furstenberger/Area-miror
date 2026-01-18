import { GithubReaction } from '../reactions/github.reaction';
import { PrismaClient } from '@prisma/client';

global.fetch = jest.fn();

const mockPrisma = {
  oAuthAccount: {
    findFirst: jest.fn(),
  },
} as unknown as PrismaClient;

describe('GithubReaction', () => {
  let githubReaction: GithubReaction;

  beforeEach(() => {
    githubReaction = new GithubReaction(mockPrisma);
    jest.clearAllMocks();
  });

  describe('createIssue', () => {
    it("doit appeler l'API GitHub avec les bons paramètres", async () => {
      (mockPrisma.oAuthAccount.findFirst as jest.Mock).mockResolvedValue({
        accessToken: 'fake_gh_token',
      });

      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => ({ html_url: 'http://github.com/issue/1' }),
      });

      await githubReaction.createIssue(1, {
        repo_owner: 'user',
        repo_name: 'repo',
        title: 'Bug',
        body: 'Description',
      });

      expect(global.fetch).toHaveBeenCalledWith(
        'https://api.github.com/repos/user/repo/issues',
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            Authorization: 'Bearer fake_gh_token',
          }),
          body: JSON.stringify({
            title: 'Bug',
            body: 'Description',
          }),
        })
      );
    });

    it("ne doit rien faire si l'utilisateur n'a pas de compte GitHub", async () => {
      (mockPrisma.oAuthAccount.findFirst as jest.Mock).mockResolvedValue(null);

      await githubReaction.createIssue(1, {
        repo_owner: 'user',
        repo_name: 'repo',
        title: 'Title',
        body: 'Body',
      });

      expect(global.fetch).not.toHaveBeenCalled();
    });
  });
});
