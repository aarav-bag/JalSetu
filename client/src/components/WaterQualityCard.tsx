import { TestTube, Droplet, Scale, Thermometer, ArrowRight, CheckCircle2, AlertTriangle, XCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
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

  const getIconColors = (icon: string) => {
    switch (icon) {
      case "ph": return "bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400";
      case "tds": return "bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400";
      case "temp": return "bg-orange-50 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400";
      default: return "bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400";
    }
  };

  const getStatusInfo = (status: string) => {
    const s = status.toLowerCase();
    if (s === "good") return { icon: CheckCircle2, color: "text-emerald-500", bg: "bg-emerald-50 dark:bg-emerald-900/30", label: "Good" };
    if (s === "warm" || s === "warning") return { icon: AlertTriangle, color: "text-amber-500", bg: "bg-amber-50 dark:bg-amber-900/30", label: "Warning" };
    if (s === "bad" || s === "danger") return { icon: XCircle, color: "text-red-500", bg: "bg-red-50 dark:bg-red-900/30", label: "Alert" };
    return { icon: CheckCircle2, color: "text-gray-400", bg: "bg-gray-50 dark:bg-gray-800", label: status };
  };

  const defaultMetrics: QualityMetric[] = [
    { name: "pH Level", value: "6.8", status: "Good", icon: "ph" },
    { name: "TDS", value: "320", unit: "ppm", status: "Good", icon: "tds" },
    { name: "Temp", value: "28°C", status: "Warm", icon: "temp" },
  ];

  const metrics = qualityMetrics.length ? qualityMetrics : defaultMetrics;

  return (
    <div className="mb-5">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-base font-bold text-gray-800 dark:text-white flex items-center gap-2">
          <div className="h-7 w-7 rounded-xl bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center">
            <TestTube className="h-4 w-4 text-blue-600 dark:text-blue-400" />
          </div>
          {t.waterQuality}
        </h3>
        <Link href={`/water-quality/${farmId}`} className="text-xs font-semibold text-blue-500 dark:text-blue-400 flex items-center gap-1 hover:gap-2 transition-all">
          View all <ArrowRight className="h-3 w-3" />
        </Link>
      </div>

      <Card className="rounded-[1.5rem] border-0 shadow-sm bg-white dark:bg-gray-900 overflow-hidden">
        <CardContent className="p-5">
          <div className="grid grid-cols-3 gap-3">
            {metrics.map((metric, index) => {
              const statusInfo = getStatusInfo(metric.status);
              const StatusIcon = statusInfo.icon;
              return (
                <div
                  key={index}
                  className="rounded-2xl p-4 bg-gray-50 dark:bg-gray-800/60 flex flex-col items-center gap-2 border border-gray-100 dark:border-gray-700/50 hover:border-blue-200 dark:hover:border-blue-700/50 transition-all duration-200 hover:shadow-sm"
                >
                  <div className={`h-10 w-10 rounded-xl flex items-center justify-center ${getIconColors(metric.icon)}`}>
                    {getIcon(metric.icon)}
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-bold text-gray-800 dark:text-white leading-none">{metric.value}</div>
                    {metric.unit && <div className="text-[10px] text-gray-400 mt-0.5">{metric.unit}</div>}
                    <div className="text-[10px] text-gray-500 dark:text-gray-400 font-medium mt-1">{metric.name}</div>
                  </div>
                  <div className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold ${statusInfo.bg} ${statusInfo.color}`}>
                    <StatusIcon className="h-2.5 w-2.5" />
                    {statusInfo.label}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default WaterQualityCard;
