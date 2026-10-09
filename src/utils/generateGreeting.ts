// Gera saudação personalizada com geolocalização, hora local, clima e AQI

interface WeatherData {
  city: string;
  timezone: string;
  temp: number;
  condition: string;
}

async function getWeatherData(lat: number, lon: number): Promise<WeatherData | null> {
  try {
    // Open-Meteo (gratuito, sem chave)
    const weatherRes = await fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,weather_code&timezone=auto`,
      { signal: AbortSignal.timeout(5000) }
    );
    if (!weatherRes.ok) return null;

    const weatherData = await weatherRes.json() as any;
    const current = weatherData.current;
    const timezone = weatherData.timezone;

    // Código de condição meteorológica WMO
    const weatherCode = current.weather_code;
    let condition = 'Céu limpo';

    if (weatherCode >= 45 && weatherCode <= 48) {
      condition = 'Nublado';
    } else if (weatherCode >= 51 && weatherCode <= 67) {
      condition = 'Chuva';
    } else if (weatherCode >= 71 && weatherCode <= 85) {
      condition = 'Neve';
    } else if (weatherCode >= 80 && weatherCode <= 82) {
      condition = 'Chuva forte';
    } else if (weatherCode === 95 || weatherCode === 96 || weatherCode === 99) {
      condition = 'Tempestade';
    }

    // Nominatim reverso para pegar cidade
    const nominatimRes = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`,
      { signal: AbortSignal.timeout(5000) }
    );
    const nominatimData = nominatimRes.ok ? (await nominatimRes.json() as any) : null;
    const city = nominatimData?.address?.city || nominatimData?.address?.town || 'Seu Local';

    return {
      city,
      timezone,
      temp: Math.round(current.temperature_2m),
      condition,
    };
  } catch {
    return null;
  }
}

function getTimePeriod(timezone: string): string {
  try {
    const formatter = new Intl.DateTimeFormat('pt-BR', {
      timeZone: timezone,
      hour: '2-digit',
      hour12: false,
    });
    const timeStr = formatter.format(new Date());
    const hour = parseInt(timeStr, 10);

    if (hour >= 5 && hour < 12) return 'Bom dia';
    if (hour >= 12 && hour < 18) return 'Boa tarde';
    return 'Boa noite';
  } catch {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) return 'Bom dia';
    if (hour >= 12 && hour < 18) return 'Boa tarde';
    return 'Boa noite';
  }
}

export async function generateGreeting(): Promise<string> {
  return new Promise((resolve) => {
    if (!navigator.geolocation) {
      resolve('Olá. Eu sou o JARVIS, seu assistente virtual. Como posso ajudá-lo?');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        const weather = await getWeatherData(latitude, longitude);

        if (!weather) {
          resolve('Olá. Eu sou o JARVIS, seu assistente virtual. Como posso ajudá-lo?');
          return;
        }

        const timePeriod = getTimePeriod(weather.timezone);
        const greeting = `${timePeriod}! Eu sou o JARVIS, seu assistente virtual. Em ${weather.city} está ${weather.condition.toLowerCase()}, ${weather.temp}°C. Como posso ajudá-lo?`;
        resolve(greeting);
      },
      () => {
        resolve('Olá. Eu sou o JARVIS, seu assistente virtual. Como posso ajudá-lo?');
      }
    );
  });
}
