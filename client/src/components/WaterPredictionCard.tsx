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
    if (!locationAsked) {
      setLocationAsked(true);
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (pos) => setCoords({ lat: pos.coords.latitude, lon: pos.coords.longitude }),
          () => setLocationError(true),
          { timeout: 8000 }
        );
      } else {
        setLocationError(true);
      }
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
      case "sunny":        return <Sun className="h-6 w-6 text-amber-500 dark:text-amber-300" />;
      case "cloudy":       return <Cloud className="h-6 w-6 text-gray-400 dark:text-white/50" />;
      case "rainy":        return <CloudRain className="h-6 w-6 text-blue-500 dark:text-blue-300" />;
      case "partly-cloudy":return <CloudSun className="h-6 w-6 text-cyan-500 dark:text-cyan-300" />;
      default:             return <Sun className="h-6 w-6 text-amber-500 dark:text-amber-300" />;
    }
  };

  const getRainClass = (chance?: number) => {
    if (!chance) return "text-gray-400 dark:text-white/30";
    if (chance >= 70) return "text-blue-600 dark:text-blue-300";
    if (chance >= 30) return "text-cyan-600 dark:text-cyan-300";
    return "text-gray-400 dark:text-white/40";
  };

  return (
    <div className="mb-2">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-bold card-heading flex items-center gap-2">
          <div className="h-7 w-7 rounded-xl flex items-center justify-center"
            style={{ background: 'rgba(59,130,246,0.15)', border: '1px solid rgba(59,130,246,0.3)' }}>
            <Cloud className="h-4 w-4 text-blue-600 dark:text-blue-300" />
          </div>
          {t.weatherPrediction}
        </h3>
        <div className="flex items-center gap-2">
          {coords && (
            <span className="flex items-center gap-1 text-[10px] font-semibold text-emerald-600 dark:text-emerald-300 px-2 py-0.5 rounded-full"
              style={{ background: 'rgba(16,185,129,0.12)', border: '1px solid rgba(16,185,129,0.25)' }}>
              <MapPin className="h-2.5 w-2.5" /> Live location
            </span>
          )}
          {locationError && !coords && (
            <span className="flex items-center gap-1 text-[10px] card-label px-2 py-0.5 rounded-full"
              style={{ background: 'rgba(0,0,0,0.06)', border: '1px solid rgba(0,0,0,0.1)' }}>
              <MapPin className="h-2.5 w-2.5" /> Default location
            </span>
          )}
          <button onClick={() => refetch()}
            className="h-6 w-6 rounded-xl glass-tile flex items-center justify-center transition-all hover:scale-110">
            <RefreshCw className="h-3 w-3 card-label" />
          </button>
        </div>
      </div>

      <div className="glass-card rounded-[1.5rem] p-5">
        {/* Loading */}
        {(isLoading || (!coords && !locationError)) && (
          <div className="space-y-3">
            <div className="flex items-center gap-3 p-3 rounded-2xl glass-tile">
              <Loader2 className="h-5 w-5 text-blue-500 animate-spin flex-shrink-0" />
              <div>
                <p className="text-sm font-semibold card-heading">Fetching real weather...</p>
                <p className="text-xs card-muted mt-0.5">{!locationError && !coords ? "Waiting for your location" : "Loading forecast"}</p>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {[0, 1, 2].map(i => (
                <div key={i} className="h-24 rounded-2xl animate-pulse glass-tile" />
              ))}
            </div>
          </div>
        )}

        {/* Error */}
        {isError && (
          <div className="p-3 rounded-2xl text-center"
            style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)' }}>
            <p className="text-sm font-semibold text-red-600 dark:text-red-300">Could not load weather</p>
            <button onClick={() => refetch()} className="text-xs text-red-500 mt-1 underline">Try again</button>
          </div>
        )}

        {/* Data */}
        {!isLoading && weather && (
          <>
            <div className="flex items-start gap-3 p-3 rounded-2xl mb-4"
              style={{ background: 'rgba(59,130,246,0.10)', border: '1px solid rgba(59,130,246,0.22)' }}>
              <div className="h-8 w-8 flex-shrink-0 rounded-xl gradient-blue flex items-center justify-center shadow-md">
                <Umbrella className="h-4 w-4 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold card-heading leading-tight">{weather.message}</p>
                <p className="text-xs card-body mt-0.5 leading-relaxed">{weather.advice}</p>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2">
              {weather.forecast.map((day, index) => (
                <div key={index} className="glass-tile rounded-2xl p-3 text-center transition-all duration-200 hover:scale-105">
                  <p className="text-[10px] font-semibold card-label uppercase tracking-wider mb-2">{day.day}</p>
                  <div className="flex justify-center mb-2">{getWeatherIcon(day.weather)}</div>
                  <p className="text-sm font-bold card-value mb-1">{day.temperature}</p>
                  {day.rainChance !== undefined && (
                    <div className={`flex items-center justify-center gap-0.5 text-[10px] font-semibold ${getRainClass(day.rainChance)}`}>
                      <CloudRain className="h-2.5 w-2.5" />{day.rainChance}%
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div className="flex items-center justify-between mt-4 pt-3 border-t divider">
              <p className="text-[10px] card-muted flex items-center gap-1">
                Powered by <span className="font-semibold card-label">Open-Meteo</span> · Free & accurate
              </p>
              <Link href={`/water-prediction/${farmId}`} className="text-xs font-semibold text-blue-600 dark:text-cyan-300/80 flex items-center gap-1 hover:gap-2 transition-all">
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
