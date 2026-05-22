import { Lightbulb, Check, Sparkles, ArrowRight, Zap } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Link } from "wouter";
import { useLanguage } from "@/context/LanguageContext";

interface SmartIrrigationTipCardProps {
  tip: string;
  farmId?: number;
}

const SmartIrrigationTipCard = ({ tip, farmId = 1 }: SmartIrrigationTipCardProps) => {
  const { t } = useLanguage();
  const displayTip = tip || "Based on your soil type and current moisture levels, water your crops early morning (5–7 AM) to minimize evaporation and maximize absorption.";

  return (
    <div className="mb-24">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-base font-bold text-gray-800 dark:text-white flex items-center gap-2">
          <div className="h-7 w-7 rounded-xl bg-amber-50 dark:bg-amber-900/30 flex items-center justify-center">
            <Lightbulb className="h-4 w-4 text-amber-600 dark:text-amber-400" />
          </div>
          {t.irrigationTip}
        </h3>
      </div>

      <Card className="rounded-[1.5rem] border-0 shadow-sm bg-white dark:bg-gray-900 overflow-hidden">
        <CardContent className="p-5">
          {/* AI badge row */}
          <div className="flex items-center gap-2 mb-4">
            <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-sm">
              <Sparkles className="h-5 w-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-sm font-bold text-gray-800 dark:text-white">AI-Powered Suggestion</span>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-400 text-[10px] font-bold">
                  <Zap className="h-2.5 w-2.5" />
                  SMART
                </span>
              </div>
              <p className="text-[10px] text-gray-400 dark:text-gray-500">Updated just now</p>
            </div>
          </div>

          {/* Tip text */}
          <div className="bg-amber-50 dark:bg-amber-900/20 rounded-2xl p-4 mb-4 border border-amber-100 dark:border-amber-800/30">
            <p className="text-sm text-gray-700 dark:text-gray-200 leading-relaxed">{displayTip}</p>
          </div>

          {/* Actions */}
          <div className="flex gap-2">
            <button className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-semibold transition-all duration-200 hover:shadow-md hover:shadow-emerald-200 dark:hover:shadow-emerald-900/40 hover:scale-[1.02]">
              <Check className="h-4 w-4" />
              Apply
            </button>
            <Link href={`/irrigation-tips/${farmId}`} className="flex-1">
              <button className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 text-sm font-semibold transition-all duration-200 hover:scale-[1.02]">
                {t.viewDetails}
                <ArrowRight className="h-4 w-4" />
              </button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SmartIrrigationTipCard;
