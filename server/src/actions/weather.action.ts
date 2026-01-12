export class WeatherAction {
  private apiKey: string;

  constructor() {
    this.apiKey = process.env.OPENWEATHER_API_KEY || '';
    if (!this.apiKey) {
      console.warn('[Weather] OPENWEATHER_API_KEY non configurée dans .env');
    }
  }

  async checkTemperatureAbove(
    config: { city: string; temperature: number },
    _lastTriggered: Date | null
  ): Promise<boolean> {
    try {
      if (!this.apiKey) {
        console.error('[Weather] API Key manquante');
        return false;
      }

      const url = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(config.city)}&appid=${this.apiKey}&units=metric`;
      const response = await fetch(url);

      if (!response.ok) {
        console.error(`[Weather] API Error: ${response.status}`);
        return false;
      }

      const data = (await response.json()) as {
        main: { temp: number };
      };

      const currentTemp = data.main.temp;
      console.log(
        `[Weather] Température à ${config.city}: ${currentTemp}°C (seuil: ${config.temperature}°C)`
      );

      return currentTemp > config.temperature;
    } catch (error) {
      console.error('[Weather Action Error]', error);
      return false;
    }
  }

  async checkTemperatureBelow(
    config: { city: string; temperature: number },
    _lastTriggered: Date | null
  ): Promise<boolean> {
    try {
      if (!this.apiKey) {
        console.error('[Weather] API Key manquante');
        return false;
      }

      const url = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(config.city)}&appid=${this.apiKey}&units=metric`;
      const response = await fetch(url);

      if (!response.ok) {
        console.error(`[Weather] API Error: ${response.status}`);
        return false;
      }

      const data = (await response.json()) as {
        main: { temp: number };
      };

      const currentTemp = data.main.temp;
      console.log(
        `[Weather] Température à ${config.city}: ${currentTemp}°C (seuil: ${config.temperature}°C)`
      );

      return currentTemp < config.temperature;
    } catch (error) {
      console.error('[Weather Action Error]', error);
      return false;
    }
  }

  async checkWeatherCondition(
    config: { city: string; condition: string },
    _lastTriggered: Date | null
  ): Promise<boolean> {
    try {
      if (!this.apiKey) {
        console.error('[Weather] API Key manquante');
        return false;
      }

      const url = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(config.city)}&appid=${this.apiKey}&units=metric`;
      const response = await fetch(url);

      if (!response.ok) {
        console.error(`[Weather] API Error: ${response.status}`);
        return false;
      }

      const data = (await response.json()) as {
        weather: Array<{ main: string }>;
      };

      if (!data.weather || data.weather.length === 0) return false;

      const currentCondition = data.weather[0].main.toLowerCase();
      const targetCondition = config.condition.toLowerCase();

      console.log(
        `[Weather] Condition à ${config.city}: ${currentCondition} (recherché: ${targetCondition})`
      );

      return currentCondition === targetCondition;
    } catch (error) {
      console.error('[Weather Action Error]', error);
      return false;
    }
  }
}
