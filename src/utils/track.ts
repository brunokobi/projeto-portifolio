import { getGeoIP } from "./geoip";

interface TrackOptions {
  event: string;
  page?: string;
  extra?: string;
}

let geoCache: { country_code?: string; city?: string } | null = null;

const getGeo = async () => {
  if (geoCache) return geoCache;
  try {
    const data = await getGeoIP();
    geoCache = { country_code: data.country_code, city: data.city };
  } catch {
    geoCache = {};
  }
  return geoCache;
};

const send = async (options: TrackOptions & { country_code?: string; city?: string }) => {
  try {
    await fetch("/.netlify/functions/track", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(options),
    });
  } catch {
    // silencioso — tracking nunca deve quebrar o app
  }
};

export const track = async (options: TrackOptions): Promise<void> => {
  const key = `tracked_${options.event}_${options.page ?? ""}`;
  if (sessionStorage.getItem(key)) return;
  sessionStorage.setItem(key, "1");

  const geo = await getGeo();
  await send({ ...options, ...geo });
};

export const trackClick = async (options: TrackOptions): Promise<void> => {
  const geo = await getGeo();
  await send({ ...options, ...geo });
};
