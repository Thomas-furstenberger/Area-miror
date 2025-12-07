import { PrismaClient } from '@prisma/client';
import { AreaService } from './area.service';
import { GmailAction } from './actions/gmail.action';
import { TimerAction } from './actions/timer.action';
import { DiscordReaction } from './reactions/discord.reaction';
import { GmailService } from './gmail.service';

export class HookExecutor {
  private areaService: AreaService;
  private gmailAction: GmailAction;
  private timerAction: TimerAction;
  private discordReaction: DiscordReaction;
  private gmailService: GmailService;
  private isRunning: boolean = false;
  private lastTriggeredAreas: Map<string, Date> = new Map();

  constructor(private prisma: PrismaClient) {
    this.areaService = new AreaService(prisma);
    this.gmailAction = new GmailAction(prisma);
    this.timerAction = new TimerAction();
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

  private async processArea(area: any) {
    console.log(`[Hook Executor] Processing area: ${area.name} (${area.id})`);

    const lastTriggered = this.lastTriggeredAreas.get(area.id);
    const now = new Date();

    if (lastTriggered && now.getTime() - lastTriggered.getTime() < 120000) {
      return;
    }

    let triggered = false;

    if (area.actionService === 'gmail' && area.actionType === 'email_received') {
      triggered = await this.gmailAction.checkEmailReceived(area.userId, area.actionConfig);
    } else if (area.actionService === 'timer') {
      if (area.actionType === 'time_reached') {
        triggered = this.timerAction.checkTimeReached(area.actionConfig);
      } else if (area.actionType === 'date_reached') {
        triggered = this.timerAction.checkDateReached(area.actionConfig);
      } else if (area.actionType === 'day_of_week') {
        triggered = this.timerAction.checkDayOfWeek(area.actionConfig);
      }
    }

    if (!triggered) {
      return;
    }

    console.log(`[Hook Executor] Area triggered: ${area.name}`);
    this.lastTriggeredAreas.set(area.id, now);

    if (area.reactionService === 'discord' && area.reactionType === 'send_message') {
      const webhookUrl = area.reactionConfig?.webhookUrl;

      if (!webhookUrl) {
        console.error(`[Hook Executor] No webhook URL configured for area ${area.id}`);
        return;
      }

      let message = area.reactionConfig?.message || 'AREA triggered!';

      if (area.actionService === 'gmail') {
        const emailSubject = await this.gmailAction.getLatestEmailSubject(area.userId);
        message = area.reactionConfig?.message || `📧 New email received: ${emailSubject}`;
      } else if (area.actionService === 'timer') {
        if (area.actionType === 'time_reached') {
          const { hour, minute } = area.actionConfig;
          message = area.reactionConfig?.message || `⏰ Time alert: ${hour}:${minute.toString().padStart(2, '0')}`;
        } else if (area.actionType === 'date_reached') {
          const { date } = area.actionConfig;
          message = area.reactionConfig?.message || `📅 Date alert: ${date}`;
        } else if (area.actionType === 'day_of_week') {
          const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
          const dayName = days[area.actionConfig.dayOfWeek];
          message = area.reactionConfig?.message || `📆 It's ${dayName}!`;
        }
      }

      await this.discordReaction.sendMessage(webhookUrl, message);
    } else if (area.reactionService === 'gmail' && area.reactionType === 'send_email') {
      const { to, subject, body } = area.reactionConfig;

      if (!to || !subject || !body) {
        console.error(`[Hook Executor] Missing email configuration for area ${area.id}`);
        return;
      }

      await this.gmailService.sendEmail(area.userId, to, subject, body);
    }

    await this.areaService.updateLastTriggered(area.id);
  }

  start(intervalMinutes: number = 2) {
    console.log(`[Hook Executor] Starting with ${intervalMinutes} minute interval`);

    this.execute();

    setInterval(() => {
      this.execute();
    }, intervalMinutes * 60 * 1000);
  }
}
