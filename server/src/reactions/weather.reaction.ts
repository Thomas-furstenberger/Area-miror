export class WeatherReaction {
  constructor() {
    console.log('[Weather Reaction] Using Open-Meteo API (no API key required)');
  }

  private getWeatherDescription(weatherCode: number): string {
    // WMO Weather interpretation codes (WW)
    const weatherCodes: Record<number, string> = {
      0: 'Ciel dégagé',
      1: 'Principalement dégagé',
      2: 'Partiellement nuageux',
      3: 'Couvert',
      45: 'Brouillard',
      48: 'Brouillard givrant',
      51: 'Bruine légère',
      53: 'Bruine modérée',
      55: 'Bruine dense',
      61: 'Pluie légère',
      63: 'Pluie modérée',
      65: 'Pluie forte',
      71: 'Neige légère',
      73: 'Neige modérée',
      75: 'Neige forte',
      77: 'Grésil',
      80: 'Averses légères',
      81: 'Averses modérées',
      82: 'Averses violentes',
      85: 'Averses de neige légères',
      86: 'Averses de neige fortes',
      95: 'Orage',
      96: 'Orage avec grêle légère',
      99: 'Orage avec grêle forte',
    };
    return weatherCodes[weatherCode] || 'Conditions inconnues';
  }

  async getDetailedWeather(city: string): Promise<string | null> {
    try {
      // Nettoyer le nom de la ville (supprimer les espaces avant/après)
      const cleanCity = city.trim();

      // Étape 1 : Géocoder la ville pour obtenir les coordonnées
      const geocodeUrl = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(cleanCity)}&count=1&language=fr&format=json`;
      const geocodeResponse = await fetch(geocodeUrl);

      if (!geocodeResponse.ok) {
        console.error(`[Weather Reaction] Geocoding Error: ${geocodeResponse.status}`);
        return null;
      }

      const geocodeData = (await geocodeResponse.json()) as {
        results?: Array<{
          name: string;
          country: string;
          latitude: number;
          longitude: number;
        }>;
      };

      if (!geocodeData.results || geocodeData.results.length === 0) {
        console.error(`[Weather Reaction] City not found: ${city}`);
        return null;
      }

      const location = geocodeData.results[0];
      console.log(
        `[Weather Reaction] Found: ${location.name}, ${location.country} (${location.latitude}, ${location.longitude})`
      );

      // Étape 2 : Obtenir les données météo
      const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${location.latitude}&longitude=${location.longitude}&current=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,weather_code,surface_pressure,wind_speed_10m,wind_direction_10m&timezone=auto`;
      const weatherResponse = await fetch(weatherUrl);

      if (!weatherResponse.ok) {
        console.error(`[Weather Reaction] Weather API Error: ${weatherResponse.status}`);
        return null;
      }

      const weatherData = (await weatherResponse.json()) as {
        current: {
          temperature_2m: number;
          apparent_temperature: number;
          relative_humidity_2m: number;
          precipitation: number;
          weather_code: number;
          surface_pressure: number;
          wind_speed_10m: number;
          wind_direction_10m: number;
        };
      };

      const current = weatherData.current;
      const weatherDescription = this.getWeatherDescription(current.weather_code);

      const weatherInfo = `🌍 **Météo à ${location.name}, ${location.country}**

🌡️ **Température:** ${Math.round(current.temperature_2m)}°C (ressenti: ${Math.round(current.apparent_temperature)}°C)
☁️ **Conditions:** ${weatherDescription}
💧 **Humidité:** ${current.relative_humidity_2m}%
🌬️ **Vent:** ${Math.round(current.wind_speed_10m)} km/h (direction: ${current.wind_direction_10m}°)
🌧️ **Précipitations:** ${current.precipitation} mm
🔽 **Pression:** ${Math.round(current.surface_pressure)} hPa

_Source: Open-Meteo_`;

      console.log(`[Weather Reaction] Météo récupérée pour ${location.name}`);
      return weatherInfo;
    } catch (error) {
      console.error('[Weather Reaction Error]', error);
      return null;
    }
  }
}
