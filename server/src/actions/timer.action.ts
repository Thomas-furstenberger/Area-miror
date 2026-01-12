export class TimerAction {
  private async getTimeFromAPI(): Promise<Date> {
    try {
      const response = await fetch('http://worldtimeapi.org/api/timezone/Europe/Paris');
      if (!response.ok) {
        throw new Error('Failed to fetch time from API');
      }
      const data = (await response.json()) as { datetime: string };
      return new Date(data.datetime);
    } catch (error) {
      // API indisponible, retourner l'heure UTC du système
      // La conversion vers Paris time sera faite dans getParisTime()
      const utcNow = new Date();
      console.log(`[Timer Action] WorldTimeAPI unavailable, using system UTC time: ${utcNow.toISOString()}`);
      return utcNow;
    }
  }

  private getParisTime(date: Date): { hour: number; minute: number; day: number; month: number; year: number } {
    // Utiliser toLocaleString pour obtenir l'heure de Paris
    const parisTimeStr = date.toLocaleString('en-US', {
      timeZone: 'Europe/Paris',
      hour12: false,
      hour: '2-digit',
      minute: '2-digit',
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });

    // Format: "MM/DD/YYYY, HH:MM"
    const [datePart, timePart] = parisTimeStr.split(', ');
    const [month, day, year] = datePart.split('/').map(Number);
    const [hour, minute] = timePart.split(':').map(Number);

    console.log(`[Timer Action] Paris time: ${day}/${month}/${year} ${hour}:${minute.toString().padStart(2, '0')}`);

    return { hour, minute, day, month, year };
  }

  async checkTimeReached(
    config: { hour: number; minute: number },
    lastTriggered: Date | null
  ): Promise<boolean> {
    const now = await this.getTimeFromAPI();
    if (!now) return false;

    const { hour: currentHour, minute: currentMinute, day, month, year } = this.getParisTime(now);

    const currentTotalMinutes = currentHour * 60 + currentMinute;
    const targetTotalMinutes = config.hour * 60 + config.minute;

    // Si lastTriggered existe, vérifier qu'on n'a pas déjà déclenché aujourd'hui à cette heure précise
    if (lastTriggered) {
      const lastDate = new Date(lastTriggered);
      const lastParisTime = this.getParisTime(lastDate);

      const isSameDay =
        lastParisTime.day === day &&
        lastParisTime.month === month &&
        lastParisTime.year === year;

      // Si on a déjà déclenché aujourd'hui
      if (isSameDay) {
        const lastTotalMinutes = lastParisTime.hour * 60 + lastParisTime.minute;

        // Si lastTriggered est >= à l'heure cible, on a déjà déclenché pour cette heure aujourd'hui
        if (lastTotalMinutes >= targetTotalMinutes) {
          return false;
        }
        // Sinon, lastTriggered était avant l'heure cible, on peut déclencher si l'heure est atteinte
      }
    }

    // Déclencher si l'heure cible est atteinte ou dépassée
    if (currentTotalMinutes >= targetTotalMinutes) {
      console.log(`[Timer Action] Time reached: ${config.hour}:${config.minute} (once per day)`);
      return true;
    }

    return false;
  }

  async checkDateReached(config: { date: string }): Promise<boolean> {
    const now = await this.getTimeFromAPI();
    if (!now) return false;

    const { day, month, year } = this.getParisTime(now);
    const today = `${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;

    if (today === config.date) {
      console.log(`[Timer Action] Date reached: ${config.date}`);
      return true;
    }

    return false;
  }

  async checkDayOfWeek(config: { dayOfWeek: number }): Promise<boolean> {
    const now = await this.getTimeFromAPI();
    if (!now) return false;

    // Obtenir le jour de la semaine en timezone Paris
    const parisTimeStr = now.toLocaleString('en-US', {
      timeZone: 'Europe/Paris',
      weekday: 'short'
    });

    // Convertir "Mon", "Tue", etc. en numéro (0 = Sunday, 1 = Monday, ...)
    const dayMap: Record<string, number> = {
      Sun: 0,
      Mon: 1,
      Tue: 2,
      Wed: 3,
      Thu: 4,
      Fri: 5,
      Sat: 6
    };

    const currentDay = dayMap[parisTimeStr];

    if (currentDay === config.dayOfWeek) {
      console.log(`[Timer Action] Day of week reached: ${config.dayOfWeek}`);
      return true;
    }

    return false;
  }
}
