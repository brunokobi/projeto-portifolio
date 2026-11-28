import { useEffect, useState, useCallback } from "react";
import {
  Box,
  HStack,
  Text,
  Divider,
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverBody,
  SimpleGrid,
  useBreakpointValue,
} from "@chakra-ui/react";
import { getGeoIP } from "../../utils/geoip";
import { useGlobeReady } from "../../utils/globeReady";
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
          ),
        { timeout: 8000 }
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

const WeatherBar = ({ waitForGlobe }: { waitForGlobe: boolean }) => {
  const globeReady = useGlobeReady();
  const isMobile = useBreakpointValue({ base: true, md: false }, { ssr: false }) ?? false;
  // No celular a lista de camadas só aparece na Home, a única página com o globo.
  const showLayers = waitForGlobe || !isMobile;
  const [nightMode, setNightMode] = useState(() => localStorage.getItem("globeNight") === "1");
  const [windEnabled, setWindEnabled] = useState(() => localStorage.getItem("globeWind") !== "0");

  const toggleNight = useCallback(() => {
    const next = !nightMode;
    setNightMode(next);
    localStorage.setItem("globeNight", next ? "1" : "0");
    window.dispatchEvent(new CustomEvent("globeNightToggle", { detail: { nightMode: next } }));
  }, [nightMode]);

  const toggleWind = useCallback(() => {
    const next = !windEnabled;
    setWindEnabled(next);
    localStorage.setItem("globeWind", next ? "1" : "0");
    window.dispatchEvent(new CustomEvent("globeWindToggle", { detail: { windEnabled: next } }));
  }, [windEnabled]);

  const [quakesEnabled, setQuakesEnabled] = useState(() => localStorage.getItem("globeQuakes") !== "0");
  const toggleQuakes = useCallback(() => {
    const next = !quakesEnabled;
    setQuakesEnabled(next);
    localStorage.setItem("globeQuakes", next ? "1" : "0");
    window.dispatchEvent(new CustomEvent("globeQuakesToggle", { detail: { quakesEnabled: next } }));
  }, [quakesEnabled]);

  const [volcanoesEnabled, setVolcanoesEnabled] = useState(() => localStorage.getItem("globeVolcanoes") !== "0");
  const toggleVolcanoes = useCallback(() => {
    const next = !volcanoesEnabled;
    setVolcanoesEnabled(next);
    localStorage.setItem("globeVolcanoes", next ? "1" : "0");
    window.dispatchEvent(new CustomEvent("globeVolcanoesToggle", { detail: { volcanoesEnabled: next } }));
  }, [volcanoesEnabled]);

  const [issEnabled, setIssEnabled] = useState(() => localStorage.getItem("globeIss") !== "0");
  const toggleIss = useCallback(() => {
    const next = !issEnabled;
    setIssEnabled(next);
    localStorage.setItem("globeIss", next ? "1" : "0");
    window.dispatchEvent(new CustomEvent("globeIssToggle", { detail: { issEnabled: next } }));
  }, [issEnabled]);


  const [hurricanesEnabled, setHurricanesEnabled] = useState(() => localStorage.getItem("globeHurricanes") !== "0");
  const toggleHurricanes = useCallback(() => {
    const next = !hurricanesEnabled;
    setHurricanesEnabled(next);
    localStorage.setItem("globeHurricanes", next ? "1" : "0");
    window.dispatchEvent(new CustomEvent("globeHurricanesToggle", { detail: { hurricanesEnabled: next } }));
  }, [hurricanesEnabled]);

  const [satellitesEnabled, setSatellitesEnabled] = useState(() => localStorage.getItem("globeSatellites") !== "0");
  const [wildfiresEnabled, setWildfiresEnabled] = useState(() => localStorage.getItem("globeWildfires") !== "0");
  const [capAlertsEnabled, setCapAlertsEnabled] = useState(() => localStorage.getItem("globeCapAlerts") !== "0");

  const [rotationEnabled, setRotationEnabled] = useState(
    () => localStorage.getItem("globeRotation") !== "0"
  );
  const toggleRotation = useCallback(() => {
    const next = !rotationEnabled;
    setRotationEnabled(next);
    localStorage.setItem("globeRotation", next ? "1" : "0");
    window.dispatchEvent(new CustomEvent("globeRotationToggle", { detail: { rotationEnabled: next } }));
  }, [rotationEnabled]);

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

  // Na Home a barra aparece junto com o globo; o clima entra quando carregar.
  if (waitForGlobe && !globeReady) return null;

  const wmo = data ? WMO[data.code] ?? { icon: "🌡️", label: "" } : null;
  if (!showLayers && !(data && wmo)) return null;

  const flip = (
    value: boolean,
    setValue: (next: boolean) => void,
    storageKey: string,
    eventName: string,
    detailKey: string
  ) => {
    const next = !value;
    setValue(next);
    localStorage.setItem(storageKey, next ? "1" : "0");
    window.dispatchEvent(new CustomEvent(eventName, { detail: { [detailKey]: next } }));
  };

  const layers: GlobeLayer[] = [
    { id: "wind", icon: "💨", label: "Vento", on: windEnabled, toggle: toggleWind },
    { id: "iss", icon: "🧑‍🚀", label: "ISS", on: issEnabled, toggle: toggleIss },
    { id: "hurricanes", icon: "🌀", label: "Furacões", on: hurricanesEnabled, toggle: toggleHurricanes },
    { id: "quakes", icon: "📍", label: "Terremotos", on: quakesEnabled, toggle: toggleQuakes },
    { id: "volcanoes", icon: "🌋", label: "Vulcões", on: volcanoesEnabled, toggle: toggleVolcanoes },
    {
      id: "satellites",
      icon: "🛰️",
      label: "Satélites",
      on: satellitesEnabled,
      toggle: () => flip(satellitesEnabled, setSatellitesEnabled, "globeSatellites", "globeSatellitesToggle", "satellitesEnabled"),
    },
    {
      id: "wildfires",
      icon: "🔥",
      label: "Incêndios",
      on: wildfiresEnabled,
      toggle: () => flip(wildfiresEnabled, setWildfiresEnabled, "globeWildfires", "globeWildfiresToggle", "wildfiresEnabled"),
    },
    {
      id: "capAlerts",
      icon: "⚠️",
      label: "Alertas",
      on: capAlertsEnabled,
      toggle: () => flip(capAlertsEnabled, setCapAlertsEnabled, "globeCapAlerts", "globeCapAlertsToggle", "capAlertsEnabled"),
    },
    { id: "rotation", icon: "🌐", label: "Rotação", on: rotationEnabled, toggle: toggleRotation },
  ];

  const nightButton = (
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
      {nightMode ? "🌞 DIA" : "🌙 NOITE"}
    </Text>
  );

  return (
    <Box
      position="fixed"
      top={0}
      right={0}
      zIndex={1000000}
      bg="rgba(0,0,0,0.82)"
      onMouseEnter={() => {
        if (!data || !wmo) return;
        const city = data.city ? `, ${data.city}` : "";
        falar(`${data.temp} graus${city}, ${wmo.label}`);
      }}
      backdropFilter="blur(10px)"
      borderBottom={`1px solid ${GREEN_DIM}`}
      borderLeft={`1px solid ${GREEN_DIM}`}
      borderBottomLeftRadius="12px"
      px={{ base: 3, md: 4 }}
      py="6px"
      boxShadow={`0 2px 16px rgba(0,0,0,0.6), inset 0 0 0 1px rgba(66,201,32,0.06)`}
      style={{ animation: "weatherFadeIn 0.5s ease" }}
    >
      <style>{`@keyframes weatherFadeIn { from { opacity:0; transform:translateY(-8px); } to { opacity:1; transform:translateY(0); } }`}</style>

      <HStack spacing={3} align="center">
        {data && wmo && (
          <>
            <Text fontSize="md" lineHeight={1} userSelect="none" title={wmo.label} cursor="help">
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
                <Divider orientation="vertical" h="14px" borderColor={GREEN_DIM} display={{ base: "none", md: "block" }} />
                <Text
                  fontSize="xs"
                  color="whiteAlpha.600"
                  fontFamily="heading"
                  letterSpacing="0.03em"
                  display={{ base: "none", md: "block" }}
                >
                  {data.city}
                </Text>
              </>
            )}
          </>
        )}

        {showLayers && isMobile && (
          <>
            {data && wmo && <Divider orientation="vertical" h="14px" borderColor={GREEN_DIM} />}
            <MobileLayersMenu layers={layers} nightMode={nightMode} onToggleNight={toggleNight} />
          </>
        )}

        {showLayers && !isMobile && (
          <>
            {data && wmo && <Divider orientation="vertical" h="14px" borderColor={GREEN_DIM} />}
            {nightButton}
            {layers.map((layer) => (
              <HStack key={layer.id} spacing={3}>
                <Divider orientation="vertical" h="14px" borderColor={GREEN_DIM} />
                <Text
                  as="button"
                  fontSize="xs"
                  fontFamily="monospace"
                  color={GREEN}
                  letterSpacing="0.06em"
                  cursor="pointer"
                  onClick={layer.toggle}
                  title={`${layer.on ? "Desativar" : "Ativar"} ${layer.label.toLowerCase()}`}
                  style={{ background: "none", border: "none", padding: 0 }}
                  _hover={{ opacity: 0.7 }}
                >
                  {layer.icon} {layer.on ? "ON" : "OFF"}
                </Text>
              </HStack>
            ))}
          </>
        )}
      </HStack>
    </Box>
  );
};

interface GlobeLayer {
  id: string;
  icon: string;
  label: string;
  on: boolean;
  toggle: () => void;
}

interface MobileLayersMenuProps {
  layers: GlobeLayer[];
  nightMode: boolean;
  onToggleNight: () => void;
}

const MobileLayersMenu = ({ layers, nightMode, onToggleNight }: MobileLayersMenuProps) => {
  const activeCount = layers.filter((layer) => layer.on).length;

  return (
    <Popover placement="bottom-end" isLazy>
      <PopoverTrigger>
        <Box
          as="button"
          type="button"
          aria-label="Camadas do globo"
          display="flex"
          alignItems="center"
          gap={1}
          minH="32px"
          px={2}
          fontSize="xs"
          fontFamily="monospace"
          color={GREEN}
          border={`1px solid ${GREEN_DIM}`}
          borderRadius="full"
        >
          🗺️ Camadas {activeCount}/{layers.length}
        </Box>
      </PopoverTrigger>
      <PopoverContent
        w="min(92vw, 300px)"
        bg="rgba(0,0,0,0.95)"
        borderColor={GREEN_DIM}
        color="whiteAlpha.900"
        _focusVisible={{ outline: "none" }}
      >
        <PopoverBody p={3}>
          <Box
            as="button"
            type="button"
            onClick={onToggleNight}
            w="100%"
            minH="44px"
            mb={2}
            borderRadius="md"
            border={`1px solid ${GREEN_DIM}`}
            color={GREEN}
            fontSize="sm"
            fontFamily="heading"
          >
            {nightMode ? "🌞 Mudar para modo dia" : "🌙 Mudar para modo noite"}
          </Box>
          <SimpleGrid columns={2} spacing={2}>
            {layers.map((layer) => (
              <Box
                key={layer.id}
                as="button"
                type="button"
                onClick={layer.toggle}
                aria-pressed={layer.on}
                minH="44px"
                px={2}
                display="flex"
                alignItems="center"
                gap={2}
                borderRadius="md"
                border="1px solid"
                borderColor={layer.on ? "rgba(66,201,32,0.5)" : "whiteAlpha.200"}
                bg={layer.on ? "rgba(66,201,32,0.12)" : "transparent"}
                color={layer.on ? GREEN : "whiteAlpha.500"}
                fontSize="sm"
                textAlign="left"
              >
                <span aria-hidden>{layer.icon}</span>
                {layer.label}
              </Box>
            ))}
          </SimpleGrid>
        </PopoverBody>
      </PopoverContent>
    </Popover>
  );
};

export default WeatherBar;
