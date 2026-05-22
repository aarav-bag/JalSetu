import { Leaf, Sun, CloudRain, Cloud, TrendingUp, Droplets } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

interface WelcomeCardProps {
  farmerName: string;
  farmStatus: string;
}

const WelcomeCard = ({ farmerName, farmStatus }: WelcomeCardProps) => {
  const { language } = useLanguage();
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
    { label: 'Farm Health', value: '94%', icon: TrendingUp, color: 'text-emerald-600 dark:text-emerald-300' },
    { label: 'Water Level', value: '78%', icon: Droplets, color: 'text-blue-600 dark:text-cyan-300' },
    { label: 'Crop Stage', value: 'Grow', icon: Leaf, color: 'text-green-600 dark:text-green-300' },
  ];

  return (
    <div className="mb-2">
      <div className="glass-hero rounded-[1.75rem] overflow-hidden relative">
        {/* Shine streak */}
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/60 to-transparent" />
        <div className="absolute top-0 left-[10%] w-[40%] h-16 bg-white/10 rounded-full blur-2xl" />

        <div className="relative z-10 p-6">
          {/* Top row */}
          <div className="flex items-start justify-between mb-5">
            <div>
              <p className="text-sm font-medium text-gray-700 dark:text-white/60 mb-1">{greeting}</p>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">{farmerName}</h2>
              <p className="text-xs text-gray-500 dark:text-white/40 mt-1">{formattedDate}</p>
            </div>
            <div className="h-14 w-14 rounded-2xl glass-tile flex items-center justify-center">
              <WeatherIcon className="h-7 w-7 text-blue-600 dark:text-white" />
            </div>
          </div>

          {/* Status pill */}
          <div className="flex items-center gap-2 mb-5">
            <div className="h-2 w-2 rounded-full bg-emerald-500 shadow-sm shadow-emerald-500/60 animate-pulse" />
            <span className="text-sm font-semibold text-gray-700 dark:text-white/80">{farmStatus}</span>
          </div>

          {/* Quick stats */}
          <div className="grid grid-cols-3 gap-3">
            {quickStats.map((stat) => (
              <div key={stat.label} className="glass-tile rounded-2xl p-3 text-center">
                <stat.icon className={`h-4 w-4 ${stat.color} mx-auto mb-1`} />
                <div className="text-gray-900 dark:text-white font-bold text-base">{stat.value}</div>
                <div className="text-gray-500 dark:text-white/50 text-[10px] font-medium">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default WelcomeCard;
