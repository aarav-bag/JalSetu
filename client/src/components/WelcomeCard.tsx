import { Leaf, Sun, Cloud, CloudRain } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

interface WelcomeCardProps {
  farmerName: string;
  farmStatus: string;
}

const WelcomeCard = ({ farmerName, farmStatus }: WelcomeCardProps) => {
  const { t, language } = useLanguage();
  
  // Get current time to display appropriate greeting
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";
  
  // Get current date
  const date = new Date();
  const options: Intl.DateTimeFormatOptions = { weekday: 'long', month: 'long', day: 'numeric' };
  const formattedDate = date.toLocaleDateString(
    language === 'en' ? 'en-US' : 
    language === 'es' ? 'es-ES' : 
    language === 'hi' ? 'hi-IN' : 
    language === 'fr' ? 'fr-FR' : 
    language === 'de' ? 'de-DE' : 
    language === 'pt' ? 'pt-BR' : 'en-US', 
    options
  );
  
  return (
    <div className="mb-6">
      <div className="gradient-primary rounded-[2rem] p-6 text-white shadow-2xl enhanced-card water-wave relative overflow-hidden transform transition-all duration-500 hover:scale-[1.02]">
        {/* Enhanced Decorative Elements */}
        <div className="absolute top-0 right-0 w-40 h-40 rounded-full bg-gradient-to-br from-white/15 to-white/5 -mt-20 -mr-20 animate-pulse"></div>
        <div className="absolute bottom-0 left-0 w-32 h-32 rounded-full bg-gradient-to-tr from-white/10 to-transparent -mb-16 -ml-10 animate-pulse" style={{ animationDelay: '1s' }}></div>
        <div className="absolute top-1/2 right-0 w-20 h-20 rounded-full bg-white/5 -mr-10 animate-pulse" style={{ animationDelay: '0.5s' }}></div>
        
        {/* Floating weather icon */}
        <div className="absolute right-6 top-6 opacity-25">
          {hour < 12 ? (
            <Sun className="h-12 w-12 text-yellow-200 floating" />
          ) : hour < 18 ? (
            <Cloud className="h-12 w-12 text-white floating" />
          ) : (
            <CloudRain className="h-12 w-12 text-white floating" />
          )}
        </div>
        
        {/* Sparkle effects */}
        <div className="absolute top-4 left-1/4 w-2 h-2 bg-white/40 rounded-full animate-pulse" style={{ animationDelay: '0.3s' }}></div>
        <div className="absolute bottom-8 right-1/3 w-1.5 h-1.5 bg-white/30 rounded-full animate-pulse" style={{ animationDelay: '1.2s' }}></div>
        
        <div className="flex items-center relative z-10">
          <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-white/25 to-white/10 backdrop-blur-sm flex items-center justify-center mr-5 pulse-effect shadow-lg">
            {hour < 18 ? (
              <Sun className="h-9 w-9 text-white drop-shadow-sm" />
            ) : (
              <Leaf className="h-9 w-9 text-white drop-shadow-sm" />
            )}
          </div>
          <div className="flex-1">
            <p className="text-sm font-semibold text-white/85 tracking-wide">{greeting}</p>
            <h2 className="text-3xl font-bold text-white text-shadow mb-1 tracking-tight">{farmerName}</h2>
            <p className="text-sm text-white/75 mb-3 font-medium">{formattedDate}</p>
            <div className="flex items-center">
              <div className="flex items-center justify-center h-6 w-6 rounded-full bg-gradient-to-r from-white/25 to-white/15 mr-3 shadow-sm">
                <Leaf className="h-3.5 w-3.5 text-white drop-shadow-sm" />
              </div>
              <p className="text-sm font-bold text-white/95 tracking-wide">{farmStatus} ✨</p>
            </div>
          </div>
        </div>
        
        {/* Subtle gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-transparent to-white/5 pointer-events-none"></div>
      </div>
    </div>
  );
};

export default WelcomeCard;
