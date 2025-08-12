import { Lightbulb, Check, Sparkles, ArrowRight, Droplet, Clock, Zap } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { useLanguage } from "@/context/LanguageContext";

interface SmartIrrigationTipCardProps {
  tip: string;
  farmId?: number;
}

const SmartIrrigationTipCard = ({ 
  tip,
  farmId = 1
}: SmartIrrigationTipCardProps) => {
  const { t } = useLanguage();
  // Default tip if none is provided
  const displayTip = tip || "Based on your soil type and current moisture levels, water your crops early morning (5-7 AM) to minimize evaporation and maximize absorption.";
  return (
    <div className="mb-6">
      <h3 className="text-xl font-bold mb-4 flex items-center gradient-text">
        <div className="rounded-2xl bg-gradient-to-r from-amber-100 to-yellow-100 dark:from-amber-900/30 dark:to-yellow-900/30 p-2.5 mr-3 shadow-lg">
          <Lightbulb className="h-5 w-5 text-amber-600 dark:text-amber-400" />
        </div>
        {t.irrigationTip}
      </h3>
      
      <Card className="bg-gradient-to-br from-amber-500 via-orange-500 to-amber-600 rounded-[2rem] shadow-2xl overflow-hidden border-0 enhanced-card hover:shadow-3xl transition-all duration-500 hover:scale-[1.02]">
        <CardContent className="p-6 relative">
          {/* Enhanced decorative elements */}
          <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-yellow-300/30 to-amber-300/20 rounded-full -mr-20 -mt-20 animate-pulse"></div>
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-gradient-to-tr from-orange-300/20 to-yellow-300/15 rounded-full -ml-16 -mb-16 animate-pulse" style={{ animationDelay: '1s' }}></div>
          <div className="absolute top-6 right-6 opacity-25 floating" style={{ animationDelay: '0.5s' }}>
            <Droplet className="h-14 w-14 text-yellow-200" />
          </div>
          <div className="absolute bottom-6 left-6 opacity-15 floating" style={{ animationDelay: '1.2s' }}>
            <Clock className="h-12 w-12 text-amber-200" />
          </div>
          
          {/* Sparkle effects */}
          <div className="absolute top-8 left-1/3 w-2 h-2 bg-yellow-200/60 rounded-full animate-pulse" style={{ animationDelay: '0.8s' }}></div>
          <div className="absolute bottom-10 right-1/4 w-1.5 h-1.5 bg-yellow-100/50 rounded-full animate-pulse" style={{ animationDelay: '1.5s' }}></div>
          
          <div className="flex relative z-10">
            <div className="mr-4 mt-1">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-500 to-amber-600 shadow-md border border-amber-400 flex items-center justify-center pulse-effect">
                <Sparkles className="h-7 w-7 text-white" />
              </div>
            </div>
            
            <div className="flex-1">
              <div className="flex items-center">
                <h4 className="font-bold text-white text-lg text-shadow">AI-Powered Suggestion</h4>
                <div className="ml-2 flex-shrink-0 h-5 px-2 rounded-full bg-amber-200 text-amber-800 text-[10px] font-bold flex items-center shadow-sm">
                  <Zap className="h-2.5 w-2.5 mr-0.5" />
                  SMART
                </div>
              </div>
              <p className="text-sm text-white/90 mt-2 mb-4">{displayTip}</p>
              
              <div className="flex flex-wrap gap-2">
                <Button 
                  variant="outline" 
                  className="rounded-full text-xs font-semibold bg-white text-amber-700 border-0 shadow-md hover:shadow-lg hover:bg-amber-50 hover:text-amber-800 transition-all"
                >
                  <Check className="h-3.5 w-3.5 mr-1.5" />
                  Apply suggestion
                </Button>
                
                <Link href={`/irrigation-tips/${farmId}`}>
                  <Button 
                    variant="outline" 
                    className="rounded-full text-xs font-semibold text-white bg-amber-600/30 backdrop-blur-sm border border-white/20 shadow-sm hover:bg-white/20 hover:text-white transition-all"
                  >
                    {t.viewDetails}
                    <ArrowRight className="h-3 w-3 ml-1.5" />
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SmartIrrigationTipCard;
