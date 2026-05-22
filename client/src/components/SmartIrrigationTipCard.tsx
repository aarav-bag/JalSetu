import { Lightbulb, Check, Sparkles, ArrowRight, Zap } from "lucide-react";
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
        <h3 className="text-sm font-bold card-heading flex items-center gap-2">
          <div className="h-7 w-7 rounded-xl flex items-center justify-center"
            style={{ background: 'rgba(245,158,11,0.18)', border: '1px solid rgba(245,158,11,0.35)' }}>
            <Lightbulb className="h-4 w-4 text-amber-600 dark:text-amber-300" />
          </div>
          {t.irrigationTip}
        </h3>
      </div>

      <div className="glass-card rounded-[1.5rem] p-5">
        {/* AI header */}
        <div className="flex items-center gap-3 mb-4">
          <div className="h-9 w-9 rounded-xl flex items-center justify-center shadow-md flex-shrink-0"
            style={{ background: 'linear-gradient(135deg, rgba(251,191,36,0.9), rgba(249,115,22,0.9))', border: '1px solid rgba(251,191,36,0.4)' }}>
            <Sparkles className="h-5 w-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold card-heading">AI-Powered Suggestion</span>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold text-amber-600 dark:text-amber-300"
                style={{ background: 'rgba(245,158,11,0.12)', border: '1px solid rgba(245,158,11,0.3)' }}>
                <Zap className="h-2.5 w-2.5" />SMART
              </span>
            </div>
            <p className="text-[10px] card-muted">Updated just now</p>
          </div>
        </div>

        {/* Tip box */}
        <div className="rounded-2xl p-4 mb-4"
          style={{ background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.2)' }}>
          <p className="text-sm card-body leading-relaxed">{displayTip}</p>
        </div>

        {/* Action buttons */}
        <div className="flex gap-2">
          <button className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold text-emerald-700 dark:text-white transition-all duration-200 hover:scale-[1.02]"
            style={{ background: 'rgba(16,185,129,0.18)', border: '1px solid rgba(16,185,129,0.35)' }}>
            <Check className="h-4 w-4 text-emerald-600 dark:text-emerald-300" />
            Apply
          </button>
          <Link href={`/irrigation-tips/${farmId}`} className="flex-1">
            <button className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold card-body transition-all duration-200 hover:scale-[1.02] glass-tile">
              {t.viewDetails}
              <ArrowRight className="h-4 w-4" />
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default SmartIrrigationTipCard;
