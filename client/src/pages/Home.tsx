import Header from "@/components/Header";
import WelcomeCard from "@/components/WelcomeCard";
import WaterQualityCard from "@/components/WaterQualityCard";
import SoilMoistureCard from "@/components/SoilMoistureCard";
import WaterPredictionCard from "@/components/WaterPredictionCard";
import SmartIrrigationTipCard from "@/components/SmartIrrigationTipCard";
import BottomNavigation from "@/components/BottomNavigation";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";

interface FarmData {
  farmer: { id: number; name: string };
  farm: { id: number; name?: string; status: string };
  waterQuality: Array<{ name: string; value: string | number; unit?: string; status: string; icon: "ph" | "tds" | "temp" }>;
  soilMoisture: { level: number; status: string; fields: Array<{ id: number; name: string; value: number; status: "optimal" | "warning" | "danger" }> };
  waterPrediction: { message: string; advice: string; forecast: Array<{ day: string; temperature: string; weather: "sunny" | "cloudy" | "rainy" | "partly-cloudy"; rainChance?: number }> };
  irrigationTip: string;
}

const SkeletonCard = ({ height = "h-40" }: { height?: string }) => (
  <div className={`${height} bg-white dark:bg-gray-900 animate-pulse rounded-[1.5rem] shadow-sm`}>
    <div className="p-5 space-y-3">
      <div className="h-3 bg-gray-100 dark:bg-gray-800 rounded-full w-1/3"></div>
      <div className="h-3 bg-gray-100 dark:bg-gray-800 rounded-full w-2/3"></div>
      <div className="h-3 bg-gray-100 dark:bg-gray-800 rounded-full w-1/2"></div>
    </div>
  </div>
);

const Home = () => {
  const { data: farmData, isLoading } = useQuery<FarmData>({ queryKey: ["/api/user-dashboard"] });
  const { user } = useAuth();

  return (
    <div className="max-w-md mx-auto min-h-screen flex flex-col bg-gray-50 dark:bg-gray-950 transition-colors duration-300">
      <Header />

      <main className="flex-1 px-4 pt-1 pb-4 overflow-y-auto">
        {isLoading ? (
          <div className="space-y-4 mt-2">
            <SkeletonCard height="h-52" />
            <SkeletonCard height="h-44" />
            <SkeletonCard height="h-52" />
            <SkeletonCard height="h-48" />
            <SkeletonCard height="h-44" />
          </div>
        ) : (
          <div className="space-y-4 mt-2">
            <WelcomeCard
              farmerName={user?.firstName || farmData?.farmer.name || "Farmer"}
              farmStatus={farmData?.farm?.status || "Farm Active"}
            />
            <WaterQualityCard
              qualityMetrics={farmData?.waterQuality || []}
              farmId={farmData?.farm?.id}
            />
            <SoilMoistureCard
              moistureLevel={farmData?.soilMoisture?.level || 0}
              moistureStatus={farmData?.soilMoisture?.status || ""}
              fieldReadings={farmData?.soilMoisture?.fields || []}
              farmId={farmData?.farm?.id}
            />
            <WaterPredictionCard
              prediction={farmData?.waterPrediction?.message || ""}
              advice={farmData?.waterPrediction?.advice || ""}
              forecast={farmData?.waterPrediction?.forecast || []}
              farmId={farmData?.farm?.id}
            />
            <SmartIrrigationTipCard
              tip={farmData?.irrigationTip || "Based on soil moisture and weather forecast, consider watering your crops tomorrow morning for optimal growth."}
              farmId={farmData?.farm?.id}
            />
          </div>
        )}
      </main>

      <BottomNavigation />
    </div>
  );
};

export default Home;
