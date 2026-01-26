export class WeatherAction {
  constructor() {
    console.log('[Weather Action] Using Open-Meteo API (no API key required)');
  }

  private async getCoordinates(
    city: string
  ): Promise<{ latitude: number; longitude: number } | null> {
    try {
      const cleanCity = city.trim();

      const geocodeUrl = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(cleanCity)}&count=1&language=fr&format=json`;
      const response = await fetch(geocodeUrl);

      if (!response.ok) {
        console.error(`[Weather] Geocoding Error: ${response.status}`);
        return null;
      }

      const data = (await response.json()) as {
        results?: Array<{
          latitude: number;
          longitude: number;
        }>;
      };

      if (!data.results || data.results.length === 0) {
        console.error(`[Weather] City not found: ${city}`);
        return null;
      }

      return {
        latitude: data.results[0].latitude,
        longitude: data.results[0].longitude,
      };
    } catch (error) {
      console.error('[Weather] Geocoding error:', error);
      return null;
    }
  }

  async checkTemperatureAbove(
    config: { city: string; temperature: number },
    lastTriggered: Date | null
  ): Promise<boolean> {
    try {
      if (lastTriggered) {
        const now = new Date();
        const lastTriggerDate = new Date(lastTriggered);

        if (
          now.getFullYear() === lastTriggerDate.getFullYear() &&
          now.getMonth() === lastTriggerDate.getMonth() &&
          now.getDate() === lastTriggerDate.getDate()
        ) {
          return false;
        }
      }

      const coords = await this.getCoordinates(config.city);
      if (!coords) return false;

      const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${coords.latitude}&longitude=${coords.longitude}&current=temperature_2m&timezone=auto`;
      const response = await fetch(weatherUrl);

      if (!response.ok) {
        console.error(`[Weather] API Error: ${response.status}`);
        return false;
      }

      const data = (await response.json()) as {
        current: { temperature_2m: number };
      };

      const currentTemp = data.current.temperature_2m;
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
    lastTriggered: Date | null
  ): Promise<boolean> {
    try {
      if (lastTriggered) {
        const now = new Date();
        const lastTriggerDate = new Date(lastTriggered);

        if (
          now.getFullYear() === lastTriggerDate.getFullYear() &&
          now.getMonth() === lastTriggerDate.getMonth() &&
          now.getDate() === lastTriggerDate.getDate()
        ) {
          return false;
        }
      }

      const coords = await this.getCoordinates(config.city);
      if (!coords) return false;

      const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${coords.latitude}&longitude=${coords.longitude}&current=temperature_2m&timezone=auto`;
      const response = await fetch(weatherUrl);

      if (!response.ok) {
        console.error(`[Weather] API Error: ${response.status}`);
        return false;
      }

      const data = (await response.json()) as {
        current: { temperature_2m: number };
      };

      const currentTemp = data.current.temperature_2m;
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
    lastTriggered: Date | null
  ): Promise<boolean> {
    try {
      if (lastTriggered) {
        const now = new Date();
        const lastTriggerDate = new Date(lastTriggered);

        if (
          now.getFullYear() === lastTriggerDate.getFullYear() &&
          now.getMonth() === lastTriggerDate.getMonth() &&
          now.getDate() === lastTriggerDate.getDate()
        ) {
          return false;
        }
      }

      const coords = await this.getCoordinates(config.city);
      if (!coords) return false;

      const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${coords.latitude}&longitude=${coords.longitude}&current=weather_code&timezone=auto`;
      const response = await fetch(weatherUrl);

      if (!response.ok) {
        console.error(`[Weather] API Error: ${response.status}`);
        return false;
      }

      const data = (await response.json()) as {
        current: { weather_code: number };
      };

      const weatherCode = data.current.weather_code;
      const currentCondition = this.mapWeatherCodeToCondition(weatherCode);
      const targetCondition = config.condition.toLowerCase();

      console.log(
        `[Weather] Condition à ${config.city}: ${currentCondition} (code: ${weatherCode}, recherché: ${targetCondition})`
      );

      return currentCondition === targetCondition;
    } catch (error) {
      console.error('[Weather Action Error]', error);
      return false;
    }
  }

  private mapWeatherCodeToCondition(code: number): string {
    if (code === 0 || code === 1) return 'clear';
    if (code >= 2 && code <= 3) return 'clouds';
    if (code >= 45 && code <= 48) return 'mist';
    if (code >= 51 && code <= 57) return 'drizzle';
    if (code >= 61 && code <= 67) return 'rain';
    if (code >= 71 && code <= 77) return 'snow';
    if (code >= 80 && code <= 82) return 'rain';
    if (code >= 85 && code <= 86) return 'snow';
    if (code >= 95 && code <= 99) return 'thunderstorm';
    return 'unknown';
  }
}
