import { Shrub, DropletIcon, ArrowRight, Sprout, Flower } from "lucide-react";
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
  // Ensure moistureLevel is not 0, default to 68 if it is
  const displayLevel = moistureLevel > 0 ? moistureLevel : 68;
  
  // Calculate the stroke-dashoffset based on the moisture level
  const calculateOffset = (percent: number) => {
    const circumference = 2 * Math.PI * 40;
    return circumference - (percent / 100) * circumference;
  };

  const getStatusClass = (status: string) => {
    switch (status) {
      case "optimal":
        return "bg-green-50 text-green-600 border-green-100";
      case "warning":
        return "bg-amber-50 text-amber-600 border-amber-200";
      case "danger":
        return "bg-red-50 text-red-600 border-red-200";
      default:
        return "bg-green-50 text-green-600 border-green-100";
    }
  };

  const getMoistureColor = (level: number) => {
    if (level >= 60) return "text-green-500";
    if (level >= 40) return "text-amber-500";
    return "text-red-500";
  };

  // Default field readings if none provided
  const defaultFieldReadings: FieldReading[] = [
    { id: 1, name: "Field 1", value: 68, status: "optimal" },
    { id: 2, name: "Field 2", value: 45, status: "warning" }
  ];

  const readings = fieldReadings.length ? fieldReadings : defaultFieldReadings;

  return (
    <div className="mb-5">
      <h3 className="text-xl font-bold mb-4 flex items-center gradient-text">
        <div className="rounded-2xl bg-gradient-to-r from-green-100 to-emerald-100 dark:from-green-900/30 dark:to-emerald-900/30 p-2.5 mr-3 shadow-lg">
          <Shrub className="h-5 w-5 text-green-600 dark:text-green-400" />
        </div>
        {t.soilMoisture}
      </h3>
      
      <Card className="glass-effect rounded-[2rem] shadow-2xl overflow-hidden border-0 enhanced-card hover:shadow-3xl transition-all duration-500 hover:scale-[1.02]">
        <CardContent className="p-6 relative">
          {/* Enhanced decorative elements */}
          <div className="absolute -bottom-8 -left-8 opacity-8">
            <Sprout className="h-24 w-24 text-green-500" />
          </div>
          <div className="absolute top-4 right-4 opacity-15">
            <Flower className="h-12 w-12 text-green-500 floating" />
          </div>
          <div className="absolute bottom-4 right-6 opacity-10">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-green-400 to-emerald-400 animate-pulse"></div>
          </div>
          
          <div className="flex items-center">
            <div className="relative">
              <div className="w-[140px] h-[140px] relative flex items-center justify-center">
                {/* Enhanced background gradient */}
                <div className="absolute inset-0 rounded-full bg-gradient-to-br from-green-50 via-emerald-50 to-green-100 dark:from-green-900/30 dark:via-emerald-900/20 dark:to-green-800/30 shadow-lg"></div>
                
                <svg className="w-[140px] h-[140px] transform -rotate-90 drop-shadow-md" viewBox="0 0 100 100">
                  <circle 
                    className="text-gray-100 dark:text-gray-700" 
                    strokeWidth="8" 
                    stroke="currentColor" 
                    fill="transparent" 
                    r="40" 
                    cx="50" 
                    cy="50"
                  />
                  <circle 
                    className={`${getMoistureColor(displayLevel)}`}
                    strokeWidth="10" 
                    strokeLinecap="round" 
                    stroke="currentColor" 
                    fill="transparent" 
                    r="40" 
                    cx="50" 
                    cy="50"
                    strokeDasharray="251.2"
                    strokeDashoffset={calculateOffset(displayLevel)}
                    filter="drop-shadow(0 1px 2px rgb(0 0 0 / 0.1))"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className={`text-4xl font-bold ${getMoistureColor(displayLevel)} text-shadow`}>
                    {displayLevel}%
                  </span>
                  <span className="text-xs text-gray-500 dark:text-gray-400 font-semibold mt-2 tracking-wide">MOISTURE</span>
                </div>
              </div>
              <div className="absolute top-0 left-0 w-full h-full flex items-center justify-center pointer-events-none">
                <div className="absolute -right-2 top-1/4 opacity-30">
                  <DropletIcon className={`h-6 w-6 ${getMoistureColor(displayLevel)} floating`} style={{ animationDelay: '0.5s' }} />
                </div>
                <div className="absolute -left-2 bottom-1/4 opacity-20">
                  <DropletIcon className={`h-10 w-10 ${getMoistureColor(displayLevel)} floating`} style={{ animationDelay: '1s' }} />
                </div>
              </div>
            </div>
            
            <div className="flex-1 ml-5">
              <h4 className="font-bold text-gray-800 dark:text-gray-200 text-lg">{moistureStatus}</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                {"Current soil moisture is optimal for your crops."}
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                {readings.map((field, index) => (
                  <span 
                    key={field.id}
                    className={`px-3 py-1.5 rounded-full text-xs border ${getStatusClass(field.status)} font-medium shadow-sm`}
                    style={{ animationDelay: `${index * 0.15}s` }}
                  >
                    {field.name}: {field.value}%
                  </span>
                ))}
              </div>
              
              <div className="mt-6 text-right">
                <Link href={`/soil-moisture/${farmId}`} className="inline-flex items-center justify-center px-6 py-3 rounded-2xl bg-gradient-to-r from-green-500 to-emerald-500 text-white text-sm font-semibold transition-all duration-300 hover:from-green-600 hover:to-emerald-600 shadow-lg hover:shadow-xl hover:scale-105">
                  {t.viewDetails}
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Link>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SoilMoistureCard;