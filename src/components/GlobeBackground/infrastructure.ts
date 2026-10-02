// Infraestrutura global — Tech hubs, Internet coverage, Time zones

export interface TechHub {
  id: string;
  name: string;
  lat: number;
  lon: number;
  sector: "ai" | "biotech" | "fintech" | "gaming" | "web3";
  companies: number;
}

export interface InternetCoverage {
  id: string;
  name: string;
  lat: number;
  lon: number;
  type: "5g" | "submarine-cable" | "satellite" | "wifi6";
  coverage: number; // 0-100%
}

export interface TimeZoneInfo {
  id: string;
  name: string;
  offset: number; // horas de UTC
  cities: string[];
}

export const TECH_HUBS: TechHub[] = [
  { id: "sv", name: "Silicon Valley", lat: 37.3382, lon: -121.8863, sector: "ai", companies: 15000 },
  { id: "sf", name: "San Francisco", lat: 37.7749, lon: -122.4194, sector: "web3", companies: 5000 },
  { id: "nyc", name: "New York", lat: 40.7128, lon: -74.0060, sector: "fintech", companies: 8000 },
  { id: "seattle", name: "Seattle", lat: 47.6062, lon: -122.3321, sector: "ai", companies: 3000 },
  { id: "austin", name: "Austin", lat: 30.2672, lon: -97.7431, sector: "web3", companies: 2500 },
  { id: "shenzhen", name: "Shenzhen", lat: 22.5431, lon: 114.0579, sector: "ai", companies: 12000 },
  { id: "beijing", name: "Beijing", lat: 39.9042, lon: 116.4074, sector: "ai", companies: 10000 },
  { id: "hangzhou", name: "Hangzhou", lat: 30.2741, lon: 120.1551, sector: "fintech", companies: 4000 },
  { id: "seoul", name: "Seoul", lat: 37.5665, lon: 126.9780, sector: "gaming", companies: 6000 },
  { id: "tokyo", name: "Tokyo", lat: 35.6762, lon: 139.6503, sector: "gaming", companies: 8000 },
  { id: "london", name: "London", lat: 51.5074, lon: -0.1278, sector: "fintech", companies: 6000 },
  { id: "berlin", name: "Berlin", lat: 52.5200, lon: 13.4050, sector: "biotech", companies: 2500 },
  { id: "toronto", name: "Toronto", lat: 43.6532, lon: -79.3832, sector: "ai", companies: 1500 },
  { id: "singapore", name: "Singapore", lat: 1.3521, lon: 103.8198, sector: "fintech", companies: 3500 },
];

export const INTERNET_COVERAGE: InternetCoverage[] = [
  { id: "5g-us", name: "5G USA", lat: 37.7749, lon: -122.4194, type: "5g", coverage: 85 },
  { id: "5g-asia", name: "5G Asia", lat: 22.5431, lon: 114.0579, type: "5g", coverage: 92 },
  { id: "5g-eu", name: "5G Europe", lat: 48.8566, lon: 2.3522, type: "5g", coverage: 78 },
  { id: "cable-transatlantic", name: "TAT-14 Transatlantic", lat: 40.0, lon: -40.0, type: "submarine-cable", coverage: 99 },
  { id: "cable-pacific", name: "Pacific Light Cable", lat: 35.0, lon: 140.0, type: "submarine-cable", coverage: 98 },
  { id: "starlink-global", name: "Starlink Coverage", lat: 0, lon: 0, type: "satellite", coverage: 88 },
  { id: "wifi6-cities", name: "WiFi 6 Cities", lat: 51.5074, lon: -0.1278, type: "wifi6", coverage: 65 },
];

export const TIME_ZONES: TimeZoneInfo[] = [
  { id: "utc-12", name: "UTC-12", offset: -12, cities: ["Baker Island", "Howland Island"] },
  { id: "utc-11", name: "UTC-11", offset: -11, cities: ["Samoa", "American Samoa"] },
  { id: "utc-10", name: "UTC-10", offset: -10, cities: ["Hawaii", "Aleutian"] },
  { id: "utc-9", name: "UTC-9", offset: -9, cities: ["Alaska", "Marquesas"] },
  { id: "utc-8", name: "UTC-8", offset: -8, cities: ["Los Angeles", "Vancouver", "Baja California"] },
  { id: "utc-7", name: "UTC-7", offset: -7, cities: ["Denver", "Phoenix", "Mexico City"] },
  { id: "utc-6", name: "UTC-6", offset: -6, cities: ["Chicago", "Dallas", "Guatemala"] },
  { id: "utc-5", name: "UTC-5", offset: -5, cities: ["New York", "Miami", "Lima", "Toronto"] },
  { id: "utc-4", name: "UTC-4", offset: -4, cities: ["São Paulo", "La Paz", "Caracas"] },
  { id: "utc-3", name: "UTC-3", offset: -3, cities: ["Buenos Aires", "Brasília", "Cayenne"] },
  { id: "utc-2", name: "UTC-2", offset: -2, cities: ["Mid-Atlantic", "Greenland"] },
  { id: "utc-1", name: "UTC-1", offset: -1, cities: ["Azores", "Cape Verde"] },
  { id: "utc0", name: "UTC+0", offset: 0, cities: ["London", "Dublin", "Lisbon", "Casablanca"] },
  { id: "utc1", name: "UTC+1", offset: 1, cities: ["Paris", "Berlin", "Madrid", "Rome"] },
  { id: "utc2", name: "UTC+2", offset: 2, cities: ["Cairo", "Istanbul", "Johannesburg"] },
  { id: "utc3", name: "UTC+3", offset: 3, cities: ["Moscow", "Dubai", "Nairobi"] },
  { id: "utc4", name: "UTC+4", offset: 4, cities: ["Baku", "Samara", "Mauritius"] },
  { id: "utc5", name: "UTC+5", offset: 5, cities: ["Pakistan", "Uzbekistan"] },
  { id: "utc6", name: "UTC+6", offset: 6, cities: ["Kazakhstan", "Bangladesh"] },
  { id: "utc7", name: "UTC+7", offset: 7, cities: ["Bangkok", "Ho Chi Minh", "Jakarta"] },
  { id: "utc8", name: "UTC+8", offset: 8, cities: ["Beijing", "Singapore", "Hong Kong", "Manila"] },
  { id: "utc9", name: "UTC+9", offset: 9, cities: ["Tokyo", "Seoul", "Bangkok"] },
  { id: "utc10", name: "UTC+10", offset: 10, cities: ["Sydney", "Brisbane", "Melbourne"] },
  { id: "utc11", name: "UTC+11", offset: 11, cities: ["Solomon Islands", "Vanuatu"] },
  { id: "utc12", name: "UTC+12", offset: 12, cities: ["Fiji", "New Zealand", "Auckland"] },
];

export function techHubColor(sector: TechHub["sector"]): string {
  switch (sector) {
    case "ai":
      return "#FF00FF"; // Magenta
    case "biotech":
      return "#00FF00"; // Green
    case "fintech":
      return "#00FFFF"; // Cyan
    case "gaming":
      return "#FF0099"; // Pink
    case "web3":
      return "#FFD700"; // Gold
  }
}

export function internetCoverageColor(type: InternetCoverage["type"]): string {
  switch (type) {
    case "5g":
      return "#FF0000"; // Red
    case "submarine-cable":
      return "#0099FF"; // Blue
    case "satellite":
      return "#FF9900"; // Orange
    case "wifi6":
      return "#00FF00"; // Green
  }
}

export function getTimeZoneColor(offset: number): string {
  const normalized = ((offset + 12) % 24) / 24;
  const hue = Math.round(normalized * 360);
  return `hsl(${hue}, 100%, 50%)`;
}

export async function loadTechHubs(): Promise<TechHub[]> {
  return TECH_HUBS;
}

export async function loadInternetCoverage(): Promise<InternetCoverage[]> {
  return INTERNET_COVERAGE;
}

export function getTimeZones(): TimeZoneInfo[] {
  return TIME_ZONES;
}
