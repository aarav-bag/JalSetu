import { TestTube, Droplet, Scale, Thermometer, ArrowRight, CheckCircle2, AlertTriangle, XCircle, ShieldCheck } from "lucide-react";
import { Link } from "wouter";
import { useLanguage } from "@/context/LanguageContext";

interface QualityMetric {
  name: string;
  value: string | number;
  unit?: string;
  status: string;
  icon: "ph" | "tds" | "temp" | "score";
}

interface WaterQualityCardProps {
  qualityMetrics: QualityMetric[];
  farmId?: number;
}

const WaterQualityCard = ({ qualityMetrics = [], farmId = 1 }: WaterQualityCardProps) => {
  const { t } = useLanguage();

  const getIcon = (icon: string) => {
    switch (icon) {
      case "ph":   return <Droplet className="h-5 w-5 text-blue-500 dark:text-blue-300" />;
      case "tds":  return <Scale className="h-5 w-5 text-purple-500 dark:text-purple-300" />;
      case "temp":  return <Thermometer className="h-5 w-5 text-orange-500 dark:text-orange-300" />;
      case "score": return <ShieldCheck className="h-5 w-5 text-emerald-500 dark:text-emerald-300" />;
      default:      return <Droplet className="h-5 w-5 text-blue-500 dark:text-blue-300" />;
    }
  };

  const getIconStyle = (icon: string) => {
    switch (icon) {
      case "ph":   return { bg: 'rgba(59,130,246,0.15)',  border: 'rgba(59,130,246,0.3)' };
      case "tds":  return { bg: 'rgba(168,85,247,0.15)',  border: 'rgba(168,85,247,0.3)' };
      case "temp":  return { bg: 'rgba(249,115,22,0.15)',  border: 'rgba(249,115,22,0.3)' };
      case "score": return { bg: 'rgba(16,185,129,0.15)', border: 'rgba(16,185,129,0.3)' };
      default:      return { bg: 'rgba(59,130,246,0.15)', border: 'rgba(59,130,246,0.3)' };
    }
  };

  const getStatusInfo = (status: string) => {
    const s = status.toLowerCase();
    if (s === "good")                    return { Icon: CheckCircle2, colorClass: 'text-emerald-600 dark:text-emerald-300', bg: 'rgba(16,185,129,0.12)',  border: 'rgba(16,185,129,0.25)',  label: "Good" };
    if (s === "warm" || s === "warning") return { Icon: AlertTriangle, colorClass: 'text-amber-600 dark:text-amber-300',   bg: 'rgba(245,158,11,0.12)', border: 'rgba(245,158,11,0.25)', label: "Warm" };
    if (s === "bad"  || s === "danger")  return { Icon: XCircle,       colorClass: 'text-red-600 dark:text-red-300',       bg: 'rgba(239,68,68,0.12)',   border: 'rgba(239,68,68,0.25)',   label: "Alert" };
    return { Icon: CheckCircle2, colorClass: 'text-gray-400 dark:text-white/40', bg: 'rgba(0,0,0,0.05)', border: 'rgba(0,0,0,0.1)', label: status };
  };

  const defaultMetrics: QualityMetric[] = [
    { name: "pH Level", value: "6.8", status: "Good", icon: "ph" },
    { name: "TDS",      value: "320", unit: "ppm", status: "Good", icon: "tds" },
    { name: "Temp",     value: "28°C", status: "Warm", icon: "temp" },
  ];

  const metrics = qualityMetrics.length ? qualityMetrics : defaultMetrics;

  return (
    <div className="mb-2">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-bold card-heading flex items-center gap-2">
          <div className="h-7 w-7 rounded-xl flex items-center justify-center"
            style={{ background: 'rgba(59,130,246,0.15)', border: '1px solid rgba(59,130,246,0.3)' }}>
            <TestTube className="h-4 w-4 text-blue-600 dark:text-blue-300" />
          </div>
          {t.waterQuality}
        </h3>
        <Link href={`/water-quality/${farmId}`} className="text-xs font-semibold text-blue-600 dark:text-cyan-300/80 flex items-center gap-1 hover:gap-2 transition-all">
          View all <ArrowRight className="h-3 w-3" />
        </Link>
      </div>

      <div className="glass-card rounded-[1.5rem] p-5">
        <div className="grid grid-cols-3 gap-3">
          {metrics.map((metric, index) => {
            const statusInfo  = getStatusInfo(metric.status);
            const StatusIcon  = statusInfo.Icon;
            const iconStyle   = getIconStyle(metric.icon);
            return (
              <div key={index}
                className="glass-tile rounded-2xl p-4 flex flex-col items-center gap-2 transition-all duration-200 hover:scale-105">
                <div className="h-10 w-10 rounded-xl flex items-center justify-center"
                  style={{ background: iconStyle.bg, border: `1px solid ${iconStyle.border}` }}>
                  {getIcon(metric.icon)}
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold card-value leading-none">{metric.value}</div>
                  {metric.unit && <div className="text-[10px] card-muted mt-0.5">{metric.unit}</div>}
                  <div className="text-[10px] card-label font-medium mt-1">{metric.name}</div>
                </div>
                <div className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold ${statusInfo.colorClass}`}
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
