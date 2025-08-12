import { TestTube, Droplet, Scale, Thermometer, ArrowRight, Waves } from "lucide-react";
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
      case "ph":
        return <Droplet className="h-5 w-5 text-white" />;
      case "tds":
        return <Scale className="h-5 w-5 text-white" />;
      case "temp":
        return <Thermometer className="h-5 w-5 text-white" />;
      default:
        return <Droplet className="h-5 w-5 text-white" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "good":
        return "text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/30";
      case "warm":
      case "warning":
        return "text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/30";
      case "bad":
      case "danger":
        return "text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/30";
      default:
        return "text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-800";
    }
  };

  // Default metrics if none provided
  const defaultMetrics: QualityMetric[] = [
    { name: "pH Level", value: "6.8", status: "Good", icon: "ph" },
    { name: "TDS", value: "320", unit: "ppm", status: "Good", icon: "tds" },
    { name: "Temp", value: "28°C", status: "Warm", icon: "temp" }
  ];

  const metrics = qualityMetrics.length ? qualityMetrics : defaultMetrics;

  return (
    <div className="mb-5">
      <h3 className="text-xl font-bold mb-4 flex items-center gradient-text">
        <div className="rounded-2xl bg-gradient-to-r from-blue-100 to-cyan-100 dark:from-blue-900/30 dark:to-cyan-900/30 p-2.5 mr-3 shadow-lg">
          <TestTube className="h-5 w-5 text-blue-600 dark:text-blue-400" />
        </div>
        {t.waterQuality}
      </h3>
      
      <Card className="glass-effect rounded-[2rem] shadow-2xl overflow-hidden border-0 enhanced-card hover:shadow-3xl transition-all duration-500 hover:scale-[1.02]">
        <CardContent className="p-6 relative">
          {/* Enhanced decorative elements */}
          <div className="absolute -bottom-8 -right-8 opacity-5">
            <Waves className="h-32 w-32 text-blue-500" />
          </div>
          <div className="absolute top-2 right-4 opacity-10">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-400 to-cyan-400 animate-pulse"></div>
          </div>
          
          <div className="grid grid-cols-3 gap-4">
            {metrics.map((metric, index) => (
              <div 
                key={index} 
                className="bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-750 rounded-2xl p-4 flex flex-col items-center justify-center shadow-lg border border-white/50 dark:border-gray-600/30 hover:shadow-xl transition-all duration-300 hover:scale-105 scale-in"
                style={{ animationDelay: `${index * 0.15}s` }}
              >
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center mb-3 shadow-lg pulse-effect">
                  {getIcon(metric.icon)}
                </div>
                <span className="text-xs text-gray-600 dark:text-gray-300 font-semibold tracking-wide">{metric.name}</span>
                <span className="font-bold text-xl text-gray-800 dark:text-white mt-1">{metric.value}</span>
                <span className={`text-xs px-3 py-1 rounded-full mt-2 font-semibold shadow-sm ${getStatusColor(metric.status)}`}>
                  {metric.unit || metric.status}
                </span>
              </div>
            ))}
          </div>
          
          <div className="mt-6 text-right">
            <Link href={`/water-quality/${farmId}`} className="inline-flex items-center justify-center px-6 py-3 rounded-2xl bg-gradient-to-r from-blue-500 to-cyan-500 text-white text-sm font-semibold transition-all duration-300 hover:from-blue-600 hover:to-cyan-600 shadow-lg hover:shadow-xl hover:scale-105">
              {t.viewDetails}
              <ArrowRight className="h-4 w-4 ml-2" />
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default WaterQualityCard;
