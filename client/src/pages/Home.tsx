import Header from "@/components/Header";
import WelcomeCard from "@/components/WelcomeCard";
import WaterQualityCard from "@/components/WaterQualityCard";
import SoilMoistureCard from "@/components/SoilMoistureCard";
import WaterPredictionCard from "@/components/WaterPredictionCard";
import SmartIrrigationTipCard from "@/components/SmartIrrigationTipCard";
import BottomNavigation from "@/components/BottomNavigation";
import { useQuery } from "@tanstack/react-query";
import { useTheme } from "@/context/ThemeContext";
import { useAuth } from "@/hooks/useAuth";

// Define the type for farm data
interface FarmData {
  farmer: {
    id: number;
    name: string;
  };
  farm: {
    id: number;
    name?: string;
    status: string;
  };
  waterQuality: Array<{
    name: string;
    value: string | number;
    unit?: string;
    status: string;
    icon: "ph" | "tds" | "temp";
  }>;
  soilMoisture: {
    level: number;
    status: string;
    fields: Array<{
      id: number;
      name: string;
      value: number;
      status: "optimal" | "warning" | "danger";
    }>;
  };
  waterPrediction: {
    message: string;
    advice: string;
    forecast: Array<{
      day: string;
      temperature: string;
      weather: "sunny" | "cloudy" | "rainy" | "partly-cloudy";
      rainChance?: number;
    }>;
  };
  irrigationTip: string;
}

const Home = () => {
  const { darkMode } = useTheme();
  const { data: farmData, isLoading } = useQuery<FarmData>({
    queryKey: ["/api/user-dashboard"],
  });
  
  // Get user info for personalized experience
  const { user } = useAuth();

  return (
    <div className="max-w-md mx-auto min-h-screen flex flex-col relative bg-gradient-to-br from-white via-blue-50/30 to-indigo-50 dark:from-gray-900 dark:via-blue-950/20 dark:to-gray-800 pb-20 transition-all duration-500">
      {/* Enhanced Decorative Background Pattern */}
      <div className="absolute inset-0 overflow-hidden z-0 opacity-60 dark:opacity-30">
        {/* Animated gradient orbs */}
        <div className="absolute -top-20 -right-20 w-64 h-64 rounded-full bg-gradient-to-br from-primary/20 to-blue-400/10 animate-pulse floating"></div>
        <div className="absolute top-32 -left-16 w-48 h-48 rounded-full bg-gradient-to-tr from-emerald-300/15 to-green-400/10 animate-pulse floating" style={{ animationDelay: '1.5s' }}></div>
        <div className="absolute top-10 right-1/3 w-32 h-32 rounded-full bg-gradient-to-bl from-amber-300/15 to-orange-400/10 animate-pulse floating" style={{ animationDelay: '0.8s' }}></div>
        <div className="absolute bottom-1/3 -right-12 w-40 h-40 rounded-full bg-gradient-to-tl from-purple-300/10 to-pink-400/10 animate-pulse floating" style={{ animationDelay: '2s' }}></div>
        <div className="absolute bottom-20 -left-8 w-28 h-28 rounded-full bg-gradient-to-r from-cyan-300/15 to-blue-400/10 animate-pulse floating" style={{ animationDelay: '1.2s' }}></div>
        
        {/* Subtle grid pattern overlay */}
        <div className="absolute inset-0 opacity-[0.02] dark:opacity-[0.05]" 
             style={{ 
               backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(59, 130, 246, 0.3) 1px, transparent 0)',
               backgroundSize: '24px 24px' 
             }}></div>
        
        {/* Light rays effect */}
        <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-1 h-32 bg-gradient-to-b from-primary/20 to-transparent rotate-12 animate-pulse"></div>
        <div className="absolute top-0 left-1/3 transform -translate-x-1/2 w-0.5 h-24 bg-gradient-to-b from-blue-400/15 to-transparent -rotate-12 animate-pulse" style={{ animationDelay: '0.5s' }}></div>
      </div>
      
      <Header />
      
      <main className="flex-1 px-5 pt-2 pb-4 overflow-y-auto z-10">
        {isLoading ? (
          <div className="flex flex-col gap-4 mt-4">
            <div className="h-24 bg-gray-100 dark:bg-gray-800 animate-pulse rounded-2xl"></div>
            <div className="h-40 bg-gray-100 dark:bg-gray-800 animate-pulse rounded-2xl"></div>
            <div className="h-40 bg-gray-100 dark:bg-gray-800 animate-pulse rounded-2xl"></div>
            <div className="h-40 bg-gray-100 dark:bg-gray-800 animate-pulse rounded-2xl"></div>
            <div className="h-40 bg-gray-100 dark:bg-gray-800 animate-pulse rounded-2xl"></div>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="fade-in">
              <WelcomeCard 
                farmerName={user?.firstName || farmData?.farmer.name || "Farmer"} 
                farmStatus={farmData?.farm?.status || "Loading farm status..."} 
              />
            </div>
            
            <div className="scale-in" style={{ animationDelay: '0.1s' }}>
              <WaterQualityCard 
                qualityMetrics={farmData?.waterQuality || []}
                farmId={farmData?.farm?.id}
              />
            </div>
            
            <div className="slide-in-right" style={{ animationDelay: '0.2s' }}>
              <SoilMoistureCard 
                moistureLevel={farmData?.soilMoisture?.level || 0}
                moistureStatus={farmData?.soilMoisture?.status || ""}
                fieldReadings={farmData?.soilMoisture?.fields || []}
                farmId={farmData?.farm?.id}
              />
            </div>
            
            <div className="slide-in-left" style={{ animationDelay: '0.3s' }}>
              <WaterPredictionCard 
                prediction={farmData?.waterPrediction?.message || ""}
                advice={farmData?.waterPrediction?.advice || ""}
                forecast={farmData?.waterPrediction?.forecast || []}
                farmId={farmData?.farm?.id}
              />
            </div>
            
            <div className="slide-in-bottom" style={{ animationDelay: '0.4s' }}>
              <SmartIrrigationTipCard 
                tip={farmData?.irrigationTip || "Based on soil moisture and weather forecast, consider watering your crops tomorrow morning to ensure optimal growth."}
                farmId={farmData?.farm?.id}
              />
            </div>
          </div>
        )}
      </main>
      
      <BottomNavigation />
    </div>
  );
};

export default Home;
