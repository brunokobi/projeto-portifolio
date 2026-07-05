import { useEffect, useState, useCallback } from "react";
import { Box, HStack, Text, Divider } from "@chakra-ui/react";
import { getGeoIP } from "../../utils/geoip";
import falar from "../TextAudio";

const WMO: Record<number, { icon: string; label: string }> = {
  0: { icon: "☀️", label: "Limpo" },
  1: { icon: "🌤️", label: "Quase limpo" },
  2: { icon: "⛅", label: "Parcialmente nublado" },
  3: { icon: "☁️", label: "Nublado" },
  45: { icon: "🌫️", label: "Neblina" },
  48: { icon: "🌫️", label: "Geada" },
  51: { icon: "🌦️", label: "Garoa leve" },
  53: { icon: "🌦️", label: "Garoa" },
  55: { icon: "🌧️", label: "Garoa densa" },
  61: { icon: "🌧️", label: "Chuva leve" },
  63: { icon: "🌧️", label: "Chuva" },
  65: { icon: "🌧️", label: "Chuva forte" },
  71: { icon: "❄️", label: "Neve leve" },
  73: { icon: "❄️", label: "Neve" },
  75: { icon: "❄️", label: "Neve forte" },
  77: { icon: "❄️", label: "Granizo" },
  80: { icon: "🌦️", label: "Pancadas leves" },
  81: { icon: "🌧️", label: "Pancadas" },
  82: { icon: "⛈️", label: "Pancadas fortes" },
  85: { icon: "❄️", label: "Neve leve" },
  86: { icon: "❄️", label: "Neve forte" },
  95: { icon: "⛈️", label: "Tempestade" },
  96: { icon: "⛈️", label: "Tempestade c/ granizo" },
  99: { icon: "⛈️", label: "Tempestade c/ granizo" },
};

const GREEN = "#42c920";
const GREEN_DIM = "rgba(66,201,32,0.18)";
const GREEN_GLOW = "0 0 8px rgba(66,201,32,0.55)";

// Busca coordenadas: tenta geolocalização do browser, cai no ipapi.co
const getCoords = () =>
  new Promise<{
    lat: number | null;
    lon: number | null;
    city: string | null;
    country?: string | null;
  }>((resolve) => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => resolve({ lat: pos.coords.latitude, lon: pos.coords.longitude, city: null }),
        () =>
          getGeoIP().then((g) =>
            resolve({
              lat: g.latitude ?? null,
              lon: g.longitude ?? null,
              city: g.city ?? null,
              country: g.country_code ?? null,
            })
          )
      );
    } else {
      getGeoIP().then((g) =>
        resolve({
          lat: g.latitude ?? null,
          lon: g.longitude ?? null,
          city: g.city ?? null,
          country: g.country_code ?? null,
        })
      );
    }
  });

type WeatherData = { temp: number; code: number; city: string | null };

const WeatherBar = () => {
  const [nightMode, setNightMode] = useState(() => localStorage.getItem("globeNight") === "1");

  const toggleNight = useCallback(() => {
    const next = !nightMode;
    setNightMode(next);
    localStorage.setItem("globeNight", next ? "1" : "0");
    window.dispatchEvent(new CustomEvent("globeNightToggle", { detail: { nightMode: next } }));
  }, [nightMode]);
  const [data, setData] = useState<WeatherData | null | false>(null); // null = carregando, false = erro, objeto = ok

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      try {
        const { lat, lon, city, country } = await getCoords();

        if (!lat || !lon) {
          if (!cancelled) setData(false);
          return;
        }

        const res = await fetch(
          `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,weather_code&timezone=auto`
        );
        const meteo = await res.json();
        if (cancelled) return;

        const { temperature_2m, weather_code } = meteo.current ?? {};
        if (temperature_2m == null) {
          setData(false);
          return;
        }

        // Se cidade não veio do browser, busca do ipapi (já em cache)
        let displayCity = city;
        let displayCountry = country;
        if (!displayCity) {
          const geo = await getGeoIP();
          displayCity = geo.city ?? null;
          displayCountry = geo.country_code ?? null;
        }

        setData({
          temp: Math.round(temperature_2m),
          code: weather_code,
          city: displayCity ? `${displayCity}, ${displayCountry}` : null,
        });
      } catch {
        if (!cancelled) setData(false);
      }
    };

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  // Não mostra nada enquanto carrega ou se falhou
  if (!data) return null;

  const wmo = WMO[data.code] ?? { icon: "🌡️", label: "" };

  return (
    <Box
      position="fixed"
      top={0}
      right={0}
      zIndex={1000000}
      bg="rgba(0,0,0,0.82)"
      onMouseEnter={() => {
        const city = data.city ? `, ${data.city}` : "";
        falar(`${data.temp} graus${city}, ${wmo.label}`);
      }}
      backdropFilter="blur(10px)"
      borderBottom={`1px solid ${GREEN_DIM}`}
      borderLeft={`1px solid ${GREEN_DIM}`}
      borderBottomLeftRadius="12px"
      px={4}
      py="6px"
      boxShadow={`0 2px 16px rgba(0,0,0,0.6), inset 0 0 0 1px rgba(66,201,32,0.06)`}
      style={{ animation: "weatherFadeIn 0.5s ease" }}
    >
      <style>{`@keyframes weatherFadeIn { from { opacity:0; transform:translateY(-8px); } to { opacity:1; transform:translateY(0); } }`}</style>

      <HStack spacing={3} align="center">
        <Text fontSize="md" lineHeight={1} userSelect="none">
          {wmo.icon}
        </Text>

        <Text
          fontSize="sm"
          fontWeight="700"
          color={GREEN}
          fontFamily="heading"
          letterSpacing="0.04em"
          style={{ textShadow: GREEN_GLOW }}
        >
          {data.temp}°C
        </Text>

        {data.city && (
          <>
            <Divider orientation="vertical" h="14px" borderColor={GREEN_DIM} />
            <Text fontSize="xs" color="whiteAlpha.600" fontFamily="heading" letterSpacing="0.03em">
              {data.city}
            </Text>
          </>
        )}

        <Text
          fontSize="xs"
          color="whiteAlpha.400"
          fontFamily="heading"
          display={{ base: "none", md: "block" }}
          letterSpacing="0.02em"
        >
          · {wmo.label}
        </Text>

        <Divider orientation="vertical" h="14px" borderColor={GREEN_DIM} />
        <Text
          as="button"
          fontSize="xs"
          fontFamily="monospace"
          color={GREEN}
          letterSpacing="0.06em"
          cursor="pointer"
          onClick={toggleNight}
          title={nightMode ? "Modo dia" : "Modo noite"}
          style={{ background: "none", border: "none", padding: 0 }}
          _hover={{ opacity: 0.7 }}
        >
          {nightMode ? "☀ DIA" : "☾ NOITE"}
        </Text>
      </HStack>
    </Box>
  );
};

export default WeatherBar;
