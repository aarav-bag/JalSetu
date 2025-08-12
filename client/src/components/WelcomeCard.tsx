import { Leaf, Sun, Cloud, CloudRain, Sunrise, Moon, TreePine, Sparkles, Heart, Star } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { Card, CardContent } from "@/components/ui/card";

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

  const getGradientClass = () => {
    if (hour < 12) return "from-orange-500 via-pink-500 to-purple-500";
    if (hour < 18) return "from-blue-500 via-purple-500 to-pink-500";
    return "from-indigo-600 via-purple-600 to-pink-500";
  };

  const getGreetingIcon = () => {
    if (hour < 12) return <Sunrise className="h-8 w-8 text-white" />;
    if (hour < 18) return <Sun className="h-8 w-8 text-white" />;
    return <Moon className="h-8 w-8 text-white" />;
  };
  
  return (
    <div className="mb-6">
      <Card className={`relative overflow-hidden rounded-[2.5rem] shadow-2xl border-0 enhanced-card hover:shadow-3xl transition-all duration-700 hover:scale-[1.02] bg-gradient-to-br ${getGradientClass()}`}>
        <CardContent className="p-8 text-white relative">
          {/* Spectacular background elements */}
          <div className="absolute -top-24 -right-24 w-56 h-56 rounded-full bg-gradient-to-br from-white/20 via-white/10 to-transparent animate-pulse blur-xl"></div>
          <div className="absolute -bottom-20 -left-20 w-48 h-48 rounded-full bg-gradient-to-tr from-white/15 via-white/8 to-transparent animate-pulse blur-lg" style={{ animationDelay: '2s' }}></div>
          <div className="absolute top-1/2 -right-16 w-32 h-32 rounded-full bg-white/10 animate-pulse blur-md" style={{ animationDelay: '1s' }}></div>
          
          {/* Floating decorative icons */}
          <div className="absolute right-8 top-8 opacity-20 floating" style={{ animationDelay: '1.2s' }}>
            <TreePine className="h-16 w-16 text-white" />
          </div>
          <div className="absolute left-8 bottom-8 opacity-15 floating" style={{ animationDelay: '0.8s' }}>
            <Leaf className="h-12 w-12 text-white" />
          </div>
          
          {/* Magical sparkles */}
          <div className="absolute top-6 left-1/3 opacity-60 floating" style={{ animationDelay: '0.5s' }}>
            <Sparkles className="h-4 w-4 text-white" />
          </div>
          <div className="absolute bottom-12 right-1/4 opacity-50 floating" style={{ animationDelay: '1.8s' }}>
            <Star className="h-3 w-3 text-white" />
          </div>
          <div className="absolute top-16 right-16 w-2 h-2 bg-white/60 rounded-full animate-pulse" style={{ animationDelay: '0.7s' }}></div>
          <div className="absolute bottom-20 left-20 w-1.5 h-1.5 bg-white/50 rounded-full animate-pulse" style={{ animationDelay: '2.2s' }}></div>
          <div className="absolute top-20 left-16 w-1 h-1 bg-white/40 rounded-full animate-pulse" style={{ animationDelay: '1.5s' }}></div>
          
          {/* Content */}
          <div className="relative z-10">
            {/* Header with greeting */}
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center">
                <div className="p-4 rounded-2xl bg-white/20 backdrop-blur-sm mr-5 pulse-effect shadow-xl">
                  {getGreetingIcon()}
                </div>
                <div>
                  <p className="text-sm font-semibold text-white/90 tracking-wider uppercase">{greeting}</p>
                  <h2 className="text-4xl font-bold text-white text-shadow-lg mb-1 tracking-tight">{farmerName}!</h2>
                  <p className="text-sm text-white/80 font-medium">{formattedDate}</p>
                </div>
              </div>
              
              {/* Status indicator */}
              <div className="flex flex-col items-end">
                <div className="flex items-center space-x-2 mb-2">
                  <div className="w-3 h-3 rounded-full bg-green-400 shadow-lg pulse-effect"></div>
                  <div className="w-2 h-2 rounded-full bg-green-300 animate-pulse" style={{ animationDelay: '0.5s' }}></div>
                  <div className="w-1.5 h-1.5 rounded-full bg-green-200 animate-pulse" style={{ animationDelay: '1s' }}></div>
                </div>
                <span className="text-xs text-white/75 font-semibold">ONLINE</span>
              </div>
            </div>
            
            {/* Farm status section */}
            <div className="bg-white/15 backdrop-blur-md rounded-2xl p-6 border border-white/20 shadow-2xl">
              <div className="flex items-center">
                <div className="mr-5">
                  <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-white/25 to-white/10 flex items-center justify-center shadow-lg">
                    <Heart className="h-7 w-7 text-white" />
                  </div>
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-white text-xl mb-2 flex items-center">
                    Farm Health Status
                    <Sparkles className="h-4 w-4 ml-2 text-white/80" />
                  </h3>
                  <p className="text-white/90 leading-relaxed text-sm mb-4">
                    {farmStatus}
                  </p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="w-2.5 h-2.5 rounded-full bg-green-400 mr-3 pulse-effect"></div>
                      <span className="text-xs text-white/85 font-bold tracking-wider">ALL SYSTEMS OPERATIONAL</span>
                    </div>
                    <div className="text-xs text-white/70">
                      Updated: {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Magical gradient overlays */}
          <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-white/10 pointer-events-none"></div>
          <div className="absolute inset-0 bg-gradient-to-bl from-transparent via-transparent to-white/5 pointer-events-none"></div>
        </CardContent>
      </Card>
    </div>
  );
};

export default WelcomeCard;
