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
import { YoutubeAction } from './actions/youtube.action';
import { WeatherAction } from './actions/weather.action';
import { WeatherReaction } from './reactions/weather.reaction';
import { DiscordAction } from './actions/discord.action';
import { YoutubeReaction } from './reactions/youtube.reaction';

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
  private youtubeAction: YoutubeAction;
  private weatherAction: WeatherAction;
  private weatherReaction: WeatherReaction;
  private discordAction: DiscordAction;
  private youtubeReaction: YoutubeReaction;

  constructor(private prisma: PrismaClient) {
    this.areaService = new AreaService(prisma);
    this.gmailAction = new GmailAction(prisma);
    this.timerAction = new TimerAction();
    this.youtubeAction = new YoutubeAction(prisma);
    this.githubAction = new GithubAction(prisma);
    this.discordReaction = new DiscordReaction();
    this.gmailService = new GmailService(prisma);
    this.weatherAction = new WeatherAction();
    this.weatherReaction = new WeatherReaction();
    this.discordAction = new DiscordAction(prisma);
    this.youtubeReaction = new YoutubeReaction(prisma);
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

      if (area.actionService !== 'timer') {
        return;
      }
    }

    const lastTriggered = this.lastTriggeredAreas.get(area.id);
    const now = new Date();

    // Protection contre les déclenchements multiples : 15 secondes minimum entre chaque
    if (lastTriggered && now.getTime() - lastTriggered.getTime() < 15000) {
      return;
    }

    let triggered = false;

    if (area.actionService === 'gmail' && area.actionType === 'email_received') {
      triggered = await this.gmailAction.checkEmailReceived(
        area.userId,
        area.actionConfig,
        area.lastTriggered
      );
    } else if (area.actionService === 'youtube' && area.actionType === 'new_video') {
      triggered = await this.youtubeAction.checkNewVideo(
        area.userId,
        area.actionConfig as { channel_url: string },
        area.lastTriggered
      );
    } else if (area.actionService === 'github') {
      if (area.actionType === 'new_commit') {
        triggered = await this.githubAction.checkNewCommit(
          area.userId,
          area.actionConfig as { repo_owner: string; repo_name: string },
          area.lastTriggered
        );
      } else if (area.actionType === 'new_issue') {
        triggered = await this.githubAction.checkNewIssue(
          area.userId,
          area.actionConfig as { repo_owner: string; repo_name: string },
          area.lastTriggered
        );
      } else if (area.actionType === 'new_star') {
        triggered = await this.githubAction.checkNewStar(
          area.userId,
          area.actionConfig as { repo_owner: string; repo_name: string },
          area.lastTriggered
        );
      }
    } else if (area.actionService === 'discord') {
      if (area.actionType === 'message_received') {
        triggered = await this.discordAction.checkMessageReceived(
          area.userId,
          area.actionConfig as { webhook_url: string; guild_id?: string; channel_id?: string },
          area.lastTriggered
        );
      } else if (area.actionType === 'user_joined') {
        triggered = await this.discordAction.checkUserJoined(
          area.userId,
          area.actionConfig as { guild_id: string },
          area.lastTriggered
        );
      }
    } else if (area.actionService === 'timer') {
      if (area.actionType === 'time_reached') {
        triggered = await this.timerAction.checkTimeReached(
          area.actionConfig as { hour: number; minute: number },
          area.lastTriggered
        );
      } else if (area.actionType === 'date_reached') {
        triggered = await this.timerAction.checkDateReached(area.actionConfig as { date: string });
      } else if (area.actionType === 'day_of_week') {
        triggered = await this.timerAction.checkDayOfWeek(area.actionConfig as { dayOfWeek: number });
      }
    } else if (area.actionService === 'weather') {
      if (area.actionType === 'temperature_above') {
        triggered = await this.weatherAction.checkTemperatureAbove(
          area.actionConfig as { city: string; temperature: number },
          area.lastTriggered
        );
      } else if (area.actionType === 'temperature_below') {
        triggered = await this.weatherAction.checkTemperatureBelow(
          area.actionConfig as { city: string; temperature: number },
          area.lastTriggered
        );
      } else if (area.actionType === 'weather_condition') {
        triggered = await this.weatherAction.checkWeatherCondition(
          area.actionConfig as { city: string; condition: string },
          area.lastTriggered
        );
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
    } else if (area.reactionService === 'github') {
      if (area.reactionType === 'create_issue') {
        const config = area.reactionConfig as {
          repo_owner: string;
          repo_name: string;
          title: string;
          body: string;
        };
        await this.githubAction.createIssue(area.userId, config);
      } else if (area.reactionType === 'add_comment') {
        const config = area.reactionConfig as {
          repo_owner: string;
          repo_name: string;
          issue_number: number;
          comment: string;
        };
        await this.githubAction.addComment(area.userId, config);
      }
    } else if (area.reactionService === 'gmail') {
      if (area.reactionType === 'send_email') {
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
      } else if (area.reactionType === 'mark_as_read') {
        const config = area.reactionConfig as { messageId: string };
        await this.gmailService.markAsRead(area.userId, config.messageId);
      }
    } else if (area.reactionService === 'youtube' && area.reactionType === 'add_to_playlist') {
      const config = area.reactionConfig as { playlist_id: string; video_id: string };
      await this.youtubeReaction.addToPlaylist(area.userId, config);
    } else if (area.reactionService === 'weather' && area.reactionType === 'send_weather_info') {
      const config = area.reactionConfig as {
        city: string;
        destination: string;
        discord_webhook?: string;
        email_to?: string;
      };

      const weatherInfo = await this.weatherReaction.getDetailedWeather(config.city);

      if (!weatherInfo) {
        console.error(`[Hook Executor] Failed to get weather info for ${config.city}`);
        return;
      }

      if (config.destination === 'discord' && config.discord_webhook) {
        await this.discordReaction.sendMessage(config.discord_webhook, weatherInfo);
      } else if (config.destination === 'gmail' && config.email_to) {
        await this.gmailService.sendEmail(
          area.userId,
          config.email_to,
          `Météo à ${config.city}`,
          weatherInfo
        );
      }
    } else if (area.reactionService === 'youtube' && area.reactionType === 'like_video') {
      const config = area.reactionConfig as { video_url: string };

      if (!config.video_url) {
        return;
      }

      await this.youtubeReaction.likeVideo(area.userId, config.video_url);
    }

    await this.areaService.updateLastTriggered(area.id);
  }

  start(intervalMinutes: number = 2) {
    const intervalSeconds = intervalMinutes * 60;
    console.log(`[Hook Executor] Starting with ${intervalSeconds} second interval (${intervalMinutes} minutes)`);

    this.execute();

    this.intervalId = setInterval(
      () => {
        this.execute();
      },
      intervalSeconds * 1000
    );
  }

  startWithSeconds(intervalSeconds: number = 15) {
    console.log(`[Hook Executor] Starting with ${intervalSeconds} second interval`);

    this.execute();

    this.intervalId = setInterval(
      () => {
        this.execute();
      },
      intervalSeconds * 1000
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
