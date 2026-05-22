import { useRoute, Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, Lightbulb, Check, Sparkles, Calendar, Clock, Droplet, Zap } from "lucide-react";
import Header from "@/components/Header";
import BottomNavigation from "@/components/BottomNavigation";
import PageShell from "@/components/PageShell";
import { useToast } from "@/hooks/use-toast";

const IrrigationTipsDetails = () => {
  const [, params] = useRoute("/irrigation-tips/:id");
  const farmId = params?.id ? parseInt(params.id) : 1;
  const { data: tipData, isLoading } = useQuery({ queryKey: [`/api/farm/${farmId}/irrigation-tips`] });
  const { toast } = useToast();

  const tip = (tipData as any)?.tip || "Based on your soil type and current moisture levels, water your crops early morning (5–7 AM) to minimize evaporation and maximize absorption.";

  const additionalTips = [
    { title: "Use Drip Irrigation", description: "For vegetable crops, switch to drip irrigation to reduce water usage by up to 30% while maintaining optimal soil moisture.", category: "water-saving" },
    { title: "Mulching Benefits", description: "Apply organic mulch around plants to reduce evaporation, suppress weeds, and maintain soil temperature.", category: "soil-health" },
    { title: "Irrigation Timing", description: "Water deeply but less frequently to encourage deeper root growth and drought resistance in your crops.", category: "scheduling" },
  ];

  const scheduledEvents = [
    { field: "Field 1", date: "May 26", time: "06:00 AM", status: "scheduled" },
    { field: "Field 2", date: "May 24", time: "05:30 AM", status: "scheduled" },
  ];

  const getCatStyle = (category: string) => {
    switch (category) {
      case "water-saving": return { bg: 'rgba(59,130,246,0.12)', border: 'rgba(59,130,246,0.25)', color: 'text-blue-500 dark:text-blue-300', Icon: Droplet };
      case "soil-health": return { bg: 'rgba(16,185,129,0.12)', border: 'rgba(16,185,129,0.25)', color: 'text-emerald-500 dark:text-emerald-300', Icon: Sparkles };
      default: return { bg: 'rgba(168,85,247,0.12)', border: 'rgba(168,85,247,0.25)', color: 'text-purple-500 dark:text-purple-300', Icon: Clock };
    }
  };

  return (
    <PageShell>
      <Header />
      <main className="flex-1 px-5 pt-2 pb-28 overflow-y-auto z-10">
        <div className="flex items-center mb-5">
          <Link href="/" className="mr-3">
            <div className="h-9 w-9 rounded-xl glass-tile flex items-center justify-center shadow-sm">
              <ArrowLeft className="h-4 w-4 text-gray-600 dark:text-white/70" />
            </div>
          </Link>
          <h1 className="text-xl font-bold card-heading">Smart Irrigation Tips</h1>
        </div>

        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map(i => <div key={i} className="h-40 glass-card animate-pulse rounded-2xl" />)}
          </div>
        ) : (
          <div className="space-y-5">
            {/* Today's Recommendation */}
            <div className="slide-in-right">
              <h3 className="text-base font-bold card-heading mb-3 flex items-center gap-2">
                <div className="h-7 w-7 rounded-xl flex items-center justify-center" style={{ background: 'rgba(245,158,11,0.18)', border: '1px solid rgba(245,158,11,0.35)' }}>
                  <Lightbulb className="h-4 w-4 text-amber-500 dark:text-amber-300" />
                </div>
                Today's Recommendation
              </h3>
              <div className="glass-card rounded-[1.25rem] p-5">
                <div className="flex items-start gap-3 mb-4">
                  <div className="h-11 w-11 rounded-xl flex items-center justify-center shadow-lg flex-shrink-0"
                    style={{ background: 'linear-gradient(135deg, rgba(251,191,36,0.9), rgba(249,115,22,0.9))', border: '1px solid rgba(251,191,36,0.4)' }}>
                    <Sparkles className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold card-heading">AI-Powered Suggestion</span>
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold text-amber-500 dark:text-amber-300"
                        style={{ background: 'rgba(245,158,11,0.15)', border: '1px solid rgba(245,158,11,0.3)' }}>
                        <Zap className="h-2.5 w-2.5" />SMART
                      </span>
                    </div>
                    <p className="text-xs card-muted mt-0.5">Updated just now</p>
                  </div>
                </div>
                <div className="rounded-xl p-3 mb-4" style={{ background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.2)' }}>
                  <p className="text-sm card-body leading-relaxed">{tip}</p>
                </div>
                <button
                  onClick={() => toast({ title: "Suggestion applied!", description: "Irrigation schedule has been updated." })}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white transition-all hover:scale-[1.02]"
                  style={{ background: 'linear-gradient(135deg, rgba(245,158,11,0.9), rgba(249,115,22,0.9))', border: '1px solid rgba(251,191,36,0.4)' }}>
                  <Check className="h-4 w-4" /> Apply suggestion
                </button>
              </div>
            </div>

            {/* More Tips */}
            <div className="slide-in-left">
              <h3 className="text-base font-bold card-heading mb-3 flex items-center gap-2">
                <div className="h-7 w-7 rounded-xl flex items-center justify-center" style={{ background: 'rgba(16,185,129,0.15)', border: '1px solid rgba(16,185,129,0.3)' }}>
                  <Lightbulb className="h-4 w-4 text-emerald-500 dark:text-emerald-300" />
                </div>
                More Smart Tips
              </h3>
              <div className="glass-card rounded-[1.25rem] p-5 space-y-3">
                {additionalTips.map((t, i) => {
                  const s = getCatStyle(t.category);
                  return (
                    <div key={i} className="rounded-xl p-4 glass-tile hover:scale-[1.01] transition-all">
                      <div className="flex items-start gap-3">
                        <div className={`h-9 w-9 rounded-xl flex items-center justify-center flex-shrink-0 ${s.color}`}
                          style={{ background: s.bg, border: `1px solid ${s.border}` }}>
                          <s.Icon className="h-4 w-4" />
                        </div>
                        <div>
                          <h4 className="text-sm font-bold card-heading mb-0.5">{t.title}</h4>
                          <p className="text-xs card-body leading-relaxed">{t.description}</p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Scheduled Irrigation */}
            <div className="fade-in">
              <h3 className="text-base font-bold card-heading mb-3 flex items-center gap-2">
                <div className="h-7 w-7 rounded-xl flex items-center justify-center" style={{ background: 'rgba(59,130,246,0.15)', border: '1px solid rgba(59,130,246,0.3)' }}>
                  <Calendar className="h-4 w-4 text-blue-500 dark:text-blue-300" />
                </div>
                Scheduled Irrigation
              </h3>
              <div className="glass-card rounded-[1.25rem] p-5">
                <div className="space-y-4">
                  {scheduledEvents.map((event, i) => (
                    <div key={i} className={`flex justify-between items-center ${i < scheduledEvents.length - 1 ? 'pb-4 border-b divider' : ''}`}>
                      <div>
                        <h4 className="text-sm font-bold card-heading">{event.field}</h4>
                        <div className="flex items-center gap-3 mt-1">
                          <span className="flex items-center gap-1 text-xs card-label"><Calendar className="h-3 w-3" />{event.date}</span>
                          <span className="flex items-center gap-1 text-xs card-label"><Clock className="h-3 w-3" />{event.time}</span>
                        </div>
                      </div>
                      <span className="text-xs font-semibold px-2.5 py-1 rounded-xl text-blue-600 dark:text-blue-300"
                        style={{ background: 'rgba(59,130,246,0.12)', border: '1px solid rgba(59,130,246,0.25)' }}>
                        Scheduled
                      </span>
                    </div>
                  ))}
                  <button
                    onClick={() => toast({ title: "Schedule new irrigation", description: "Coming soon!" })}
                    className="w-full py-2.5 rounded-xl text-sm font-semibold text-blue-600 dark:text-blue-300 flex items-center justify-center gap-2 glass-tile transition-all hover:scale-[1.01]">
                    <Calendar className="h-4 w-4" /> Schedule New Irrigation
                  </button>
                </div>
              </div>
            </div>

            {/* Efficiency */}
            <div className="scale-in">
              <h3 className="text-base font-bold card-heading mb-3 flex items-center gap-2">
                <div className="h-7 w-7 rounded-xl flex items-center justify-center" style={{ background: 'rgba(99,102,241,0.15)', border: '1px solid rgba(99,102,241,0.3)' }}>
                  <Droplet className="h-4 w-4 text-indigo-500 dark:text-indigo-300" />
                </div>
                Irrigation Efficiency
              </h3>
              <div className="glass-card rounded-[1.25rem] p-5 mb-4">
                {[
                  { label: "Water Usage Efficiency", value: "92%", pct: 92, color: "bg-emerald-400", glow: "#34d399", note: "15% more efficient than regional average" },
                  { label: "Water Saved This Month", value: "43,200 L", pct: 75, color: "bg-blue-400", glow: "#60a5fa", note: "By following AI recommendations" },
                ].map((bar, i) => (
                  <div key={i} className={i > 0 ? "mt-4" : ""}>
                    <div className="flex justify-between items-center mb-1.5">
                      <span className="text-sm font-semibold card-value">{bar.label}</span>
                      <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">{bar.value}</span>
                    </div>
                    <div className="h-2 rounded-full overflow-hidden" style={{ background: 'rgba(128,128,128,0.15)' }}>
                      <div className={`h-full ${bar.color} rounded-full`} style={{ width: `${bar.pct}%`, boxShadow: `0 0 8px ${bar.glow}` }} />
                    </div>
                    <p className="text-xs card-muted mt-1">{bar.note}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </main>
      <BottomNavigation />
    </PageShell>
  );
};

export default IrrigationTipsDetails;
