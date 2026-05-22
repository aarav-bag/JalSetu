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
    { label: 'Farm Health', value: '94%', icon: TrendingUp, color: 'text-emerald-300' },
    { label: 'Water Level', value: '78%', icon: Droplets, color: 'text-cyan-300' },
    { label: 'Crop Stage', value: 'Grow', icon: Leaf, color: 'text-green-300' },
  ];

  return (
    <div className="mb-2">
      <div className="rounded-[1.75rem] overflow-hidden relative"
        style={{
          background: 'linear-gradient(135deg, rgba(59,130,246,0.45) 0%, rgba(6,182,212,0.35) 50%, rgba(99,102,241,0.4) 100%)',
          backdropFilter: 'blur(24px)',
          WebkitBackdropFilter: 'blur(24px)',
          border: '1px solid rgba(255,255,255,0.25)',
          boxShadow: '0 25px 50px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.2)'
        }}
      >
        {/* Shine streak */}
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/50 to-transparent"></div>
        <div className="absolute top-0 left-[10%] w-[40%] h-16 bg-white/5 rounded-full blur-2xl"></div>

        <div className="relative z-10 p-6">
          {/* Top row */}
          <div className="flex items-start justify-between mb-5">
            <div>
              <p className="text-white/60 text-sm font-medium mb-1">{greeting}</p>
              <h2 className="text-2xl font-bold text-white tracking-tight">{farmerName}</h2>
              <p className="text-white/50 text-xs mt-1">{formattedDate}</p>
            </div>
            <div className="h-14 w-14 rounded-2xl flex items-center justify-center"
              style={{ background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.25)' }}>
              <WeatherIcon className="h-7 w-7 text-white" />
            </div>
          </div>

          {/* Status pill */}
          <div className="flex items-center gap-2 mb-5">
            <div className="h-2 w-2 rounded-full bg-emerald-400 shadow-sm shadow-emerald-400/60 animate-pulse"></div>
            <span className="text-white/80 text-sm font-medium">{farmStatus}</span>
          </div>

          {/* Quick stats */}
          <div className="grid grid-cols-3 gap-3">
            {quickStats.map((stat) => (
              <div key={stat.label} className="rounded-2xl p-3 text-center"
                style={{ background: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.15)' }}>
                <stat.icon className={`h-4 w-4 ${stat.color} mx-auto mb-1`} />
                <div className="text-white font-bold text-base">{stat.value}</div>
                <div className="text-white/50 text-[10px] font-medium">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default WelcomeCard;
