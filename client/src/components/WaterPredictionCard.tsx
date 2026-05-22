import { Cloud, Sun, CloudRain, CloudSun, ArrowRight, Umbrella, MapPin, RefreshCw, Loader2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
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

  // Ask for geolocation once on mount
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

  const weatherUrl = coords
    ? `/api/weather?lat=${coords.lat}&lon=${coords.lon}`
    : locationError
    ? `/api/weather` // use default (New Delhi)
    : null;

  const { data: weather, isLoading, isError, refetch } = useQuery<WeatherData>({
    queryKey: ["/api/weather", coords?.lat, coords?.lon],
    queryFn: async () => {
      const url = coords
        ? `/api/weather?lat=${coords.lat}&lon=${coords.lon}`
        : `/api/weather`;
      const res = await fetch(url);
      if (!res.ok) throw new Error("Weather fetch failed");
      return res.json();
    },
    enabled: !!coords || locationError,
    staleTime: 1000 * 60 * 15, // cache 15 minutes
    retry: 2,
  });

  const getWeatherIcon = (type: string, size = "h-6 w-6") => {
    switch (type) {
      case "sunny": return <Sun className={`${size} text-amber-500`} />;
      case "cloudy": return <Cloud className={`${size} text-gray-400`} />;
      case "rainy": return <CloudRain className={`${size} text-blue-500`} />;
      case "partly-cloudy": return <CloudSun className={`${size} text-blue-400`} />;
      default: return <Sun className={`${size} text-amber-500`} />;
    }
  };

  const getRainBg = (chance?: number) => {
    if (!chance) return "text-gray-400 dark:text-gray-500";
    if (chance >= 70) return "text-blue-600 dark:text-blue-400";
    if (chance >= 30) return "text-blue-400 dark:text-blue-500";
    return "text-gray-400 dark:text-gray-500";
  };

  const isReady = !isLoading && weather;

  return (
    <div className="mb-5">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-base font-bold text-gray-800 dark:text-white flex items-center gap-2">
          <div className="h-7 w-7 rounded-xl bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center">
            <Cloud className="h-4 w-4 text-blue-600 dark:text-blue-400" />
          </div>
          {t.weatherPrediction}
        </h3>
        <div className="flex items-center gap-2">
          {coords && (
            <span className="flex items-center gap-1 text-[10px] text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/30 px-2 py-0.5 rounded-full font-medium">
              <MapPin className="h-2.5 w-2.5" />
              Live location
            </span>
          )}
          {locationError && !coords && (
            <span className="flex items-center gap-1 text-[10px] text-gray-500 bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded-full font-medium">
              <MapPin className="h-2.5 w-2.5" />
              Default location
            </span>
          )}
          <button
            onClick={() => refetch()}
            className="h-6 w-6 rounded-xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
          >
            <RefreshCw className="h-3 w-3 text-gray-500 dark:text-gray-400" />
          </button>
        </div>
      </div>

      <Card className="rounded-[1.5rem] border-0 shadow-sm bg-white dark:bg-gray-900 overflow-hidden">
        <CardContent className="p-5">
          {/* Loading state */}
          {(isLoading || (!coords && !locationError)) && (
            <div className="space-y-3">
              <div className="flex items-center gap-3 p-3 rounded-2xl bg-gray-50 dark:bg-gray-800">
                <Loader2 className="h-5 w-5 text-blue-500 animate-spin flex-shrink-0" />
                <div>
                  <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">Fetching real weather...</p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {!locationError && !coords ? "Waiting for your location" : "Loading forecast data"}
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-2">
                {[0, 1, 2].map(i => (
                  <div key={i} className="h-24 bg-gray-50 dark:bg-gray-800 rounded-2xl animate-pulse"></div>
                ))}
              </div>
            </div>
          )}

          {/* Error state */}
          {isError && (
            <div className="p-3 rounded-2xl bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800/30 text-center">
              <p className="text-sm font-semibold text-red-700 dark:text-red-400">Could not load weather</p>
              <button onClick={() => refetch()} className="text-xs text-red-500 mt-1 underline">Try again</button>
            </div>
          )}

          {/* Real weather data */}
          {isReady && (
            <>
              {/* Alert banner */}
              <div className="flex items-start gap-3 p-3 rounded-2xl bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800/30 mb-4">
                <div className="h-8 w-8 flex-shrink-0 rounded-xl bg-blue-500 flex items-center justify-center">
                  <Umbrella className="h-4 w-4 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-gray-800 dark:text-white leading-tight">{weather.message}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 leading-relaxed">{weather.advice}</p>
                </div>
              </div>

              {/* 3-day forecast */}
              <div className="grid grid-cols-3 gap-2">
                {weather.forecast.map((day, index) => (
                  <div
                    key={index}
                    className="rounded-2xl p-3 text-center bg-gray-50 dark:bg-gray-800/60 border border-gray-100 dark:border-gray-700/50 hover:border-blue-200 dark:hover:border-blue-700/50 transition-all duration-200"
                  >
                    <p className="text-[10px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">{day.day}</p>
                    <div className="flex justify-center mb-2">
                      {getWeatherIcon(day.weather)}
                    </div>
                    <p className="text-sm font-bold text-gray-800 dark:text-white mb-1">{day.temperature}</p>
                    {day.rainChance !== undefined && (
                      <div className={`flex items-center justify-center gap-0.5 text-[10px] font-semibold ${getRainBg(day.rainChance)}`}>
                        <CloudRain className="h-2.5 w-2.5" />
                        {day.rainChance}%
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Footer */}
              <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-100 dark:border-gray-800">
                <p className="text-[10px] text-gray-400 dark:text-gray-500 flex items-center gap-1">
                  <span>Powered by</span>
                  <span className="font-semibold text-gray-500 dark:text-gray-400">Open-Meteo</span>
                  <span>• Free & accurate</span>
                </p>
                <Link href={`/water-prediction/${farmId}`} className="text-xs font-semibold text-blue-500 dark:text-blue-400 flex items-center gap-1 hover:gap-2 transition-all">
                  Details <ArrowRight className="h-3 w-3" />
                </Link>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default WaterPredictionCard;
