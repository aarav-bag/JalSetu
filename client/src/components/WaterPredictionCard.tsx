import { Cloud, Sun, CloudRain, CloudSun, ArrowRight, Umbrella } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Link } from "wouter";
import { useLanguage } from "@/context/LanguageContext";

interface ForecastDay {
  day: string;
  temperature: string;
  weather: "sunny" | "cloudy" | "rainy" | "partly-cloudy";
  rainChance?: number;
}

interface WaterPredictionCardProps {
  prediction: string;
  advice: string;
  forecast: ForecastDay[];
  farmId?: number;
}

const WaterPredictionCard = ({
  prediction = "Rain expected in 2 days",
  advice = "Delay irrigation to save water and energy.",
  forecast = [],
  farmId = 1
}: WaterPredictionCardProps) => {
  const { t } = useLanguage();

  const getWeatherIcon = (weather: string, size = "h-6 w-6") => {
    switch (weather) {
      case "sunny": return <Sun className={`${size} text-amber-500`} />;
      case "cloudy": return <Cloud className={`${size} text-gray-400`} />;
      case "rainy": return <CloudRain className={`${size} text-blue-500`} />;
      case "partly-cloudy": return <CloudSun className={`${size} text-blue-400`} />;
      default: return <Sun className={`${size} text-amber-500`} />;
    }
  };

  const getRainColor = (chance?: number) => {
    if (!chance) return "text-gray-400";
    if (chance >= 70) return "text-blue-600 dark:text-blue-400";
    if (chance >= 30) return "text-blue-400 dark:text-blue-500";
    return "text-gray-400 dark:text-gray-500";
  };

  const defaultForecast: ForecastDay[] = [
    { day: "Today", temperature: "32°C", weather: "sunny", rainChance: 5 },
    { day: "Tomorrow", temperature: "30°C", weather: "partly-cloudy", rainChance: 25 },
    { day: "Thu", temperature: "27°C", weather: "rainy", rainChance: 85 },
  ];

  const forecastData = forecast.length ? forecast : defaultForecast;

  return (
    <div className="mb-5">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-base font-bold text-gray-800 dark:text-white flex items-center gap-2">
          <div className="h-7 w-7 rounded-xl bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center">
            <Cloud className="h-4 w-4 text-blue-600 dark:text-blue-400" />
          </div>
          {t.weatherPrediction}
        </h3>
        <Link href={`/water-prediction/${farmId}`} className="text-xs font-semibold text-blue-500 dark:text-blue-400 flex items-center gap-1 hover:gap-2 transition-all">
          View all <ArrowRight className="h-3 w-3" />
        </Link>
      </div>

      <Card className="rounded-[1.5rem] border-0 shadow-sm bg-white dark:bg-gray-900 overflow-hidden">
        <CardContent className="p-5">
          {/* Alert banner */}
          <div className="flex items-start gap-3 p-3 rounded-2xl bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800/30 mb-4">
            <div className="h-8 w-8 flex-shrink-0 rounded-xl bg-blue-500 flex items-center justify-center">
              <Umbrella className="h-4 w-4 text-white" />
            </div>
            <div>
              <p className="text-sm font-bold text-gray-800 dark:text-white leading-tight">{prediction}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 leading-relaxed">{advice}</p>
            </div>
          </div>

          {/* 3-day forecast */}
          <div className="grid grid-cols-3 gap-2">
            {forecastData.map((day, index) => (
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
                  <div className={`flex items-center justify-center gap-0.5 text-[10px] font-semibold ${getRainColor(day.rainChance)}`}>
                    <CloudRain className="h-2.5 w-2.5" />
                    {day.rainChance}%
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default WaterPredictionCard;
