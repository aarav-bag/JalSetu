import { useRoute, Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, Shrub, TrendingUp, ClipboardList, Sprout, PlugZap } from "lucide-react";
import Header from "@/components/Header";
import BottomNavigation from "@/components/BottomNavigation";
import PageShell from "@/components/PageShell";

const SoilMoistureDetails = () => {
  const [, params] = useRoute("/soil-moisture/:id");
  const farmId = params?.id ? parseInt(params.id) : 1;

  const { data, isLoading } = useQuery<{
    level: number;
    status: string;
    fields: { id: number; name: string; value: number; status: string }[];
    history: { date: string; average: number; fieldAvgs: (number | null)[] }[];
    fieldNames: string[];
  }>({ queryKey: [`/api/farm/${farmId}/soil-moisture`] });

  const moistureLevel = data?.level ?? 0;
  const moistureStatus = data?.status ?? "No Data";
  const fieldReadings = data?.fields ?? [];
  const history = data?.history ?? [];
  const fieldNames = data?.fieldNames ?? [];
  const hasData = moistureLevel > 0;

  const getColor = (level: number) => {
    if (level >= 60) return { stroke: "#34d399", text: "text-emerald-500 dark:text-emerald-300", bar: "bg-emerald-400" };
    if (level >= 40) return { stroke: "#fbbf24", text: "text-amber-500 dark:text-amber-300", bar: "bg-amber-400" };
    return { stroke: "#f87171", text: "text-red-500 dark:text-red-300", bar: "bg-red-400" };
  };

  const getPillStyle = (status: string) => {
    switch (status) {
      case "optimal": return { bg: 'rgba(16,185,129,0.15)', color: 'text-emerald-600 dark:text-emerald-300', border: 'rgba(16,185,129,0.3)' };
      case "warning": return { bg: 'rgba(245,158,11,0.15)', color: 'text-amber-600 dark:text-amber-300', border: 'rgba(245,158,11,0.3)' };
      case "danger":  return { bg: 'rgba(239,68,68,0.15)',  color: 'text-red-600 dark:text-red-300',    border: 'rgba(239,68,68,0.3)' };
      default:        return { bg: 'rgba(255,255,255,0.08)', color: 'card-label',                        border: 'rgba(255,255,255,0.15)' };
    }
  };

  const getFieldAnalysisStyle = (status: string) => {
    switch (status) {
      case "optimal": return { bg: 'rgba(16,185,129,0.10)',  border: 'rgba(16,185,129,0.2)',  heading: 'text-emerald-600 dark:text-emerald-400' };
      case "warning": return { bg: 'rgba(245,158,11,0.10)',  border: 'rgba(245,158,11,0.2)',  heading: 'text-amber-600 dark:text-amber-400' };
      case "danger":  return { bg: 'rgba(239,68,68,0.10)',   border: 'rgba(239,68,68,0.2)',   heading: 'text-red-600 dark:text-red-400' };
      default:        return { bg: 'rgba(255,255,255,0.06)', border: 'rgba(255,255,255,0.12)', heading: 'card-label' };
    }
  };

  const getFieldRecommendation = (field: { name: string; value: number; status: string }) => {
    if (field.value === 0) return `No readings yet for ${field.name}.`;
    if (field.status === "optimal") return `At ${field.value}% — optimal moisture. No irrigation needed.`;
    if (field.status === "warning") return `At ${field.value}% — slightly low. Schedule irrigation within 24 hours.`;
    return `At ${field.value}% — critically low. Irrigate as soon as possible.`;
  };

  const colors = getColor(moistureLevel);
  const circumference = 2 * Math.PI * 40;
  const offset = circumference - (moistureLevel / 100) * circumference;

  const recColors = [
    { color: 'rgba(59,130,246,0.15)',  border: 'rgba(59,130,246,0.3)',  textColor: 'text-blue-600 dark:text-blue-300' },
    { color: 'rgba(245,158,11,0.15)',  border: 'rgba(245,158,11,0.3)',  textColor: 'text-amber-600 dark:text-amber-300' },
    { color: 'rgba(16,185,129,0.15)', border: 'rgba(16,185,129,0.3)',  textColor: 'text-emerald-600 dark:text-emerald-300' },
    { color: 'rgba(168,85,247,0.15)', border: 'rgba(168,85,247,0.3)',  textColor: 'text-purple-600 dark:text-purple-300' },
  ];

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
          <h1 className="text-xl font-bold card-heading">Soil Moisture Details</h1>
        </div>

        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map(i => <div key={i} className="h-40 glass-card animate-pulse rounded-2xl" />)}
          </div>
        ) : (
          <div className="space-y-5">
            {/* Current Readings */}
            <div className="slide-in-right">
              <h3 className="text-base font-bold card-heading mb-3 flex items-center gap-2">
                <div className="h-7 w-7 rounded-xl flex items-center justify-center" style={{ background: 'rgba(16,185,129,0.15)', border: '1px solid rgba(16,185,129,0.3)' }}>
                  <Shrub className="h-4 w-4 text-emerald-500 dark:text-emerald-300" />
                </div>
                Current Readings
              </h3>
              <div className="glass-card rounded-[1.25rem] p-5">
                {!hasData ? (
                  <div className="flex flex-col items-center py-6 gap-3 text-center">
                    <PlugZap className="h-10 w-10 text-gray-400 dark:text-white/30" />
                    <p className="text-sm font-semibold card-label">No sensor readings yet</p>
                    <p className="text-xs card-muted max-w-[240px]">Connect your ESP32 device and wait for the first soil moisture reading to appear here.</p>
                  </div>
                ) : (
                  <div className="flex items-center gap-5">
                    <div className="relative flex-shrink-0 w-28 h-28">
                      <div className="absolute inset-3 rounded-full blur-md opacity-25" style={{ background: colors.stroke }} />
                      <svg className="w-28 h-28 -rotate-90 relative z-10" viewBox="0 0 100 100">
                        <circle cx="50" cy="50" r="40" stroke="rgba(128,128,128,0.2)" strokeWidth="7" fill="none" />
                        <circle cx="50" cy="50" r="40" stroke={colors.stroke} strokeWidth="7" fill="none"
                          strokeLinecap="round" strokeDasharray={circumference} strokeDashoffset={offset}
                          style={{ transition: 'stroke-dashoffset 1s ease', filter: `drop-shadow(0 0 5px ${colors.stroke})` }} />
                      </svg>
                      <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className={`text-2xl font-bold ${colors.text} leading-none`}>{moistureLevel}%</span>
                        <span className="text-[9px] card-muted font-semibold mt-1 tracking-wider uppercase">moisture</span>
                      </div>
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-bold card-heading">{moistureStatus}</p>
                      <p className="text-xs card-body mt-1 leading-relaxed">
                        {moistureLevel >= 60
                          ? "Current soil moisture is optimal for your crops."
                          : moistureLevel >= 35
                          ? "Soil moisture is below optimal. Consider scheduling irrigation."
                          : "Soil moisture is critically low. Irrigate as soon as possible."}
                      </p>
                      <div className="flex flex-wrap gap-1.5 mt-3">
                        {fieldReadings.filter(f => f.value > 0).map((field) => {
                          const p = getPillStyle(field.status);
                          return (
                            <span key={field.id} className={`px-2.5 py-1 rounded-xl text-xs font-semibold ${p.color}`}
                              style={{ background: p.bg, border: `1px solid ${p.border}` }}>
                              {field.name}: {field.value}%
                            </span>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Historical */}
            <div className="slide-in-left">
              <h3 className="text-base font-bold card-heading mb-3 flex items-center gap-2">
                <div className="h-7 w-7 rounded-xl flex items-center justify-center" style={{ background: 'rgba(99,102,241,0.15)', border: '1px solid rgba(99,102,241,0.3)' }}>
                  <TrendingUp className="h-4 w-4 text-indigo-500 dark:text-indigo-300" />
                </div>
                Historical Data
              </h3>
              <div className="glass-card rounded-[1.25rem] p-5 overflow-x-auto">
                {history.length === 0 ? (
                  <p className="text-sm card-muted text-center py-4">No historical data available yet.</p>
                ) : (
                  <table className="w-full min-w-[320px]">
                    <thead>
                      <tr className="border-b divider">
                        <th className="py-2 px-3 text-left text-xs font-semibold card-label">Date</th>
                        <th className="py-2 px-3 text-left text-xs font-semibold card-label">Average (%)</th>
                        {fieldNames.map(name => (
                          <th key={name} className="py-2 px-3 text-left text-xs font-semibold card-label">{name} (%)</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {history.map((entry, i) => (
                        <tr key={i} className={i !== history.length - 1 ? "border-b divider" : ""}>
                          <td className="py-2.5 px-3 text-sm font-semibold card-value">{entry.date}</td>
                          <td className="py-2.5 px-3 text-sm card-body">{entry.average > 0 ? `${entry.average}%` : "—"}</td>
                          {entry.fieldAvgs.map((v, fi) => (
                            <td key={fi} className="py-2.5 px-3 text-sm card-body">{v !== null ? `${v}%` : "—"}</td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>

            {/* Field Analysis */}
            <div className="fade-in">
              <h3 className="text-base font-bold card-heading mb-3 flex items-center gap-2">
                <div className="h-7 w-7 rounded-xl flex items-center justify-center" style={{ background: 'rgba(16,185,129,0.15)', border: '1px solid rgba(16,185,129,0.3)' }}>
                  <Sprout className="h-4 w-4 text-emerald-500 dark:text-emerald-300" />
                </div>
                Field Analysis
              </h3>
              <div className="glass-card rounded-[1.25rem] p-5 space-y-3">
                {fieldReadings.length === 0 ? (
                  <p className="text-sm card-muted text-center py-2">No fields configured.</p>
                ) : (
                  fieldReadings.map(field => {
                    const s = getFieldAnalysisStyle(field.value > 0 ? field.status : "default");
                    return (
                      <div key={field.id} className="rounded-xl p-3" style={{ background: s.bg, border: `1px solid ${s.border}` }}>
                        <h4 className={`text-sm font-bold ${s.heading} mb-1`}>{field.name}</h4>
                        <p className="text-sm card-body">{getFieldRecommendation(field)}</p>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* Recommendations */}
            {hasData && (
              <div className="scale-in">
                <h3 className="text-base font-bold card-heading mb-3 flex items-center gap-2">
                  <div className="h-7 w-7 rounded-xl flex items-center justify-center" style={{ background: 'rgba(168,85,247,0.15)', border: '1px solid rgba(168,85,247,0.3)' }}>
                    <ClipboardList className="h-4 w-4 text-purple-500 dark:text-purple-300" />
                  </div>
                  Irrigation Recommendations
                </h3>
                <div className="glass-card rounded-[1.25rem] p-5 mb-4">
                  <p className="text-sm card-body mb-4">Based on current sensor readings:</p>
                  <div className="space-y-3">
                    {fieldReadings.filter(f => f.value > 0).map((field, i) => {
                      const rc = recColors[i % recColors.length];
                      const action =
                        field.status === "optimal"
                          ? `Skip irrigation for ${field.name} for the next 48 hours.`
                          : field.status === "warning"
                          ? `Irrigate ${field.name} within 24 hours with ~2.5 cm of water.`
                          : `Irrigate ${field.name} immediately — moisture is critically low.`;
                      return (
                        <div key={field.id} className="flex items-start gap-3">
                          <div className="h-8 w-8 rounded-xl flex items-center justify-center flex-shrink-0 font-bold text-sm"
                            style={{ background: rc.color, border: `1px solid ${rc.border}` }}>
                            <span className={rc.textColor}>{i + 1}</span>
                          </div>
                          <p className="text-sm pt-1 card-body">{action}</p>
                        </div>
                      );
                    })}
                    {fieldReadings.filter(f => f.value > 0).length > 0 && (
                      <div className="flex items-start gap-3">
                        <div className="h-8 w-8 rounded-xl flex items-center justify-center flex-shrink-0 font-bold text-sm"
                          style={{ background: recColors[fieldReadings.filter(f => f.value > 0).length % recColors.length].color, border: `1px solid ${recColors[fieldReadings.filter(f => f.value > 0).length % recColors.length].border}` }}>
                          <span className={recColors[fieldReadings.filter(f => f.value > 0).length % recColors.length].textColor}>
                            {fieldReadings.filter(f => f.value > 0).length + 1}
                          </span>
                        </div>
                        <p className="text-sm pt-1 card-body">
                          <strong className="card-value">Next check:</strong> Monitor all fields after any irrigation event.
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </main>
      <BottomNavigation />
    </PageShell>
  );
};

export default SoilMoistureDetails;
