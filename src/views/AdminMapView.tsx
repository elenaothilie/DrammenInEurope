import { useEffect, useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { useStore, selectIsAdmin } from '../store';
import type { TripPlace } from '../types';
import { geocode } from '../utils/geocode';
import {
  ArrowLeft,
  MapPin,
  Loader2,
  Plane,
  Plus,
  Edit2,
  Save,
  Trash2,
} from 'lucide-react';
import 'leaflet/dist/leaflet.css';

// Fix default marker icons in react-leaflet (Vite/bundler)
const defaultIcon = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});
L.Marker.prototype.options.icon = defaultIcon;

function MapBounds({ coords }: { coords: [number, number][] }) {
  const map = useMap();
  useEffect(() => {
    if (coords.length === 0) return;
    if (coords.length === 1) {
      map.setView(coords[0], 12);
      return;
    }
    const bounds = L.latLngBounds(coords);
    map.fitBounds(bounds, { padding: [40, 40], maxZoom: 12 });
  }, [map, coords]);
  return null;
}

export function AdminMapView() {
  const isAdmin = useStore(selectIsAdmin);
  const { tripPlaces, addTripPlace, updateTripPlace, removeTripPlace } = useStore();

  const [geocoded, setGeocoded] = useState<Map<string, { lat: number; lon: number }>>(new Map());
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newPlaceName, setNewPlaceName] = useState('');
  const [newPlaceCountry, setNewPlaceCountry] = useState('');

  const getSearchQuery = (p: TripPlace) =>
    p.country?.trim() ? `${p.name}, ${p.country.trim()}` : p.name;

  const placesWithCoords = useMemo(() => {
    return tripPlaces
      .map((p) => {
        const q = getSearchQuery(p);
        const lat = p.lat ?? geocoded.get(q)?.lat;
        const lon = p.lon ?? geocoded.get(q)?.lon;
        return { ...p, lat, lon } as TripPlace & { lat?: number; lon?: number };
      })
      .filter((p) => p.lat != null && p.lon != null);
  }, [tripPlaces, geocoded]);

  const coords = useMemo(
    () => placesWithCoords.map((p) => [p.lat!, p.lon!] as [number, number]),
    [placesWithCoords]
  );

  const needsGeocoding = tripPlaces.filter(
    (p) => p.lat == null && p.lon == null && !geocoded.has(getSearchQuery(p))
  );

  useEffect(() => {
    if (needsGeocoding.length === 0) {
      setLoading(false);
      return;
    }
    let cancelled = false;
    (async () => {
      setLoading(true);
      const results = new Map<string, { lat: number; lon: number }>();
      for (let i = 0; i < needsGeocoding.length; i++) {
        if (cancelled) return;
        const p = needsGeocoding[i];
        const q = getSearchQuery(p);
        const res = await geocode(p.name, p.country);
        if (res) results.set(q, { lat: res.lat, lon: res.lon });
        if (i < needsGeocoding.length - 1) await new Promise((r) => setTimeout(r, 1100));
      }
      if (!cancelled) {
        setGeocoded((prev) => {
          const next = new Map(prev);
          results.forEach((v, k) => next.set(k, v));
          return next;
        });
        // Store lat/lon back to DB for places we geocoded
        for (const p of needsGeocoding) {
          const c = results.get(getSearchQuery(p));
          if (c) useStore.getState().updateTripPlace(p.id, { lat: c.lat, lon: c.lon });
        }
      }
      setLoading(false);
    })();
    return () => { cancelled = true; };
  }, [needsGeocoding.map((p) => `${p.id}:${getSearchQuery(p)}`).join(',')]);

  const handleAddPlace = async () => {
    const name = newPlaceName.trim();
    if (!name) return;
    await addTripPlace(name, newPlaceCountry.trim() || undefined);
    setNewPlaceName('');
    setNewPlaceCountry('');
  };

  if (!isAdmin) return null;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:p-6 md:p-12 py-8 md:py-12">
      <div className="mb-6">
        <Link
          to="/admin"
          className="text-royal/60 hover:text-royal flex items-center gap-2 font-mono text-xs uppercase"
        >
          <ArrowLeft size={16} /> Tilbake til dashboard
        </Link>
      </div>

      <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
        {/* Sidebar - editable places list */}
        <div className="lg:w-80 xl:w-96 shrink-0 space-y-4">
          <h2 className="font-display font-bold text-2xl text-royal uppercase">
            Steder vi besøker
          </h2>
          <p className="text-royal/60 text-sm text-readable">
            Legg til, rediger eller fjern steder. Kartet oppdateres automatisk.
          </p>

          {/* Add new place */}
          <div className="bg-white border border-royal/10 p-4 space-y-3">
            <label className="text-[10px] font-mono uppercase text-royal/40 text-readable-micro block">
              Nytt sted
            </label>
            <div>
              <input
                type="text"
                value={newPlaceName}
                onChange={(e) => setNewPlaceName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAddPlace()}
                placeholder="Stedsnavn (f.eks. Paris, Oslo Lufthavn)"
                className="w-full border-b border-royal/20 focus:border-royal bg-transparent font-display text-sm py-1.5"
              />
            </div>
            <div>
              <input
                type="text"
                value={newPlaceCountry}
                onChange={(e) => setNewPlaceCountry(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAddPlace()}
                placeholder="Land/region (f.eks. Norge, Frankrike) – valgfritt"
                className="w-full border-b border-royal/20 focus:border-royal bg-transparent font-display text-sm py-1.5"
              />
            </div>
            <button
              onClick={handleAddPlace}
              disabled={!newPlaceName.trim()}
              className="w-full bg-royal text-white px-3 py-2 font-mono text-xs uppercase font-bold hover:bg-royal-dark disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              <Plus size={14} /> Legg til
            </button>
          </div>

          {loading && needsGeocoding.length > 0 && (
            <div className="flex items-center gap-2 text-royal/60 text-sm">
              <Loader2 size={18} className="animate-spin" />
              Finner koordinater...
            </div>
          )}

          {/* Place list */}
          <div className="space-y-2">
            {tripPlaces.map((place) => {
              const isEditing = editingId === place.id;
              const hasCoords = place.lat != null && place.lon != null;
              const isAirport = place.isAirport || /flyplass|lufthavn|airport|gardermoen|torp/i.test(place.name);

              if (!isEditing) {
                return (
                  <div
                    key={place.id}
                    className="bg-white border border-royal/10 p-4 group flex items-center justify-between gap-2"
                  >
                    <div className="flex items-center gap-2 min-w-0 flex-1">
                      {isAirport && <Plane size={14} className="text-royal/50 shrink-0" />}
                      {!isAirport && <MapPin size={14} className="text-royal/50 shrink-0" />}
                      <div className="min-w-0">
                        <span className="font-display font-bold text-royal truncate block">{place.name}</span>
                        {place.country && (
                          <span className="text-royal/50 text-xs">{place.country}</span>
                        )}
                      </div>
                      {!hasCoords && (
                        <span className="text-royal/40 text-xs shrink-0">(geokoder...)</span>
                      )}
                    </div>
                    <div className="flex gap-1 shrink-0">
                      <button
                        onClick={() => setEditingId(place.id)}
                        className="p-1.5 text-royal/40 hover:text-royal hover:bg-royal/5 rounded"
                        title="Rediger"
                      >
                        <Edit2 size={14} />
                      </button>
                      <button
                        onClick={() => {
                          if (confirm('Fjerne dette stedet?')) removeTripPlace(place.id);
                        }}
                        className="p-1.5 text-royal/40 hover:text-red-500 hover:bg-red-50 rounded"
                        title="Slett"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                );
              }

              return (
                <div
                  key={place.id}
                  className="bg-white border-2 border-royal p-4 space-y-3 relative"
                >
                  <div className="absolute top-2 right-2">
                    <button
                      onClick={() => setEditingId(null)}
                      className="p-1.5 text-green-600 hover:bg-green-50 rounded"
                    >
                      <Save size={16} />
                    </button>
                  </div>
                  <div>
                    <label className="text-[10px] font-mono uppercase text-royal/40 block mb-1">
                      Stedsnavn
                    </label>
                    <input
                      defaultValue={place.name}
                      onBlur={(e) => updateTripPlace(place.id, { name: e.target.value })}
                      className="w-full border-b border-royal/20 focus:border-royal bg-transparent font-display font-bold text-royal py-1"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-mono uppercase text-royal/40 block mb-1">
                      Land / region
                    </label>
                    <input
                      defaultValue={place.country ?? ''}
                      onBlur={(e) =>
                        updateTripPlace(place.id, { country: e.target.value.trim() || undefined })
                      }
                      placeholder="f.eks. Norge, Frankrike"
                      className="w-full border-b border-royal/20 focus:border-royal bg-transparent text-sm py-1"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id={`airport-${place.id}`}
                      defaultChecked={place.isAirport}
                      onChange={(e) => updateTripPlace(place.id, { isAirport: e.target.checked })}
                      className="accent-royal"
                    />
                    <label
                      htmlFor={`airport-${place.id}`}
                      className="text-xs font-mono uppercase text-royal/80"
                    >
                      Flyplass
                    </label>
                  </div>
                  <div>
                    <label className="text-[10px] font-mono uppercase text-royal/40 block mb-1">
                      Notater
                    </label>
                    <input
                      defaultValue={place.notes ?? ''}
                      onBlur={(e) =>
                        updateTripPlace(place.id, { notes: e.target.value.trim() || undefined })
                      }
                      placeholder="Valgfritt"
                      className="w-full border-b border-royal/20 focus:border-royal bg-transparent text-sm py-1"
                    />
                  </div>
                </div>
              );
            })}
          </div>

          {!loading && tripPlaces.length === 0 && (
            <p className="text-royal/60 text-sm">
              Ingen steder ennå. Legg til steder ovenfor.
            </p>
          )}
        </div>

        {/* Map */}
        <div className="flex-1 min-h-[420px] rounded-sm overflow-hidden border border-royal/10 bg-white">
          {placesWithCoords.length > 0 ? (
            <MapContainer
              center={[59.9139, 10.7522]}
              zoom={6}
              className="h-[420px] w-full map-royal-style"
              scrollWheelZoom
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/">CARTO</a>'
                url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
              />
              <MapBounds coords={coords} />
              {placesWithCoords.map((place) => (
                <Marker key={place.id} position={[place.lat!, place.lon!]}>
                  <Popup>
                    <div className="map-popup-inner text-sm min-w-[200px]">
                      {place.isAirport && (
                        <span className="inline-flex items-center gap-1 text-royal font-bold mb-1">
                          <Plane size={14} /> Flyplass
                        </span>
                      )}
                      <p className="font-display font-bold text-royal uppercase">{place.name}</p>
                      {place.country && (
                        <p className="text-royal/60 text-xs">{place.country}</p>
                      )}
                      {place.notes && (
                        <p className="text-royal/70 text-xs mt-1">{place.notes}</p>
                      )}
                    </div>
                  </Popup>
                </Marker>
              ))}
            </MapContainer>
          ) : (
            <div className="h-[420px] w-full flex items-center justify-center bg-royal/5 text-royal/50">
              {loading ? (
                <div className="flex flex-col items-center gap-2">
                  <Loader2 size={32} className="animate-spin" />
                  <span className="text-sm font-mono uppercase">Laster kart...</span>
                </div>
              ) : (
                <div className="text-center p-8">
                  <MapPin size={48} className="mx-auto mb-3 opacity-50" />
                  <p className="font-display font-bold text-royal/70 uppercase text-sm">
                    Ingen steder å vise
                  </p>
                  <p className="text-xs mt-2 text-royal/50">
                    Legg til steder i listen til venstre
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
