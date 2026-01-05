import { PrismaClient } from '@prisma/client';

type Area = {
  id: string;
  userId: number;
  name: string;
  description: string | null;
  active: boolean;
  actionService: string;
  actionType: string;
  actionConfig: unknown;
  reactionService: string;
  reactionType: string;
  reactionConfig: unknown;
  lastTriggered: Date | null;
  createdAt: Date;
  updatedAt: Date;
};
import { AreaService } from './area.service';
import { GmailAction } from './actions/gmail.action';
import { TimerAction } from './actions/timer.action';
import { GithubAction } from './actions/github.action';
import { DiscordReaction } from './reactions/discord.reaction';
import { GmailService } from './reactions/gmail.reaction';

export class HookExecutor {
  private areaService: AreaService;
  private gmailAction: GmailAction;
  private timerAction: TimerAction;
  private githubAction: GithubAction;
  private discordReaction: DiscordReaction;
  private gmailService: GmailService;
  private isRunning: boolean = false;
  private lastTriggeredAreas: Map<string, Date> = new Map();
  private intervalId: NodeJS.Timeout | null = null;

  constructor(private prisma: PrismaClient) {
    this.areaService = new AreaService(prisma);
    this.gmailAction = new GmailAction(prisma);
    this.timerAction = new TimerAction();
    this.githubAction = new GithubAction(prisma);
    this.discordReaction = new DiscordReaction();
    this.gmailService = new GmailService(prisma);
  }

  async execute() {
    if (this.isRunning) {
      console.log('[Hook Executor] Already running, skipping...');
      return;
    }

    this.isRunning = true;
    console.log('[Hook Executor] Starting execution cycle...');

    try {
      const areas = await this.areaService.getActiveAreas();
      console.log(`[Hook Executor] Found ${areas.length} active areas`);

      for (const area of areas) {
        try {
          await this.processArea(area);
        } catch (error) {
          console.error(`[Hook Executor] Error processing area ${area.id}:`, error);
        }
      }
    } catch (error) {
      console.error('[Hook Executor] Error in execution cycle:', error);
    } finally {
      this.isRunning = false;
      console.log('[Hook Executor] Execution cycle completed');
    }
  }

  private async processArea(area: Area) {
    console.log(`[Hook Executor] Processing area: ${area.name} (${area.id})`);

    if (!area.lastTriggered) {
      console.log(
        `[Hook Executor] Init: Initialisation de la date de référence pour l'area ${area.name}`
      );
      await this.areaService.updateLastTriggered(area.id);
      return;
    }

    const lastTriggered = this.lastTriggeredAreas.get(area.id);
    const now = new Date();

    if (lastTriggered && now.getTime() - lastTriggered.getTime() < 60000) {
      return;
    }

    let triggered = false;

    if (area.actionService === 'gmail' && area.actionType === 'email_received') {
      triggered = await this.gmailAction.checkEmailReceived(
        area.userId,
        area.actionConfig,
        area.lastTriggered
      );
    } else if (area.actionService === 'github' && area.actionType === 'new_commit') {
      triggered = await this.githubAction.checkNewCommit(
        area.userId,
        area.actionConfig as { repo_owner: string; repo_name: string },
        area.lastTriggered
      );
    } else if (area.actionService === 'timer') {
      if (area.actionType === 'time_reached') {
        triggered = this.timerAction.checkTimeReached(
          area.actionConfig as { hour: number; minute: number }
        );
      } else if (area.actionType === 'date_reached') {
        triggered = this.timerAction.checkDateReached(area.actionConfig as { date: string });
      } else if (area.actionType === 'day_of_week') {
        triggered = this.timerAction.checkDayOfWeek(area.actionConfig as { dayOfWeek: number });
      }
    }

    if (!triggered) {
      return;
    }

    console.log(`[Hook Executor] Area triggered: ${area.name}`);
    this.lastTriggeredAreas.set(area.id, now);

    if (area.reactionService === 'discord' && area.reactionType === 'send_message') {
      const reactionConfig = area.reactionConfig as { webhookUrl?: string; message?: string };
      const webhookUrl = reactionConfig?.webhookUrl;

      if (!webhookUrl) {
        console.error(`[Hook Executor] No webhook URL configured for area ${area.id}`);
        return;
      }

      let message = reactionConfig?.message || 'AREA triggered!';

      if (area.actionService === 'gmail') {
        const emailSubject = await this.gmailAction.getLatestEmailSubject(area.userId);
        message = reactionConfig?.message || `📧 New email received: ${emailSubject}`;
      } else if (area.actionService === 'github') {
        message = reactionConfig?.message || `💻 New commit detected on repository!`;
      } else if (area.actionService === 'timer') {
        if (area.actionType === 'time_reached') {
          const { hour, minute } = area.actionConfig as { hour: number; minute: number };
          message =
            reactionConfig?.message ||
            `⏰ Time alert: ${hour}:${minute.toString().padStart(2, '0')}`;
        }
      }

      await this.discordReaction.sendMessage(webhookUrl, message);
    } else if (area.reactionService === 'gmail' && area.reactionType === 'send_email') {
      const { to, subject, body } = area.reactionConfig as {
        to: string;
        subject: string;
        body: string;
      };

      if (!to || !subject || !body) {
        console.error(`[Hook Executor] Missing email configuration for area ${area.id}`);
        return;
      }

      await this.gmailService.sendEmail(area.userId, to, subject, body);
    } else if (area.reactionService === 'github' && area.reactionType === 'create_issue') {
      const config = area.reactionConfig as {
        repo_owner: string;
        repo_name: string;
        title: string;
        body: string;
      };
      await this.githubAction.createIssue(area.userId, config);
    }

    await this.areaService.updateLastTriggered(area.id);
  }

  start(intervalMinutes: number = 2) {
    console.log(`[Hook Executor] Starting with ${intervalMinutes} minute interval`);

    this.execute();

    this.intervalId = setInterval(
      () => {
        this.execute();
      },
      intervalMinutes * 60 * 1000
    );
  }

  stop() {
    console.log('[Hook Executor] Stopping...');
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }
}
