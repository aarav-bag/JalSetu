import { TestTube, Droplet, Scale, Thermometer, ArrowRight, CheckCircle2, AlertTriangle, XCircle } from "lucide-react";
import { Link } from "wouter";
import { useLanguage } from "@/context/LanguageContext";

interface QualityMetric {
  name: string;
  value: string | number;
  unit?: string;
  status: string;
  icon: "ph" | "tds" | "temp";
}

interface WaterQualityCardProps {
  qualityMetrics: QualityMetric[];
  farmId?: number;
}

const WaterQualityCard = ({ qualityMetrics = [], farmId = 1 }: WaterQualityCardProps) => {
  const { t } = useLanguage();

  const getIcon = (icon: string) => {
    switch (icon) {
      case "ph": return <Droplet className="h-5 w-5" />;
      case "tds": return <Scale className="h-5 w-5" />;
      case "temp": return <Thermometer className="h-5 w-5" />;
      default: return <Droplet className="h-5 w-5" />;
    }
  };

  const getIconStyle = (icon: string) => {
    switch (icon) {
      case "ph": return { bg: 'rgba(59,130,246,0.2)', color: 'text-blue-300', border: 'rgba(59,130,246,0.3)' };
      case "tds": return { bg: 'rgba(168,85,247,0.2)', color: 'text-purple-300', border: 'rgba(168,85,247,0.3)' };
      case "temp": return { bg: 'rgba(249,115,22,0.2)', color: 'text-orange-300', border: 'rgba(249,115,22,0.3)' };
      default: return { bg: 'rgba(59,130,246,0.2)', color: 'text-blue-300', border: 'rgba(59,130,246,0.3)' };
    }
  };

  const getStatusInfo = (status: string) => {
    const s = status.toLowerCase();
    if (s === "good") return { icon: CheckCircle2, color: 'text-emerald-300', bg: 'rgba(16,185,129,0.15)', border: 'rgba(16,185,129,0.25)', label: "Good" };
    if (s === "warm" || s === "warning") return { icon: AlertTriangle, color: 'text-amber-300', bg: 'rgba(245,158,11,0.15)', border: 'rgba(245,158,11,0.25)', label: "Warm" };
    if (s === "bad" || s === "danger") return { icon: XCircle, color: 'text-red-300', bg: 'rgba(239,68,68,0.15)', border: 'rgba(239,68,68,0.25)', label: "Alert" };
    return { icon: CheckCircle2, color: 'text-white/40', bg: 'rgba(255,255,255,0.05)', border: 'rgba(255,255,255,0.1)', label: status };
  };

  const defaultMetrics: QualityMetric[] = [
    { name: "pH Level", value: "6.8", status: "Good", icon: "ph" },
    { name: "TDS", value: "320", unit: "ppm", status: "Good", icon: "tds" },
    { name: "Temp", value: "28°C", status: "Warm", icon: "temp" },
  ];

  const metrics = qualityMetrics.length ? qualityMetrics : defaultMetrics;

  return (
    <div className="mb-2">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-bold text-white/90 flex items-center gap-2">
          <div className="h-7 w-7 rounded-xl flex items-center justify-center"
            style={{ background: 'rgba(59,130,246,0.25)', border: '1px solid rgba(59,130,246,0.4)' }}>
            <TestTube className="h-4 w-4 text-blue-300" />
          </div>
          {t.waterQuality}
        </h3>
        <Link href={`/water-quality/${farmId}`} className="text-xs font-semibold text-cyan-300/80 flex items-center gap-1 hover:gap-2 transition-all hover:text-cyan-200">
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
        <div className="grid grid-cols-3 gap-3">
          {metrics.map((metric, index) => {
            const statusInfo = getStatusInfo(metric.status);
            const StatusIcon = statusInfo.icon;
            const iconStyle = getIconStyle(metric.icon);
            return (
              <div key={index} className="rounded-2xl p-4 flex flex-col items-center gap-2 transition-all duration-200 hover:scale-105"
                style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)' }}>
                <div className={`h-10 w-10 rounded-xl flex items-center justify-center ${iconStyle.color}`}
                  style={{ background: iconStyle.bg, border: `1px solid ${iconStyle.border}` }}>
                  {getIcon(metric.icon)}
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-white leading-none">{metric.value}</div>
                  {metric.unit && <div className="text-[10px] text-white/40 mt-0.5">{metric.unit}</div>}
                  <div className="text-[10px] text-white/50 font-medium mt-1">{metric.name}</div>
                </div>
                <div className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold ${statusInfo.color}`}
                  style={{ background: statusInfo.bg, border: `1px solid ${statusInfo.border}` }}>
                  <StatusIcon className="h-2.5 w-2.5" />
                  {statusInfo.label}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default WaterQualityCard;
