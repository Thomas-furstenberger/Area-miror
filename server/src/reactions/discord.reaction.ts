export class DiscordReaction {
  async sendMessage(webhookUrl: string, message: string): Promise<boolean> {
    if (!webhookUrl) {
      console.error('[Discord Reaction] No webhook URL provided');
      return false;
    }

    try {
      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content: message,
          username: 'AREA Bot',
        }),
      });

      if (!response.ok) {
        console.error(`[Discord Reaction] Failed to send message: ${response.status}`);
        return false;
      }

      console.log('[Discord Reaction] Message sent successfully');
      return true;
    } catch (error) {
      console.error('[Discord Reaction] Error sending message:', error);
      return false;
    }
  }
}
