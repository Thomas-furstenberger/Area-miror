export class WeatherReaction {
  private apiKey: string;

  constructor() {
    this.apiKey = process.env.OPENWEATHER_API_KEY || '';
    if (!this.apiKey) {
      console.warn('[Weather Reaction] OPENWEATHER_API_KEY non configurée dans .env');
    }
  }

  async getDetailedWeather(city: string): Promise<string | null> {
    try {
      if (!this.apiKey) {
        console.error('[Weather Reaction] API Key manquante');
        return null;
      }

      const url = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&appid=${this.apiKey}&units=metric&lang=fr`;
      const response = await fetch(url);

      if (!response.ok) {
        console.error(`[Weather Reaction] API Error: ${response.status}`);
        return null;
      }

      const data = (await response.json()) as {
        name: string;
        sys: { country: string };
        main: {
          temp: number;
          feels_like: number;
          humidity: number;
          pressure: number;
        };
        weather: Array<{ description: string; main: string }>;
        wind: { speed: number };
        clouds: { all: number };
      };

      const weatherInfo = `🌍 **Météo à ${data.name}, ${data.sys.country}**

🌡️ **Température:** ${Math.round(data.main.temp)}°C (ressenti: ${Math.round(data.main.feels_like)}°C)
☁️ **Conditions:** ${data.weather[0].description}
💧 **Humidité:** ${data.main.humidity}%
🌬️ **Vent:** ${Math.round(data.wind.speed * 3.6)} km/h
☁️ **Couverture nuageuse:** ${data.clouds.all}%
🔽 **Pression:** ${data.main.pressure} hPa`;

      console.log(`[Weather Reaction] Météo récupérée pour ${city}`);
      return weatherInfo;
    } catch (error) {
      console.error('[Weather Reaction Error]', error);
      return null;
    }
  }
}
