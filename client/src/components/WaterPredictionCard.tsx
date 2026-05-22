import { Cloud, Sun, CloudRain, CloudSun, ArrowRight, Umbrella, MapPin, RefreshCw, Loader2 } from "lucide-react";
import { Link } from "wouter";
import { useLanguage } from "@/context/LanguageContext";
import { useQuery } from "@tanstack/react-query";
import { useState, useEffect } from "react";

interface ForecastDay {
  day: string;
  temperature: string;
  weather: "sunny" | "cloudy" | "rainy" | "partly-cloudy";
  rainChance?: number;
}

interface WeatherData {
  message: string;
  advice: string;
  forecast: ForecastDay[];
  location?: { lat: number; lon: number };
}

interface WaterPredictionCardProps {
  prediction?: string;
  advice?: string;
  forecast?: ForecastDay[];
  farmId?: number;
}

const WaterPredictionCard = ({ farmId = 1 }: WaterPredictionCardProps) => {
  const { t } = useLanguage();
  const [coords, setCoords] = useState<{ lat: number; lon: number } | null>(null);
  const [locationError, setLocationError] = useState(false);
  const [locationAsked, setLocationAsked] = useState(false);

  useEffect(() => {
    if (!locationAsked && navigator.geolocation) {
      setLocationAsked(true);
      navigator.geolocation.getCurrentPosition(
        (pos) => setCoords({ lat: pos.coords.latitude, lon: pos.coords.longitude }),
        () => setLocationError(true),
        { timeout: 8000 }
      );
    } else if (!navigator.geolocation) {
      setLocationError(true);
    }
  }, []);

  const { data: weather, isLoading, isError, refetch } = useQuery<WeatherData>({
    queryKey: ["/api/weather", coords?.lat, coords?.lon],
    queryFn: async () => {
      const url = coords ? `/api/weather?lat=${coords.lat}&lon=${coords.lon}` : `/api/weather`;
      const res = await fetch(url);
      if (!res.ok) throw new Error("Weather fetch failed");
      return res.json();
    },
    enabled: !!coords || locationError,
    staleTime: 1000 * 60 * 15,
    retry: 2,
  });

  const getWeatherIcon = (type: string) => {
    switch (type) {
      case "sunny": return <Sun className="h-6 w-6 text-amber-300" />;
      case "cloudy": return <Cloud className="h-6 w-6 text-white/50" />;
      case "rainy": return <CloudRain className="h-6 w-6 text-blue-300" />;
      case "partly-cloudy": return <CloudSun className="h-6 w-6 text-cyan-300" />;
      default: return <Sun className="h-6 w-6 text-amber-300" />;
    }
  };

  const getRainStyle = (chance?: number) => {
    if (!chance) return "text-white/30";
    if (chance >= 70) return "text-blue-300";
    if (chance >= 30) return "text-cyan-300";
    return "text-white/40";
  };

  return (
    <div className="mb-2">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-bold text-white/90 flex items-center gap-2">
          <div className="h-7 w-7 rounded-xl flex items-center justify-center"
            style={{ background: 'rgba(59,130,246,0.25)', border: '1px solid rgba(59,130,246,0.4)' }}>
            <Cloud className="h-4 w-4 text-blue-300" />
          </div>
          {t.weatherPrediction}
        </h3>
        <div className="flex items-center gap-2">
          {coords && (
            <span className="flex items-center gap-1 text-[10px] text-emerald-300 px-2 py-0.5 rounded-full font-medium"
              style={{ background: 'rgba(16,185,129,0.15)', border: '1px solid rgba(16,185,129,0.3)' }}>
              <MapPin className="h-2.5 w-2.5" /> Live location
            </span>
          )}
          {locationError && !coords && (
            <span className="flex items-center gap-1 text-[10px] text-white/50 px-2 py-0.5 rounded-full font-medium"
              style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)' }}>
              <MapPin className="h-2.5 w-2.5" /> Default location
            </span>
          )}
          <button onClick={() => refetch()}
            className="h-6 w-6 rounded-xl flex items-center justify-center transition-all hover:scale-110"
            style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.15)' }}>
            <RefreshCw className="h-3 w-3 text-white/60" />
          </button>
        </div>
      </div>

      <div className="rounded-[1.5rem] p-5"
        style={{
          background: 'rgba(255,255,255,0.07)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          border: '1px solid rgba(255,255,255,0.15)',
          boxShadow: '0 8px 32px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.1)'
        }}
      >
        {/* Loading */}
        {(isLoading || (!coords && !locationError)) && (
          <div className="space-y-3">
            <div className="flex items-center gap-3 p-3 rounded-2xl" style={{ background: 'rgba(255,255,255,0.05)' }}>
              <Loader2 className="h-5 w-5 text-blue-300 animate-spin flex-shrink-0" />
              <div>
                <p className="text-sm font-semibold text-white/80">Fetching real weather...</p>
                <p className="text-xs text-white/40 mt-0.5">{!locationError && !coords ? "Waiting for your location" : "Loading forecast"}</p>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {[0, 1, 2].map(i => (
                <div key={i} className="h-24 rounded-2xl animate-pulse" style={{ background: 'rgba(255,255,255,0.05)' }}></div>
              ))}
            </div>
          </div>
        )}

        {/* Error */}
        {isError && (
          <div className="p-3 rounded-2xl text-center" style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)' }}>
            <p className="text-sm font-semibold text-red-300">Could not load weather</p>
            <button onClick={() => refetch()} className="text-xs text-red-400 mt-1 underline">Try again</button>
          </div>
        )}

        {/* Data */}
        {!isLoading && weather && (
          <>
            <div className="flex items-start gap-3 p-3 rounded-2xl mb-4"
              style={{ background: 'rgba(59,130,246,0.12)', border: '1px solid rgba(59,130,246,0.25)' }}>
              <div className="h-8 w-8 flex-shrink-0 rounded-xl bg-blue-500/80 flex items-center justify-center shadow-lg shadow-blue-500/30">
                <Umbrella className="h-4 w-4 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-white leading-tight">{weather.message}</p>
                <p className="text-xs text-white/50 mt-0.5 leading-relaxed">{weather.advice}</p>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2">
              {weather.forecast.map((day, index) => (
                <div key={index} className="rounded-2xl p-3 text-center transition-all duration-200 hover:scale-105"
                  style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}>
                  <p className="text-[10px] font-semibold text-white/40 uppercase tracking-wider mb-2">{day.day}</p>
                  <div className="flex justify-center mb-2">{getWeatherIcon(day.weather)}</div>
                  <p className="text-sm font-bold text-white mb-1">{day.temperature}</p>
                  {day.rainChance !== undefined && (
                    <div className={`flex items-center justify-center gap-0.5 text-[10px] font-semibold ${getRainStyle(day.rainChance)}`}>
                      <CloudRain className="h-2.5 w-2.5" />{day.rainChance}%
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div className="flex items-center justify-between mt-4 pt-3" style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }}>
              <p className="text-[10px] text-white/30 flex items-center gap-1">
                Powered by <span className="text-white/50 font-semibold">Open-Meteo</span> • Free & accurate
              </p>
              <Link href={`/water-prediction/${farmId}`} className="text-xs font-semibold text-cyan-300/80 flex items-center gap-1 hover:gap-2 transition-all hover:text-cyan-200">
                Details <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default WaterPredictionCard;
