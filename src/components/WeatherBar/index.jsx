import { useEffect, useState } from "react";
import { Box, HStack, Text, Spinner } from "@chakra-ui/react";

const WMO = {
  0:  { icon: "☀️",  label: "Limpo" },
  1:  { icon: "🌤️", label: "Quase limpo" },
  2:  { icon: "⛅",  label: "Parcialmente nublado" },
  3:  { icon: "☁️",  label: "Nublado" },
  45: { icon: "🌫️", label: "Neblina" },
  48: { icon: "🌫️", label: "Geada" },
  51: { icon: "🌦️", label: "Garoa leve" },
  53: { icon: "🌦️", label: "Garoa" },
  55: { icon: "🌧️", label: "Garoa densa" },
  61: { icon: "🌧️", label: "Chuva leve" },
  63: { icon: "🌧️", label: "Chuva" },
  65: { icon: "🌧️", label: "Chuva forte" },
  71: { icon: "❄️",  label: "Neve leve" },
  73: { icon: "❄️",  label: "Neve" },
  75: { icon: "❄️",  label: "Neve forte" },
  77: { icon: "❄️",  label: "Granizo" },
  80: { icon: "🌦️", label: "Pancadas leves" },
  81: { icon: "🌧️", label: "Pancadas" },
  82: { icon: "⛈️", label: "Pancadas fortes" },
  85: { icon: "❄️",  label: "Neve leve" },
  86: { icon: "❄️",  label: "Neve forte" },
  95: { icon: "⛈️", label: "Tempestade" },
  96: { icon: "⛈️", label: "Tempestade c/ granizo" },
  99: { icon: "⛈️", label: "Tempestade c/ granizo" },
};

const WeatherBar = () => {
  const [weather, setWeather] = useState(null);
  const [city, setCity] = useState(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      try {
        const geo = await fetch("https://ipapi.co/json/").then((r) => r.json());
        if (cancelled) return;

        const { latitude, longitude, city: cityName, country_code } = geo;
        setCity(`${cityName}, ${country_code}`);

        const meteo = await fetch(
          `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,weather_code&timezone=auto`
        ).then((r) => r.json());
        if (cancelled) return;

        const { temperature_2m, weather_code } = meteo.current;
        setWeather({ temp: Math.round(temperature_2m), code: weather_code });
      } catch {
        if (!cancelled) setError(true);
      }
    };

    load();
    return () => { cancelled = true; };
  }, []);

  if (error) return null;

  const wmo = weather ? (WMO[weather.code] ?? { icon: "🌡️", label: "" }) : null;

  return (
    <Box
      position="fixed"
      top={0}
      right={0}
      zIndex={1000000}
      bg="rgba(0,0,0,0.72)"
      backdropFilter="blur(8px)"
      borderBottom="1px solid rgba(66,201,32,0.25)"
      borderLeft="1px solid rgba(66,201,32,0.25)"
      borderBottomLeftRadius="10px"
      px={3}
      py={1}
    >
      {!weather ? (
        <Spinner size="xs" color="#42c920" />
      ) : (
        <HStack spacing={2}>
          <Text fontSize="lg" lineHeight={1}>{wmo.icon}</Text>
          <Text fontSize="sm" color="#42c920" fontWeight="600" fontFamily="monospace">
            {weather.temp}°C
          </Text>
          {city && (
            <Text fontSize="xs" color="whiteAlpha.700" fontFamily="monospace">
              {city}
            </Text>
          )}
          <Text fontSize="xs" color="whiteAlpha.500" fontFamily="monospace" display={{ base: "none", md: "block" }}>
            {wmo.label}
          </Text>
        </HStack>
      )}
    </Box>
  );
};

export default WeatherBar;
