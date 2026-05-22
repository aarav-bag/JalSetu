import { Shrub, ArrowRight } from "lucide-react";
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
    if (level >= 60) return { stroke: "#10b981", textClass: "text-emerald-600 dark:text-emerald-300", barClass: "bg-emerald-500" };
    if (level >= 40) return { stroke: "#f59e0b", textClass: "text-amber-600 dark:text-amber-300",   barClass: "bg-amber-500" };
    return              { stroke: "#ef4444", textClass: "text-red-600 dark:text-red-300",          barClass: "bg-red-500" };
  };

  const getPillStyle = (status: string) => {
    switch (status) {
      case "optimal": return { bg: 'rgba(16,185,129,0.12)',  colorClass: 'text-emerald-600 dark:text-emerald-300', border: 'rgba(16,185,129,0.3)' };
      case "warning": return { bg: 'rgba(245,158,11,0.12)', colorClass: 'text-amber-600 dark:text-amber-300',   border: 'rgba(245,158,11,0.3)' };
      case "danger":  return { bg: 'rgba(239,68,68,0.12)',   colorClass: 'text-red-600 dark:text-red-300',       border: 'rgba(239,68,68,0.3)' };
      default:        return { bg: 'rgba(0,0,0,0.05)',       colorClass: 'card-label',                           border: 'rgba(0,0,0,0.1)' };
    }
  };

  const defaultReadings: FieldReading[] = [
    { id: 1, name: "Field A", value: 68, status: "optimal" },
    { id: 2, name: "Field B", value: 45, status: "warning" },
  ];

  const readings = fieldReadings.length ? fieldReadings : defaultReadings;
  const colors   = getColor(displayLevel);

  return (
    <div className="mb-2">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-bold card-heading flex items-center gap-2">
          <div className="h-7 w-7 rounded-xl flex items-center justify-center"
            style={{ background: 'rgba(16,185,129,0.15)', border: '1px solid rgba(16,185,129,0.3)' }}>
            <Shrub className="h-4 w-4 text-emerald-600 dark:text-emerald-300" />
          </div>
          {t.soilMoisture}
        </h3>
        <Link href={`/soil-moisture/${farmId}`} className="text-xs font-semibold text-blue-600 dark:text-cyan-300/80 flex items-center gap-1 hover:gap-2 transition-all">
          View all <ArrowRight className="h-3 w-3" />
        </Link>
      </div>

      <div className="glass-card rounded-[1.5rem] p-5">
        <div className="flex items-center gap-5">
          {/* Circular gauge */}
          <div className="relative flex-shrink-0 w-28 h-28">
            <div className="absolute inset-2 rounded-full blur-md opacity-20"
              style={{ background: colors.stroke }} />
            <svg className="w-28 h-28 -rotate-90 relative z-10" viewBox="0 0 88 88">
              <circle cx="44" cy="44" r="36" stroke="rgba(128,128,128,0.2)" strokeWidth="7" fill="none" />
              <circle cx="44" cy="44" r="36"
                stroke={colors.stroke} strokeWidth="7" fill="none" strokeLinecap="round"
                strokeDasharray={circumference} strokeDashoffset={offset}
                style={{ transition: 'stroke-dashoffset 1s ease', filter: `drop-shadow(0 0 6px ${colors.stroke})` }}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className={`text-2xl font-bold leading-none ${colors.textClass}`}>{displayLevel}%</span>
              <span className="text-[9px] card-muted font-semibold mt-1 tracking-wider uppercase">moisture</span>
            </div>
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold card-heading mb-1 truncate">{moistureStatus}</p>
            <p className="text-xs card-body mb-3 leading-relaxed">Levels within recommended range for optimal crop growth.</p>
            <div className="flex flex-wrap gap-1.5">
              {readings.map((field) => {
                const pill = getPillStyle(field.status);
                return (
                  <span key={field.id} className={`px-2.5 py-1 rounded-xl text-xs font-semibold ${pill.colorClass}`}
                    style={{ background: pill.bg, border: `1px solid ${pill.border}` }}>
                    {field.name}: {field.value}%
                  </span>
                );
              })}
            </div>
          </div>
        </div>

        {/* Progress bar */}
        <div className="mt-4 pt-4 border-t divider">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs card-label">Moisture level</span>
            <span className={`text-xs font-bold ${colors.textClass}`}>{displayLevel}%</span>
          </div>
          <div className="h-1.5 rounded-full overflow-hidden bg-gray-200/60 dark:bg-white/10">
            <div className={`h-full rounded-full transition-all duration-1000 ${colors.barClass}`}
              style={{ width: `${displayLevel}%`, boxShadow: `0 0 8px ${colors.stroke}` }} />
          </div>
          <div className="flex justify-between mt-1">
            <span className="text-[10px] card-muted">Dry</span>
            <span className="text-[10px] card-muted">Optimal 60–80%</span>
            <span className="text-[10px] card-muted">Wet</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SoilMoistureCard;
