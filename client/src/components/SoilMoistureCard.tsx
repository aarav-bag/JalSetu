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
    if (level >= 60) return { stroke: "#34d399", text: "text-emerald-300", bar: "bg-emerald-400" };
    if (level >= 40) return { stroke: "#fbbf24", text: "text-amber-300", bar: "bg-amber-400" };
    return { stroke: "#f87171", text: "text-red-300", bar: "bg-red-400" };
  };

  const getFieldPillStyle = (status: string) => {
    switch (status) {
      case "optimal": return { bg: 'rgba(16,185,129,0.2)', color: 'text-emerald-300', border: 'rgba(16,185,129,0.35)' };
      case "warning": return { bg: 'rgba(245,158,11,0.2)', color: 'text-amber-300', border: 'rgba(245,158,11,0.35)' };
      case "danger": return { bg: 'rgba(239,68,68,0.2)', color: 'text-red-300', border: 'rgba(239,68,68,0.35)' };
      default: return { bg: 'rgba(255,255,255,0.1)', color: 'text-white/60', border: 'rgba(255,255,255,0.2)' };
    }
  };

  const defaultReadings: FieldReading[] = [
    { id: 1, name: "Field A", value: 68, status: "optimal" },
    { id: 2, name: "Field B", value: 45, status: "warning" },
  ];

  const readings = fieldReadings.length ? fieldReadings : defaultReadings;
  const colors = getColor(displayLevel);

  return (
    <div className="mb-2">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-bold text-white/90 flex items-center gap-2">
          <div className="h-7 w-7 rounded-xl flex items-center justify-center"
            style={{ background: 'rgba(16,185,129,0.25)', border: '1px solid rgba(16,185,129,0.4)' }}>
            <Shrub className="h-4 w-4 text-emerald-300" />
          </div>
          {t.soilMoisture}
        </h3>
        <Link href={`/soil-moisture/${farmId}`} className="text-xs font-semibold text-cyan-300/80 flex items-center gap-1 hover:gap-2 transition-all hover:text-cyan-200">
          View all <ArrowRight className="h-3 w-3" />
        </Link>
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
        <div className="flex items-center gap-5">
          {/* Circular gauge */}
          <div className="relative flex-shrink-0 w-28 h-28">
            {/* Glow ring behind */}
            <div className="absolute inset-2 rounded-full blur-md opacity-30"
              style={{ background: colors.stroke }}></div>
            <svg className="w-28 h-28 -rotate-90 relative z-10" viewBox="0 0 88 88">
              <circle cx="44" cy="44" r="36" stroke="rgba(255,255,255,0.1)" strokeWidth="7" fill="none" />
              <circle
                cx="44" cy="44" r="36"
                stroke={colors.stroke} strokeWidth="7" fill="none"
                strokeLinecap="round"
                strokeDasharray={circumference}
                strokeDashoffset={offset}
                style={{ transition: 'stroke-dashoffset 1s ease', filter: `drop-shadow(0 0 6px ${colors.stroke})` }}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className={`text-2xl font-bold ${colors.text} leading-none`}>{displayLevel}%</span>
              <span className="text-[9px] text-white/40 font-semibold mt-1 tracking-wider uppercase">moisture</span>
            </div>
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-white/90 mb-1 truncate">{moistureStatus}</p>
            <p className="text-xs text-white/50 mb-3 leading-relaxed">Levels within recommended range for optimal crop growth.</p>
            <div className="flex flex-wrap gap-1.5">
              {readings.map((field) => {
                const pill = getFieldPillStyle(field.status);
                return (
                  <span key={field.id} className={`px-2.5 py-1 rounded-xl text-xs font-semibold ${pill.color}`}
                    style={{ background: pill.bg, border: `1px solid ${pill.border}` }}>
                    {field.name}: {field.value}%
                  </span>
                );
              })}
            </div>
          </div>
        </div>

        {/* Progress bar */}
        <div className="mt-4 pt-4" style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }}>
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs text-white/40">Moisture level</span>
            <span className={`text-xs font-bold ${colors.text}`}>{displayLevel}%</span>
          </div>
          <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.1)' }}>
            <div className={`h-full rounded-full ${colors.bar} transition-all duration-1000`}
              style={{ width: `${displayLevel}%`, boxShadow: `0 0 8px ${colors.stroke}` }}></div>
          </div>
          <div className="flex justify-between mt-1">
            <span className="text-[10px] text-white/30">Dry</span>
            <span className="text-[10px] text-white/30">Optimal 60–80%</span>
            <span className="text-[10px] text-white/30">Wet</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SoilMoistureCard;
