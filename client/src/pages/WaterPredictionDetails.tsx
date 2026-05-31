import { useRoute, Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, Cloud, Sun, CloudRain, CloudSun, TrendingUp, Droplet, Calendar, Umbrella } from "lucide-react";
import Header from "@/components/Header";
import BottomNavigation from "@/components/BottomNavigation";
import PageShell from "@/components/PageShell";

interface ForecastDay {
  day: string;
  date: string;
  temperature: string;
  tempMin: string;
  weather: "sunny" | "cloudy" | "rainy" | "partly-cloudy";
  rainChance: number;
  precipitation: number;
}

interface WeatherResult {
  message: string;
  advice: string;
  forecast: ForecastDay[];
}

const WaterPredictionDetails = () => {
  const [, params] = useRoute("/water-prediction/:id");
  const farmId = params?.id ? parseInt(params.id) : 1;
  const { data: predictionData, isLoading } = useQuery<WeatherResult>({
    queryKey: [`/api/farm/${farmId}/water-prediction`],
    staleTime: 5 * 60 * 1000,
    retry: 2,
  });

  const getWeatherIcon = (weather: string) => {
    switch (weather) {
      case "sunny": return <Sun className="h-6 w-6 text-amber-400 dark:text-amber-300" />;
      case "cloudy": return <Cloud className="h-6 w-6 text-gray-400 dark:text-white/50" />;
      case "rainy": return <CloudRain className="h-6 w-6 text-blue-400 dark:text-blue-300" />;
      case "partly-cloudy": return <CloudSun className="h-6 w-6 text-cyan-400 dark:text-cyan-300" />;
      default: return <Sun className="h-6 w-6 text-amber-400 dark:text-amber-300" />;
    }
  };

  const getDayBg = (weather: string) => {
    switch (weather) {
      case "sunny": return { bg: 'rgba(245,158,11,0.12)', border: 'rgba(245,158,11,0.25)' };
      case "rainy": return { bg: 'rgba(59,130,246,0.12)', border: 'rgba(59,130,246,0.25)' };
      case "partly-cloudy": return { bg: 'rgba(6,182,212,0.12)', border: 'rgba(6,182,212,0.25)' };
      default: return { bg: 'rgba(255,255,255,0.06)', border: 'rgba(255,255,255,0.12)' };
    }
  };

  const waterNeeds = [
    { crop: "Rice", currentNeed: "Low", nextWeek: "Medium" },
    { crop: "Vegetables", currentNeed: "Medium", nextWeek: "Low" },
    { crop: "Fruit Trees", currentNeed: "High", nextWeek: "Medium" },
  ];

  const getNeedStyle = (need: string) => {
    switch (need) {
      case "Low": return { bg: 'rgba(16,185,129,0.15)', color: 'text-emerald-600 dark:text-emerald-300', border: 'rgba(16,185,129,0.3)' };
      case "Medium": return { bg: 'rgba(245,158,11,0.15)', color: 'text-amber-600 dark:text-amber-300', border: 'rgba(245,158,11,0.3)' };
      default: return { bg: 'rgba(239,68,68,0.15)', color: 'text-red-600 dark:text-red-300', border: 'rgba(239,68,68,0.3)' };
    }
  };

  const forecast = predictionData?.forecast ?? [];
  const maxPrecip = Math.max(...forecast.map(d => d.precipitation), 1);

  return (
    <PageShell>
      <Header />
      <main className="flex-1 px-5 pt-2 pb-28 overflow-y-auto z-10">
        <div className="flex items-center mb-5">
          <Link href="/" className="mr-3">
            <div className="h-9 w-9 rounded-xl glass-tile flex items-center justify-center shadow-sm">
              <ArrowLeft className="h-4 w-4 text-gray-600 dark:text-white/70" />
            </div>
          </Link>
          <h1 className="text-xl font-bold card-heading">Weather Prediction Details</h1>
        </div>

        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map(i => <div key={i} className="h-40 glass-card animate-pulse rounded-2xl" />)}
          </div>
        ) : (
          <div className="space-y-5">
            {/* Current Prediction */}
            <div className="slide-in-right">
              <h3 className="text-base font-bold card-heading mb-3 flex items-center gap-2">
                <div className="h-7 w-7 rounded-xl flex items-center justify-center" style={{ background: 'rgba(59,130,246,0.15)', border: '1px solid rgba(59,130,246,0.3)' }}>
                  <Cloud className="h-4 w-4 text-blue-500 dark:text-blue-300" />
                </div>
                Current Prediction
              </h3>
              <div className="glass-card rounded-[1.25rem] p-5">
                <div className="flex items-center gap-4">
                  <div className="h-14 w-14 rounded-2xl flex items-center justify-center shadow-lg" style={{ background: 'linear-gradient(135deg, rgba(59,130,246,0.8), rgba(6,182,212,0.8))', border: '1px solid rgba(255,255,255,0.25)' }}>
                    <Umbrella className="h-7 w-7 text-white" />
                  </div>
                  <div>
                    <h4 className="font-bold card-heading">{predictionData?.message ?? "Fetching forecast..."}</h4>
                    <p className="text-sm card-body mt-1">{predictionData?.advice ?? "Please wait while we load live weather data."}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* 7-Day Forecast */}
            {forecast.length > 0 && (
              <div className="slide-in-left">
                <h3 className="text-base font-bold card-heading mb-3 flex items-center gap-2">
                  <div className="h-7 w-7 rounded-xl flex items-center justify-center" style={{ background: 'rgba(99,102,241,0.15)', border: '1px solid rgba(99,102,241,0.3)' }}>
                    <Calendar className="h-4 w-4 text-indigo-500 dark:text-indigo-300" />
                  </div>
                  {forecast.length}-Day Forecast
                </h3>
                <div className="glass-card rounded-[1.25rem] p-5">
                  <div className="overflow-x-auto pb-1">
                    <div className="flex gap-2" style={{ minWidth: `${forecast.length * 70}px` }}>
                      {forecast.map((day, i) => {
                        const db = getDayBg(day.weather);
                        return (
                          <div key={i} className="flex-1 rounded-2xl p-3 text-center hover:scale-105 transition-all"
                            style={{ background: db.bg, border: `1px solid ${db.border}` }}>
                            <p className="text-[10px] font-semibold card-label mb-1.5">{day.day}</p>
                            <div className="flex justify-center mb-1.5">{getWeatherIcon(day.weather)}</div>
                            <p className="text-sm font-bold card-value">{day.temperature}</p>
                            <p className="text-[10px] card-muted mt-0.5">{day.tempMin}</p>
                            {day.rainChance > 0 && (
                              <p className="text-[9px] text-blue-500 dark:text-blue-300 font-semibold mt-1">{day.rainChance}%</p>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Precipitation */}
            {forecast.length > 0 && (
              <div className="fade-in">
                <h3 className="text-base font-bold card-heading mb-3 flex items-center gap-2">
                  <div className="h-7 w-7 rounded-xl flex items-center justify-center" style={{ background: 'rgba(59,130,246,0.15)', border: '1px solid rgba(59,130,246,0.3)' }}>
                    <Droplet className="h-4 w-4 text-blue-500 dark:text-blue-300" />
                  </div>
                  Precipitation Forecast
                </h3>
                <div className="glass-card rounded-[1.25rem] p-5 space-y-3">
                  {forecast.map((d, i) => (
                    <div key={i} className={`${i < forecast.length - 1 ? 'pb-3 border-b divider' : ''}`}>
                      <div className="flex justify-between items-center mb-1.5">
                        <span className="text-sm font-semibold card-value">{d.day}</span>
                        <span className="text-xs card-label">
                          {d.precipitation > 0 ? `${d.precipitation} mm` : "0 mm"} · {d.rainChance}%
                        </span>
                      </div>
                      <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(59,130,246,0.12)' }}>
                        <div className="h-full bg-blue-400 rounded-full transition-all duration-1000"
                          style={{ width: `${d.precipitation > 0 ? Math.max((d.precipitation / maxPrecip) * 100, 4) : (d.rainChance > 0 ? 3 : 0)}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Water Needs */}
            <div className="scale-in">
              <h3 className="text-base font-bold card-heading mb-3 flex items-center gap-2">
                <div className="h-7 w-7 rounded-xl flex items-center justify-center" style={{ background: 'rgba(16,185,129,0.15)', border: '1px solid rgba(16,185,129,0.3)' }}>
                  <TrendingUp className="h-4 w-4 text-emerald-500 dark:text-emerald-300" />
                </div>
                Crop Water Needs
              </h3>
              <div className="glass-card rounded-[1.25rem] p-5 mb-4">
                <p className="text-sm card-body mb-4">Estimated requirements based on weather & crop stage:</p>
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[320px]">
                    <thead>
                      <tr className="border-b divider">
                        {["Crop Type", "Current Need", "Next Week"].map(h => (
                          <th key={h} className="py-2 px-3 text-left text-xs font-semibold card-label">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {waterNeeds.map((item, i) => (
                        <tr key={i} className={i !== waterNeeds.length - 1 ? "border-b divider" : ""}>
                          <td className="py-2.5 px-3 text-sm font-semibold card-value">{item.crop}</td>
                          {[item.currentNeed, item.nextWeek].map((need, j) => {
                            const ns = getNeedStyle(need);
                            return (
                              <td key={j} className="py-2.5 px-3">
                                <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${ns.color}`}
                                  style={{ background: ns.bg, border: `1px solid ${ns.border}` }}>
                                  {need}
                                </span>
                              </td>
                            );
                          })}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
      <BottomNavigation />
    </PageShell>
  );
};

export default WaterPredictionDetails;
