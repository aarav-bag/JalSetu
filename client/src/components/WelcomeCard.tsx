import { Leaf, Sun, CloudRain, Cloud, TrendingUp, Droplets } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

interface WelcomeCardProps {
  farmerName: string;
  farmStatus: string;
}

const WelcomeCard = ({ farmerName, farmStatus }: WelcomeCardProps) => {
  const { t, language } = useLanguage();
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";

  const date = new Date();
  const options: Intl.DateTimeFormatOptions = { weekday: 'long', month: 'long', day: 'numeric' };
  const formattedDate = date.toLocaleDateString(
    language === 'hi' ? 'hi-IN' : language === 'es' ? 'es-ES' : language === 'fr' ? 'fr-FR' : language === 'de' ? 'de-DE' : language === 'pt' ? 'pt-BR' : 'en-US',
    options
  );

  const WeatherIcon = hour < 12 ? Sun : hour < 18 ? Cloud : CloudRain;

  const quickStats = [
    { label: 'Farm Health', value: '94%', icon: TrendingUp, color: 'text-emerald-400' },
    { label: 'Water Level', value: '78%', icon: Droplets, color: 'text-blue-400' },
    { label: 'Crop Stage', value: 'Grow', icon: Leaf, color: 'text-green-400' },
  ];

  return (
    <div className="mb-5">
      <div className="rounded-[2rem] overflow-hidden bg-gradient-to-br from-blue-600 via-blue-700 to-cyan-600 shadow-2xl relative">
        {/* Subtle mesh overlay */}
        <div className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: 'radial-gradient(circle at 2px 2px, rgba(255,255,255,0.15) 1px, transparent 0)',
            backgroundSize: '20px 20px'
          }}
        ></div>

        {/* Glow blobs */}
        <div className="absolute -top-8 -right-8 w-32 h-32 rounded-full bg-cyan-400/20 blur-2xl"></div>
        <div className="absolute -bottom-6 -left-6 w-24 h-24 rounded-full bg-blue-400/20 blur-2xl"></div>

        <div className="relative z-10 p-6">
          {/* Top row */}
          <div className="flex items-start justify-between mb-5">
            <div>
              <p className="text-blue-200 text-sm font-medium mb-1">{greeting}</p>
              <h2 className="text-2xl font-bold text-white tracking-tight">{farmerName}</h2>
              <p className="text-blue-200 text-xs mt-1">{formattedDate}</p>
            </div>
            <div className="h-14 w-14 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center">
              <WeatherIcon className="h-7 w-7 text-white" />
            </div>
          </div>

          {/* Status pill */}
          <div className="flex items-center gap-2 mb-5">
            <div className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse"></div>
            <span className="text-white/90 text-sm font-medium">{farmStatus}</span>
          </div>

          {/* Quick stats row */}
          <div className="grid grid-cols-3 gap-3">
            {quickStats.map((stat) => (
              <div key={stat.label} className="bg-white/10 backdrop-blur-sm rounded-2xl p-3 border border-white/10 text-center">
                <stat.icon className={`h-4 w-4 ${stat.color} mx-auto mb-1`} />
                <div className="text-white font-bold text-base">{stat.value}</div>
                <div className="text-blue-200 text-[10px] font-medium">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default WelcomeCard;
