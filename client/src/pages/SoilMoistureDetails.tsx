import { useRoute, Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, Shrub, DropletIcon, TrendingUp, ClipboardList, Sprout } from "lucide-react";
import Header from "@/components/Header";
import BottomNavigation from "@/components/BottomNavigation";
import PageShell from "@/components/PageShell";

const SoilMoistureDetails = () => {
  const [, params] = useRoute("/soil-moisture/:id");
  const farmId = params?.id ? parseInt(params.id) : 1;
  const { data: soilMoistureData, isLoading } = useQuery({ queryKey: [`/api/farm/${farmId}/soil-moisture`] });

  const historicalData = [
    { date: "May 22", average: 68, field1: 70, field2: 65 },
    { date: "May 21", average: 65, field1: 67, field2: 63 },
    { date: "May 20", average: 61, field1: 64, field2: 58 },
    { date: "May 19", average: 72, field1: 75, field2: 69 },
    { date: "May 18", average: 69, field1: 71, field2: 67 },
  ];

  const defaultFieldReadings = [
    { id: 1, name: "Field 1", value: 68, status: "optimal" },
    { id: 2, name: "Field 2", value: 45, status: "warning" },
  ];
  const fieldReadings = (soilMoistureData as any)?.fields || defaultFieldReadings;
  const moistureLevel = (soilMoistureData as any)?.level > 0 ? (soilMoistureData as any).level : 68;
  const moistureStatus = (soilMoistureData as any)?.status || "Ideal Moisture Level";

  const getColor = (level: number) => {
    if (level >= 60) return { stroke: "#34d399", text: "text-emerald-500 dark:text-emerald-300", bar: "bg-emerald-400" };
    if (level >= 40) return { stroke: "#fbbf24", text: "text-amber-500 dark:text-amber-300", bar: "bg-amber-400" };
    return { stroke: "#f87171", text: "text-red-500 dark:text-red-300", bar: "bg-red-400" };
  };

  const getPillStyle = (status: string) => {
    switch (status) {
      case "optimal": return { bg: 'rgba(16,185,129,0.15)', color: 'text-emerald-600 dark:text-emerald-300', border: 'rgba(16,185,129,0.3)' };
      case "warning": return { bg: 'rgba(245,158,11,0.15)', color: 'text-amber-600 dark:text-amber-300', border: 'rgba(245,158,11,0.3)' };
      case "danger": return { bg: 'rgba(239,68,68,0.15)', color: 'text-red-600 dark:text-red-300', border: 'rgba(239,68,68,0.3)' };
      default: return { bg: 'rgba(255,255,255,0.08)', color: 'card-label', border: 'rgba(255,255,255,0.15)' };
    }
  };

  const colors = getColor(moistureLevel);
  const circumference = 2 * Math.PI * 40;
  const offset = circumference - (moistureLevel / 100) * circumference;

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
                    <p className="text-xs card-body mt-1 leading-relaxed">Current soil moisture is optimal for your crops.</p>
                    <div className="flex flex-wrap gap-1.5 mt-3">
                      {fieldReadings.map((field: any) => {
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
                <table className="w-full min-w-[440px]">
                  <thead>
                    <tr className="border-b divider">
                      {["Date", "Average (%)", "Field 1 (%)", "Field 2 (%)"].map(h => (
                        <th key={h} className="py-2 px-3 text-left text-xs font-semibold card-label">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {historicalData.map((entry, i) => (
                      <tr key={i} className={i !== historicalData.length - 1 ? "border-b divider" : ""}>
                        <td className="py-2.5 px-3 text-sm font-semibold card-value">{entry.date}</td>
                        <td className="py-2.5 px-3 text-sm card-body">{entry.average}%</td>
                        <td className="py-2.5 px-3 text-sm card-body">{entry.field1}%</td>
                        <td className="py-2.5 px-3 text-sm card-body">{entry.field2}%</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
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
                <div className="rounded-xl p-3" style={{ background: 'rgba(16,185,129,0.10)', border: '1px solid rgba(16,185,129,0.2)' }}>
                  <h4 className="text-sm font-bold text-emerald-600 dark:text-emerald-400 mb-1">Field 1 – North Paddy</h4>
                  <p className="text-sm card-body">At <strong>70%</strong> moisture — optimal for rice. No irrigation needed for 48 hours.</p>
                </div>
                <div className="rounded-xl p-3" style={{ background: 'rgba(245,158,11,0.10)', border: '1px solid rgba(245,158,11,0.2)' }}>
                  <h4 className="text-sm font-bold text-amber-600 dark:text-amber-400 mb-1">Field 2 – South Vegetable Patch</h4>
                  <p className="text-sm card-body">At <strong>45%</strong> — below optimal. Schedule irrigation within 24 hours.</p>
                </div>
              </div>
            </div>

            {/* Recommendations */}
            <div className="scale-in">
              <h3 className="text-base font-bold card-heading mb-3 flex items-center gap-2">
                <div className="h-7 w-7 rounded-xl flex items-center justify-center" style={{ background: 'rgba(168,85,247,0.15)', border: '1px solid rgba(168,85,247,0.3)' }}>
                  <ClipboardList className="h-4 w-4 text-purple-500 dark:text-purple-300" />
                </div>
                Irrigation Recommendations
              </h3>
              <div className="glass-card rounded-[1.25rem] p-5 mb-4">
                <p className="text-sm card-body mb-4">Based on current readings, crop types, and weather:</p>
                <div className="space-y-3">
                  {[
                    { num: "1", color: 'rgba(59,130,246,0.15)', border: 'rgba(59,130,246,0.3)', textColor: 'text-blue-600 dark:text-blue-300', text: <><strong className="card-value">Field 1:</strong><span className="card-body"> Skip irrigation for the next 2 days to maintain optimal moisture levels.</span></> },
                    { num: "2", color: 'rgba(245,158,11,0.15)', border: 'rgba(245,158,11,0.3)', textColor: 'text-amber-600 dark:text-amber-300', text: <><strong className="card-value">Field 2:</strong><span className="card-body"> Irrigate tomorrow morning (5–7 AM) with 2.5 cm of water.</span></> },
                    { num: "3", color: 'rgba(16,185,129,0.15)', border: 'rgba(16,185,129,0.3)', textColor: 'text-emerald-600 dark:text-emerald-300', text: <><strong className="card-value">Next check:</strong><span className="card-body"> Monitor Field 2 moisture 24 hours after irrigation.</span></> },
                  ].map((r, i) => (
                    <div key={i} className="flex items-start gap-3">
                      <div className="h-8 w-8 rounded-xl flex items-center justify-center flex-shrink-0 font-bold text-sm"
                        style={{ background: r.color, border: `1px solid ${r.border}` }}>
                        <span className={r.textColor}>{r.num}</span>
                      </div>
                      <p className="text-sm pt-1">{r.text}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
      <BottomNavigation />
    </PageShell>
  );
};

export default SoilMoistureDetails;
