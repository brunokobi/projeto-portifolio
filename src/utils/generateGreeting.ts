// Gera saudação personalizada com geolocalização, hora local, clima e AQI

interface WeatherData {
  city: string;
  timezone: string;
  temp: number;
  condition: string;
  icon: string;
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
    let icon = '☀️';

    if (weatherCode >= 45 && weatherCode <= 48) {
      condition = 'Nublado';
      icon = '🌫️';
    } else if (weatherCode >= 51 && weatherCode <= 67) {
      condition = 'Chuva';
      icon = '🌧️';
    } else if (weatherCode >= 71 && weatherCode <= 85) {
      condition = 'Neve';
      icon = '❄️';
    } else if (weatherCode >= 80 && weatherCode <= 82) {
      condition = 'Chuva forte';
      icon = '⛈️';
    } else if (weatherCode === 95 || weatherCode === 96 || weatherCode === 99) {
      condition = 'Tempestade';
      icon = '⚡';
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
      icon,
    };
  } catch {
    return null;
  }
}

async function getLocalTime(timezone: string): Promise<string> {
  try {
    const formatter = new Intl.DateTimeFormat('pt-BR', {
      timeZone: timezone,
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    });
    return formatter.format(new Date());
  } catch {
    return new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
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

        const localTime = await getLocalTime(weather.timezone);
        const greeting = `Olá! Eu sou o JARVIS, seu assistente virtual. ${weather.icon} Em ${weather.city} está ${weather.condition.toLowerCase()}, ${weather.temp}°C. Hora local: ${localTime}. Como posso ajudá-lo?`;
        resolve(greeting);
      },
      () => {
        resolve('Olá. Eu sou o JARVIS, seu assistente virtual. Como posso ajudá-lo?');
      }
    );
  });
}
