import { useEffect, useState } from "react";
import { Box, HStack, Text, Spinner, Divider } from "@chakra-ui/react";
import { motion } from "framer-motion";

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

const GREEN = "#42c920";
const GREEN_DIM = "rgba(66,201,32,0.18)";
const GREEN_GLOW = "0 0 8px rgba(66,201,32,0.55)";

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
      as={motion.div}
      initial={{ opacity: 0, y: -12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      position="fixed"
      top={0}
      right={0}
      zIndex={1000000}
      bg="rgba(0,0,0,0.82)"
      backdropFilter="blur(10px)"
      borderBottom={`1px solid ${GREEN_DIM}`}
      borderLeft={`1px solid ${GREEN_DIM}`}
      borderBottomLeftRadius="12px"
      px={4}
      py="6px"
      boxShadow={`0 2px 16px rgba(0,0,0,0.6), inset 0 0 0 1px rgba(66,201,32,0.06)`}
    >
      {!weather ? (
        <Spinner size="xs" color={GREEN} thickness="2px" />
      ) : (
        <HStack spacing={3} align="center">
          {/* Ícone */}
          <Text fontSize="md" lineHeight={1} userSelect="none">
            {wmo.icon}
          </Text>

          {/* Temperatura com glow */}
          <Text
            fontSize="sm"
            fontWeight="700"
            color={GREEN}
            fontFamily="heading"
            letterSpacing="0.04em"
            style={{ textShadow: GREEN_GLOW }}
          >
            {weather.temp}°C
          </Text>

          {/* Divisor estilo terminal */}
          <Divider
            orientation="vertical"
            h="14px"
            borderColor={GREEN_DIM}
          />

          {/* Cidade */}
          {city && (
            <Text
              fontSize="xs"
              color="whiteAlpha.600"
              fontFamily="heading"
              letterSpacing="0.03em"
            >
              {city}
            </Text>
          )}

          {/* Condição — oculto no mobile */}
          <Text
            fontSize="xs"
            color="whiteAlpha.400"
            fontFamily="heading"
            display={{ base: "none", md: "block" }}
            letterSpacing="0.02em"
          >
            · {wmo.label}
          </Text>
        </HStack>
      )}
    </Box>
  );
};

export default WeatherBar;
