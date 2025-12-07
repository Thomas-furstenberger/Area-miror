export class TimerAction {
  checkTimeReached(config: { hour: number; minute: number }): boolean {
    const now = new Date();
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();

    if (currentHour === config.hour && currentMinute === config.minute) {
      console.log(`[Timer Action] Time reached: ${config.hour}:${config.minute}`);
      return true;
    }

    return false;
  }

  checkDateReached(config: { date: string }): boolean {
    const now = new Date();
    const today = now.toISOString().split('T')[0];

    if (today === config.date) {
      console.log(`[Timer Action] Date reached: ${config.date}`);
      return true;
    }

    return false;
  }

  checkDayOfWeek(config: { dayOfWeek: number }): boolean {
    const now = new Date();
    const currentDay = now.getDay();

    if (currentDay === config.dayOfWeek) {
      console.log(`[Timer Action] Day of week reached: ${config.dayOfWeek}`);
      return true;
    }

    return false;
  }
}
