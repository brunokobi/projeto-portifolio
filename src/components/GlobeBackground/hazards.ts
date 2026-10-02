// Perigos/Eventos — Qualidade do Ar, Incêndios, Raios

export interface AirQuality {
  id: string;
  name: string;
  lat: number;
  lon: number;
  aqi: number; // 0-500 (0-50 good, 51-100 moderate, etc)
  pm25: number;
}

export interface Wildfire {
  id: string;
  name: string;
  lat: number;
  lon: number;
  confidence: number; // 0-100
  date: string;
}

export interface Lightning {
  id: string;
  lat: number;
  lon: number;
  intensity: number; // relativo
  timestamp: number;
}

// Simulação de qualidade do ar em cidades que NÃO estão em TOP_CITIES
// (evita duplicatas — AQI aparece integrado no hover das cidades principais)
export const SAMPLE_AIR_QUALITY: AirQuality[] = [
  { id: "lahore-aqi", name: "Lahore", lat: 31.5497, lon: 74.3436, aqi: 312, pm25: 280 },
  { id: "bangkok-aqi", name: "Bangkok", lat: 13.7563, lon: 100.5018, aqi: 128, pm25: 95 },
  { id: "jakarta-aqi", name: "Jakarta", lat: -6.2088, lon: 106.8456, aqi: 156, pm25: 130 },
  { id: "ho-chi-minh-aqi", name: "Ho Chi Minh City", lat: 10.8231, lon: 106.6297, aqi: 102, pm25: 78 },
];

// Simulação de incêndios (baseado em padrões históricos)
export const SAMPLE_WILDFIRES: Wildfire[] = [
  { id: "fire-1", name: "Australia Bushfire", lat: -25.2744, lon: 133.7751, confidence: 95, date: "2026-10-01" },
  { id: "fire-2", name: "California Wildfire", lat: 38.2975, lon: -120.2869, confidence: 88, date: "2026-10-01" },
  { id: "fire-3", name: "Amazon Fire", lat: -3.4653, lon: -62.2159, confidence: 92, date: "2026-09-30" },
  { id: "fire-4", name: "Indonesia Fire", lat: -2.5489, lon: 113.9213, confidence: 85, date: "2026-10-01" },
];

// Simulação de raios (padrões de atividade)
export const SAMPLE_LIGHTNING: Lightning[] = Array.from({ length: 15 }, (_, i) => ({
  id: `lightning-${i}`,
  lat: Math.random() * 180 - 90,
  lon: Math.random() * 360 - 180,
  intensity: Math.random() * 100,
  timestamp: Date.now() - Math.random() * 60000, // últimos 60s
}));

export async function loadAirQuality(): Promise<AirQuality[]> {
  return SAMPLE_AIR_QUALITY;
}

export async function loadWildfires(): Promise<Wildfire[]> {
  return SAMPLE_WILDFIRES;
}

export async function loadLightning(): Promise<Lightning[]> {
  return SAMPLE_LIGHTNING;
}

export function aqiColor(aqi: number): string {
  if (aqi <= 50) return "#00FF00"; // Good - Green
  if (aqi <= 100) return "#FFFF00"; // Moderate - Yellow
  if (aqi <= 150) return "#FF9900"; // Unhealthy for Sensitive - Orange
  if (aqi <= 200) return "#FF3333"; // Unhealthy - Red
  if (aqi <= 300) return "#990099"; // Very Unhealthy - Purple
  return "#663300"; // Hazardous - Brown
}

export function aqiLabel(aqi: number): string {
  if (aqi <= 50) return "Good";
  if (aqi <= 100) return "Moderate";
  if (aqi <= 150) return "USG";
  if (aqi <= 200) return "Unhealthy";
  if (aqi <= 300) return "Very Bad";
  return "Hazardous";
}

export function wildfireColor(confidence: number): string {
  if (confidence > 90) return "#FF0000"; // Bright red - high confidence
  if (confidence > 75) return "#FF6600"; // Orange - medium
  return "#FFCC00"; // Yellow - low
}

export function lightningColor(): string {
  return "#FFFF00"; // Yellow - bright flash
}
