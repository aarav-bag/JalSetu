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
        <h3 className="text-sm font-bold text-white/90 flex items-center gap-2">
          <div className="h-7 w-7 rounded-xl flex items-center justify-center"
            style={{ background: 'rgba(245,158,11,0.25)', border: '1px solid rgba(245,158,11,0.4)' }}>
            <Lightbulb className="h-4 w-4 text-amber-300" />
          </div>
          {t.irrigationTip}
        </h3>
      </div>

      <div className="rounded-[1.5rem] p-5"
        style={{
          background: 'rgba(255,255,255,0.07)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          border: '1px solid rgba(255,255,255,0.15)',
          boxShadow: '0 8px 32px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.1)'
        }}
      >
        {/* AI header */}
        <div className="flex items-center gap-2 mb-4">
          <div className="h-9 w-9 rounded-xl flex items-center justify-center shadow-lg shadow-amber-500/20"
            style={{ background: 'linear-gradient(135deg, rgba(251,191,36,0.8), rgba(249,115,22,0.8))', border: '1px solid rgba(251,191,36,0.4)' }}>
            <Sparkles className="h-5 w-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-sm font-bold text-white/90">AI-Powered Suggestion</span>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold text-amber-300"
                style={{ background: 'rgba(245,158,11,0.15)', border: '1px solid rgba(245,158,11,0.3)' }}>
                <Zap className="h-2.5 w-2.5" />SMART
              </span>
            </div>
            <p className="text-[10px] text-white/40">Updated just now</p>
          </div>
        </div>

        {/* Tip box */}
        <div className="rounded-2xl p-4 mb-4"
          style={{ background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.2)' }}>
          <p className="text-sm text-white/80 leading-relaxed">{displayTip}</p>
        </div>

        {/* Action buttons */}
        <div className="flex gap-2">
          <button className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold text-white transition-all duration-200 hover:scale-[1.02]"
            style={{ background: 'rgba(16,185,129,0.3)', border: '1px solid rgba(16,185,129,0.4)', backdropFilter: 'blur(8px)' }}>
            <Check className="h-4 w-4 text-emerald-300" />
            <span>Apply</span>
          </button>
          <Link href={`/irrigation-tips/${farmId}`} className="flex-1">
            <button className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold text-white/70 transition-all duration-200 hover:scale-[1.02] hover:text-white/90"
              style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', backdropFilter: 'blur(8px)' }}>
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
