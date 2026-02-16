/** Geocode a place name using Nominatim (OpenStreetMap). Results cached in sessionStorage. */
const CACHE_KEY = 'utur_geocode_cache';
const CACHE_MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

interface GeocodeResult {
  lat: number;
  lon: number;
  displayName: string;
}

function getCache(): Record<string, { result: GeocodeResult; ts: number }> {
  try {
    const raw = sessionStorage.getItem(CACHE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as Record<string, { result: GeocodeResult; ts: number }>;
    const now = Date.now();
    const filtered: Record<string, { result: GeocodeResult; ts: number }> = {};
    for (const [k, v] of Object.entries(parsed)) {
      if (now - v.ts < CACHE_MAX_AGE_MS) filtered[k] = v;
    }
    return filtered;
  } catch {
    return {};
  }
}

function setCache(key: string, result: GeocodeResult) {
  try {
    const cache = getCache();
    cache[key] = { result, ts: Date.now() };
    sessionStorage.setItem(CACHE_KEY, JSON.stringify(cache));
  } catch {
    // ignore
  }
}

/** Geocode a place, optionally with country for disambiguation (e.g. "Paris", "France"). */
export async function geocode(place: string, country?: string): Promise<GeocodeResult | null> {
  const trimmed = place?.trim();
  if (!trimmed) return null;

  const searchQuery = country?.trim()
    ? `${trimmed}, ${country.trim()}`
    : trimmed;
  const cacheKey = searchQuery;

  const cache = getCache();
  const cached = cache[cacheKey];
  if (cached) return cached.result;

  try {
    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}&limit=1`;
    const res = await fetch(url, {
      headers: { 'Accept-Language': 'no,en' },
    });
    if (!res.ok) return null;
    const data = (await res.json()) as Array<{ lat: string; lon: string; display_name: string }>;
    if (!data?.length) return null;
    const item = data[0];
    const result: GeocodeResult = {
      lat: parseFloat(item.lat),
      lon: parseFloat(item.lon),
      displayName: item.display_name,
    };
    setCache(cacheKey, result);
    return result;
  } catch {
    return null;
  }
}
