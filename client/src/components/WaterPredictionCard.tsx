import { Cloud, Sun, CloudRain, CloudSun, ArrowRight } from "lucide-react";
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
  
  const getWeatherIcon = (weather: string) => {
    switch (weather) {
      case "sunny":
        return <Sun className="h-6 w-6 text-amber-500" />;
      case "cloudy":
        return <Cloud className="h-6 w-6 text-gray-500" />;
      case "rainy":
        return <CloudRain className="h-6 w-6 text-blue-500" />;
      case "partly-cloudy":
        return <CloudSun className="h-6 w-6 text-gray-500" />;
      default:
        return <Sun className="h-6 w-6 text-amber-500" />;
    }
  };

  const getWeatherBackground = (weather: string) => {
    switch (weather) {
      case "sunny":
        return "from-amber-50 to-orange-50 border-amber-100 dark:from-amber-900/30 dark:to-orange-900/30 dark:border-amber-800";
      case "cloudy":
        return "from-gray-50 to-slate-50 border-gray-100 dark:from-gray-800 dark:to-slate-800 dark:border-gray-700";
      case "rainy":
        return "from-blue-50 to-indigo-50 border-blue-100 dark:from-blue-900/30 dark:to-indigo-900/30 dark:border-blue-800";
      case "partly-cloudy":
        return "from-blue-50 to-amber-50 border-blue-100 dark:from-blue-900/30 dark:to-amber-900/30 dark:border-blue-800";
      default:
        return "from-gray-50 to-white border-gray-100 dark:from-gray-800 dark:to-gray-700 dark:border-gray-600";
    }
  };

  // Default forecast if none provided
  const defaultForecast: ForecastDay[] = [
    { day: "Today", temperature: "32°C", weather: "sunny", rainChance: 5 },
    { day: "Tomorrow", temperature: "30°C", weather: "partly-cloudy", rainChance: 25 },
    { day: "Thu", temperature: "27°C", weather: "rainy", rainChance: 85 }
  ];

  const forecastData = forecast.length ? forecast : defaultForecast;

  return (
    <div className="mb-5">
      <h3 className="text-xl font-bold mb-4 flex items-center gradient-text">
        <div className="rounded-2xl bg-gradient-to-r from-blue-100 to-indigo-100 dark:from-blue-900/30 dark:to-indigo-900/30 p-2.5 mr-3 shadow-lg">
          <Cloud className="h-5 w-5 text-blue-600 dark:text-blue-400" />
        </div>
        {t.weatherPrediction}
      </h3>
      
      <Card className="glass-effect rounded-[2rem] shadow-2xl overflow-hidden border-0 enhanced-card hover:shadow-3xl transition-all duration-500 hover:scale-[1.02]">
        <CardContent className="p-6 relative">
          {/* Enhanced decorative elements */}
          <div className="absolute top-4 right-4 opacity-20 floating" style={{ animationDelay: '1.5s' }}>
            <CloudRain className="h-16 w-16 text-blue-400" />
          </div>
          <div className="absolute -bottom-8 -left-6 opacity-8 floating" style={{ animationDelay: '0.8s' }}>
            <CloudSun className="h-20 w-20 text-amber-400" />
          </div>
          <div className="absolute bottom-4 right-8 opacity-12">
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-400 to-indigo-400 animate-pulse"></div>
          </div>
          
          <div className="flex items-center relative z-10 mb-6">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center mr-5 shadow-lg pulse-effect">
              <CloudRain className="h-11 w-11 text-white" />
            </div>
            <div className="flex-1">
              <h4 className="font-bold text-gray-800 dark:text-gray-200 text-xl mb-2">{prediction}</h4>
              <div className="flex items-start">
                <CloudRain className="h-4 w-4 text-blue-500 mr-2 mt-0.5 flex-shrink-0" />
                <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">{advice}</p>
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-3 gap-4 mb-6">
            {forecastData.map((day, index) => (
              <div 
                key={index} 
                className={`bg-gradient-to-br ${getWeatherBackground(day.weather)} rounded-2xl p-4 text-center shadow-lg border hover:shadow-xl transition-all duration-300 hover:scale-105 scale-in`}
                style={{ animationDelay: `${index * 0.15}s` }}
              >
                <p className="text-xs font-semibold text-gray-600 dark:text-gray-300 mb-2 tracking-wide">{day.day}</p>
                <div className="flex justify-center my-3 floating" style={{ animationDelay: `${index * 0.2}s` }}>
                  {getWeatherIcon(day.weather)}
                </div>
                <p className="text-sm font-bold text-gray-800 dark:text-white mb-2">{day.temperature}</p>
                {day.rainChance !== undefined && (
                  <div className="text-center">
                    <p className="text-xs text-blue-600 dark:text-blue-400 font-semibold bg-blue-100/50 dark:bg-blue-900/30 px-2 py-1 rounded-full">{day.rainChance}%</p>
                  </div>
                )}
              </div>
            ))}
          </div>
          
          <div className="text-right">
            <Link href={`/water-prediction/${farmId}`} className="inline-flex items-center justify-center px-6 py-3 rounded-2xl bg-gradient-to-r from-blue-500 to-indigo-500 text-white text-sm font-semibold transition-all duration-300 hover:from-blue-600 hover:to-indigo-600 shadow-lg hover:shadow-xl hover:scale-105">
              {t.viewDetails}
              <ArrowRight className="h-4 w-4 ml-2" />
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default WaterPredictionCard;
