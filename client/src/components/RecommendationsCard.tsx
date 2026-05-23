import { useQuery } from "@tanstack/react-query";
import {
  Brain, AlertTriangle, CheckCircle2, Info, ChevronRight,
  FlaskConical, Droplet, Droplets, Thermometer, CloudRain,
  Sun, Clock, Leaf, Zap, RefreshCw, Loader2
} from "lucide-react";
import { useState } from "react";
import { Link } from "wouter";

interface Recommendation {
  id: string;
  priority: "high" | "medium" | "low";
  category: string;
  title: string;
  description: string;
  action: string;
  icon: string;
  metric?: string;
  confidence: number;
}

interface RecommendationsData {
  recommendations: Recommendation[];
  generatedAt: string;
}

interface Props { farmId?: number }

const iconMap: Record<string, React.ElementType> = {
  "alert-triangle": AlertTriangle,
  "check-circle": CheckCircle2,
  "flask-conical": FlaskConical,
  "droplet": Droplet,
  "droplets": Droplets,
  "thermometer": Thermometer,
  "cloud-rain": CloudRain,
  "cloud": CloudRain,
  "sun": Sun,
  "clock": Clock,
  "leaf": Leaf,
};

const priorityStyles = {
  high: {
    card:   "rgba(239,68,68,0.08)",
    border: "rgba(239,68,68,0.22)",
    badge:  "text-red-600 dark:text-red-300",
    badgeBg:"rgba(239,68,68,0.12)",
    badgeBr:"rgba(239,68,68,0.28)",
    icon:   "text-red-500 dark:text-red-300",
    iconBg: "rgba(239,68,68,0.14)",
    label:  "Critical",
  },
  medium: {
    card:   "rgba(245,158,11,0.08)",
    border: "rgba(245,158,11,0.22)",
    badge:  "text-amber-600 dark:text-amber-300",
    badgeBg:"rgba(245,158,11,0.12)",
    badgeBr:"rgba(245,158,11,0.28)",
    icon:   "text-amber-500 dark:text-amber-300",
    iconBg: "rgba(245,158,11,0.14)",
    label:  "Advisory",
  },
  low: {
    card:   "rgba(16,185,129,0.06)",
    border: "rgba(16,185,129,0.18)",
    badge:  "text-emerald-600 dark:text-emerald-300",
    badgeBg:"rgba(16,185,129,0.10)",
    badgeBr:"rgba(16,185,129,0.25)",
    icon:   "text-emerald-500 dark:text-emerald-300",
    iconBg: "rgba(16,185,129,0.14)",
    label:  "Good",
  },
};

export default function RecommendationsCard({ farmId = 1 }: Props) {
  const [expanded, setExpanded] = useState<string | null>(null);
  const [showAll, setShowAll] = useState(false);

  const { data, isLoading, refetch, dataUpdatedAt } = useQuery<RecommendationsData>({
    queryKey: ["/api/farm", farmId, "recommendations"],
    queryFn: async () => {
      const res = await fetch(`/api/farm/${farmId}/recommendations`);
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
    staleTime: 1000 * 60 * 10,
    retry: 1,
  });

  const all = data?.recommendations ?? [];
  const visible = showAll ? all : all.slice(0, 3);
  const highCount = all.filter(r => r.priority === "high").length;

  const updatedStr = dataUpdatedAt
    ? new Date(dataUpdatedAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    : null;

  return (
    <div className="mb-2">
      {/* Section header */}
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-bold card-heading flex items-center gap-2">
          <div className="h-7 w-7 rounded-xl flex items-center justify-center"
            style={{ background: "rgba(139,92,246,0.18)", border: "1px solid rgba(139,92,246,0.35)" }}>
            <Brain className="h-4 w-4 text-violet-600 dark:text-violet-300" />
          </div>
          AI Recommendations
          {highCount > 0 && (
            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full text-red-600 dark:text-red-300"
              style={{ background: "rgba(239,68,68,0.12)", border: "1px solid rgba(239,68,68,0.25)" }}>
              {highCount} urgent
            </span>
          )}
        </h3>
        <button onClick={() => refetch()}
          className="h-7 w-7 rounded-xl glass-tile flex items-center justify-center transition-all hover:scale-110">
          <RefreshCw className="h-3.5 w-3.5 card-label" />
        </button>
      </div>

      <div className="glass-card rounded-[1.5rem] p-5">
        {/* AI badge */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="h-7 w-7 rounded-xl flex items-center justify-center"
              style={{ background: "linear-gradient(135deg,rgba(139,92,246,0.8),rgba(99,102,241,0.8))", border: "1px solid rgba(255,255,255,0.2)" }}>
              <Zap className="h-3.5 w-3.5 text-white" />
            </div>
            <div>
              <p className="text-xs font-bold card-heading">Smart Rule Engine</p>
              <p className="text-[10px] card-muted">
                {updatedStr ? `Updated at ${updatedStr}` : "Powered by sensor data"}
              </p>
            </div>
          </div>
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full text-violet-600 dark:text-violet-300"
            style={{ background: "rgba(139,92,246,0.12)", border: "1px solid rgba(139,92,246,0.28)" }}>
            FREE
          </span>
        </div>

        {/* Loading */}
        {isLoading && (
          <div className="space-y-3">
            {[0, 1, 2].map(i => (
              <div key={i} className="h-16 rounded-2xl animate-pulse glass-tile" />
            ))}
          </div>
        )}

        {/* Empty */}
        {!isLoading && all.length === 0 && (
          <div className="text-center py-8">
            <CheckCircle2 className="h-10 w-10 text-emerald-500 dark:text-emerald-400 mx-auto mb-3" />
            <p className="text-sm font-bold card-heading">All Systems Good</p>
            <p className="text-xs card-body mt-1">No issues detected in current sensor data.</p>
          </div>
        )}

        {/* Recommendations list */}
        {!isLoading && visible.length > 0 && (
          <div className="space-y-2.5">
            {visible.map((rec) => {
              const s = priorityStyles[rec.priority];
              const IconComp = iconMap[rec.icon] ?? Info;
              const isOpen = expanded === rec.id;

              return (
                <div key={rec.id}
                  className="rounded-2xl overflow-hidden transition-all duration-200"
                  style={{ background: s.card, border: `1px solid ${s.border}` }}>
                  {/* Header row — always visible */}
                  <button
                    className="w-full text-left p-3.5 flex items-start gap-3"
                    onClick={() => setExpanded(isOpen ? null : rec.id)}>
                    <div className={`h-9 w-9 rounded-xl flex items-center justify-center flex-shrink-0 ${s.icon}`}
                      style={{ background: s.iconBg }}>
                      <IconComp className="h-4.5 w-4.5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <p className="text-sm font-bold card-heading leading-tight">{rec.title}</p>
                        <div className="flex items-center gap-1.5 flex-shrink-0 mt-0.5">
                          {rec.metric && (
                            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${s.badge}`}
                              style={{ background: s.badgeBg, border: `1px solid ${s.badgeBr}` }}>
                              {rec.metric}
                            </span>
                          )}
                          <ChevronRight className={`h-3.5 w-3.5 card-muted transition-transform ${isOpen ? "rotate-90" : ""}`} />
                        </div>
                      </div>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className={`text-[10px] font-semibold ${s.badge}`}
                          style={{ background: s.badgeBg, border: `1px solid ${s.badgeBr}` }}>{/* priority pill */}</span>
                        <p className="text-[11px] card-body truncate">{rec.description.slice(0, 70)}…</p>
                      </div>
                    </div>
                  </button>

                  {/* Expanded detail */}
                  {isOpen && (
                    <div className="px-4 pb-4 space-y-3">
                      <div className="h-px bg-gradient-to-r from-transparent via-gray-300/40 dark:via-white/10 to-transparent" />
                      <p className="text-xs card-body leading-relaxed">{rec.description}</p>
                      <div className="rounded-xl p-3 flex items-start gap-2"
                        style={{ background: s.iconBg, border: `1px solid ${s.border}` }}>
                        <CheckCircle2 className={`h-4 w-4 flex-shrink-0 mt-0.5 ${s.icon}`} />
                        <p className="text-xs font-semibold card-heading leading-relaxed">{rec.action}</p>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <div className="flex-1 h-1.5 rounded-full overflow-hidden bg-gray-200/50 dark:bg-white/10">
                          <div className="h-full rounded-full bg-violet-500/70"
                            style={{ width: `${rec.confidence}%` }} />
                        </div>
                        <span className="text-[10px] card-muted font-semibold">{rec.confidence}% confidence</span>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}

            {/* Show more / less toggle */}
            {all.length > 3 && (
              <button
                onClick={() => setShowAll(v => !v)}
                className="w-full py-2.5 rounded-xl glass-tile text-xs font-semibold text-violet-600 dark:text-violet-300 transition-all hover:scale-[1.01]">
                {showAll ? "Show fewer" : `Show ${all.length - 3} more recommendations`}
              </button>
            )}
          </div>
        )}

        {/* Footer */}
        {!isLoading && all.length > 0 && (
          <p className="text-[10px] card-muted text-center mt-3">
            Based on live sensor readings · Updated every 10 min · 100% free
          </p>
        )}
      </div>
    </div>
  );
}
