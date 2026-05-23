import { useState, useRef, useEffect } from "react";
import { MapPin, Search, X, CheckCircle2, Loader2 } from "lucide-react";
import { useUserLocation, UserLocation } from "@/context/LocationContext";
import { useToast } from "@/hooks/use-toast";

interface GeoResult {
  cityName: string;
  country: string;
  lat: number;
  lon: number;
  display: string;
}

interface Props {
  onSet?: () => void;
  compact?: boolean;
}

export default function LocationPicker({ onSet, compact = false }: Props) {
  const { location, setLocation, clearLocation, isSet } = useUserLocation();
  const { toast } = useToast();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<GeoResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(!isSet);
  const [error, setError] = useState("");
  const debounce = useRef<ReturnType<typeof setTimeout> | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 100);
  }, [open]);

  const search = async (q: string) => {
    if (q.length < 2) { setResults([]); return; }
    setLoading(true); setError("");
    try {
      const res = await fetch(`/api/geocode?q=${encodeURIComponent(q)}`);
      const data = await res.json();
      setResults(data.results || []);
      if (!data.results?.length) setError("No locations found. Try a different name.");
    } catch {
      setError("Search failed. Please try again.");
    } finally { setLoading(false); }
  };

  const handleChange = (v: string) => {
    setQuery(v);
    if (debounce.current) clearTimeout(debounce.current);
    debounce.current = setTimeout(() => search(v), 400);
  };

  const pick = (r: GeoResult) => {
    const loc: UserLocation = { lat: r.lat, lon: r.lon, cityName: r.cityName, country: r.country };
    setLocation(loc);
    setQuery(""); setResults([]); setOpen(false);
    toast({ title: "Location saved", description: `Weather will now show data for ${r.display}` });
    onSet?.();
  };

  // ── Compact mode: just show current location + change button ──────
  if (compact && isSet && !open) {
    return (
      <div className="flex items-center gap-2">
        <span className="flex items-center gap-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-300 px-2 py-1 rounded-full cursor-pointer hover:opacity-80 transition-opacity"
          style={{ background: "rgba(16,185,129,0.12)", border: "1px solid rgba(16,185,129,0.25)" }}
          onClick={() => setOpen(true)}>
          <MapPin className="h-3 w-3" />
          {location!.cityName}
        </span>
      </div>
    );
  }

  // ── Full picker UI ─────────────────────────────────────────────────
  return (
    <div className="rounded-[1.4rem] overflow-hidden"
      style={{ background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.14)" }}>
      {/* Header */}
      <div className="flex items-center justify-between px-4 pt-4 pb-2">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-xl flex items-center justify-center"
            style={{ background: "rgba(59,130,246,0.2)", border: "1px solid rgba(59,130,246,0.35)" }}>
            <MapPin className="h-4 w-4 text-blue-600 dark:text-blue-300" />
          </div>
          <div>
            <p className="text-sm font-bold card-heading">Set Your Location</p>
            <p className="text-[11px] card-muted">For accurate weather & irrigation advice</p>
          </div>
        </div>
        {isSet && (
          <button onClick={() => setOpen(false)}
            className="h-7 w-7 rounded-xl glass-tile flex items-center justify-center hover:scale-110 transition-transform">
            <X className="h-3.5 w-3.5 card-muted" />
          </button>
        )}
      </div>

      {/* Search input */}
      <div className="px-4 pb-3">
        <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl"
          style={{ background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.18)" }}>
          {loading
            ? <Loader2 className="h-4 w-4 card-muted animate-spin flex-shrink-0" />
            : <Search className="h-4 w-4 card-muted flex-shrink-0" />}
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={e => handleChange(e.target.value)}
            placeholder="Search city or village…"
            className="flex-1 bg-transparent text-sm card-heading outline-none placeholder:card-muted"
          />
          {query && (
            <button onClick={() => { setQuery(""); setResults([]); }} className="hover:opacity-70">
              <X className="h-3.5 w-3.5 card-muted" />
            </button>
          )}
        </div>

        {/* Results */}
        {results.length > 0 && (
          <div className="mt-2 space-y-1 max-h-48 overflow-y-auto">
            {results.map((r, i) => (
              <button key={i} onClick={() => pick(r)}
                className="w-full text-left px-3 py-2.5 rounded-xl flex items-center gap-3 transition-all hover:scale-[1.01]"
                style={{ background: "rgba(59,130,246,0.07)", border: "1px solid rgba(59,130,246,0.15)" }}>
                <MapPin className="h-3.5 w-3.5 text-blue-500 dark:text-blue-300 flex-shrink-0" />
                <div className="min-w-0">
                  <p className="text-sm font-semibold card-heading truncate">{r.display}</p>
                  <p className="text-[10px] card-muted">{r.lat.toFixed(2)}°N, {r.lon.toFixed(2)}°E</p>
                </div>
              </button>
            ))}
          </div>
        )}

        {error && !loading && (
          <p className="text-[11px] text-red-500 dark:text-red-400 mt-2 px-1">{error}</p>
        )}

        {/* Current saved location */}
        {isSet && location && !results.length && (
          <div className="mt-2 px-3 py-2.5 rounded-xl flex items-center justify-between"
            style={{ background: "rgba(16,185,129,0.08)", border: "1px solid rgba(16,185,129,0.2)" }}>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-500 dark:text-emerald-400" />
              <div>
                <p className="text-[11px] font-bold card-heading">{location.cityName}</p>
                {location.country && <p className="text-[10px] card-muted">{location.country}</p>}
              </div>
            </div>
            <button onClick={() => { clearLocation(); setOpen(true); }}
              className="text-[10px] font-semibold text-red-500 dark:text-red-400 hover:opacity-70 transition-opacity">
              Remove
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
