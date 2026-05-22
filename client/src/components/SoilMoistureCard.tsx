import { Shrub, ArrowRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Link } from "wouter";
import { useLanguage } from "@/context/LanguageContext";

interface FieldReading {
  id: number;
  name: string;
  value: number;
  status: "optimal" | "warning" | "danger";
}

interface SoilMoistureCardProps {
  moistureLevel: number;
  moistureStatus: string;
  fieldReadings: FieldReading[];
  farmId?: number;
}

const SoilMoistureCard = ({
  moistureLevel = 68,
  moistureStatus = "Ideal Moisture Level",
  fieldReadings = [],
  farmId = 1
}: SoilMoistureCardProps) => {
  const { t } = useLanguage();
  const displayLevel = moistureLevel > 0 ? moistureLevel : 68;
  const circumference = 2 * Math.PI * 36;
  const offset = circumference - (displayLevel / 100) * circumference;

  const getColor = (level: number) => {
    if (level >= 60) return { stroke: "#10b981", text: "text-emerald-500", bg: "bg-emerald-500" };
    if (level >= 40) return { stroke: "#f59e0b", text: "text-amber-500", bg: "bg-amber-500" };
    return { stroke: "#ef4444", text: "text-red-500", bg: "bg-red-500" };
  };

  const getFieldStatus = (status: string) => {
    switch (status) {
      case "optimal": return "bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400";
      case "warning": return "bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400";
      case "danger": return "bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-400";
      default: return "bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-400";
    }
  };

  const defaultReadings: FieldReading[] = [
    { id: 1, name: "Field A", value: 68, status: "optimal" },
    { id: 2, name: "Field B", value: 45, status: "warning" },
  ];

  const readings = fieldReadings.length ? fieldReadings : defaultReadings;
  const colors = getColor(displayLevel);

  return (
    <div className="mb-5">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-base font-bold text-gray-800 dark:text-white flex items-center gap-2">
          <div className="h-7 w-7 rounded-xl bg-emerald-50 dark:bg-emerald-900/30 flex items-center justify-center">
            <Shrub className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
          </div>
          {t.soilMoisture}
        </h3>
        <Link href={`/soil-moisture/${farmId}`} className="text-xs font-semibold text-blue-500 dark:text-blue-400 flex items-center gap-1 hover:gap-2 transition-all">
          View all <ArrowRight className="h-3 w-3" />
        </Link>
      </div>

      <Card className="rounded-[1.5rem] border-0 shadow-sm bg-white dark:bg-gray-900 overflow-hidden">
        <CardContent className="p-5">
          <div className="flex items-center gap-5">
            {/* Circular gauge */}
            <div className="relative flex-shrink-0 w-28 h-28">
              <svg className="w-28 h-28 -rotate-90" viewBox="0 0 88 88">
                <circle
                  cx="44" cy="44" r="36"
                  stroke="#e5e7eb" strokeWidth="7" fill="none"
                  className="dark:stroke-gray-700"
                />
                <circle
                  cx="44" cy="44" r="36"
                  stroke={colors.stroke} strokeWidth="7" fill="none"
                  strokeLinecap="round"
                  strokeDasharray={circumference}
                  strokeDashoffset={offset}
                  style={{ transition: 'stroke-dashoffset 1s ease' }}
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className={`text-2xl font-bold ${colors.text} leading-none`}>{displayLevel}%</span>
                <span className="text-[9px] text-gray-400 dark:text-gray-500 font-semibold mt-1 tracking-wider uppercase">moisture</span>
              </div>
            </div>

            {/* Right info */}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-gray-800 dark:text-white mb-1 truncate">{moistureStatus}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-3 leading-relaxed">Current levels are within the recommended range for optimal crop growth.</p>

              {/* Field pills */}
              <div className="flex flex-wrap gap-1.5">
                {readings.map((field) => (
                  <span
                    key={field.id}
                    className={`px-2.5 py-1 rounded-xl text-xs font-semibold ${getFieldStatus(field.status)}`}
                  >
                    {field.name}: {field.value}%
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Progress bar strip */}
          <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-800">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs text-gray-500 dark:text-gray-400">Moisture level</span>
              <span className={`text-xs font-bold ${colors.text}`}>{displayLevel}%</span>
            </div>
            <div className="h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full ${colors.bg} transition-all duration-1000`}
                style={{ width: `${displayLevel}%` }}
              ></div>
            </div>
            <div className="flex justify-between mt-1">
              <span className="text-[10px] text-gray-400">Dry</span>
              <span className="text-[10px] text-gray-400">Optimal 60–80%</span>
              <span className="text-[10px] text-gray-400">Wet</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SoilMoistureCard;
