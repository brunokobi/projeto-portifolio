import type { GeoIPData } from "../types";

let _promise: Promise<GeoIPData> | null = null;

export const getGeoIP = (): Promise<GeoIPData> => {
  if (!_promise) {
    _promise = fetch("https://ipapi.co/json/")
      .then((r) => r.json())
      .catch(() => ({}));
  }
  return _promise;
};
