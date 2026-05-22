import { useRoute, Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, TestTube, Droplet, Scale, Thermometer, TrendingUp, Waves, Clock } from "lucide-react";
import Header from "@/components/Header";
import BottomNavigation from "@/components/BottomNavigation";
import PageShell from "@/components/PageShell";

const WaterQualityDetails = () => {
  const [, params] = useRoute("/water-quality/:id");
  const farmId = params?.id ? parseInt(params.id) : 1;
  const { data: waterQualityData, isLoading } = useQuery({ queryKey: [`/api/farm/${farmId}/water-quality`] });

  const historicalData = [
    { date: "May 22", ph: 6.8, tds: 320, temperature: 28 },
    { date: "May 21", ph: 6.7, tds: 315, temperature: 27 },
    { date: "May 20", ph: 6.9, tds: 330, temperature: 29 },
    { date: "May 19", ph: 7.0, tds: 325, temperature: 28 },
    { date: "May 18", ph: 6.8, tds: 318, temperature: 26 },
  ];

  const getIcon = (icon: string) => {
    switch (icon) {
      case "ph": return <Droplet className="h-5 w-5 text-blue-400 dark:text-blue-300" />;
      case "tds": return <Scale className="h-5 w-5 text-purple-400 dark:text-purple-300" />;
      case "temp": return <Thermometer className="h-5 w-5 text-orange-400 dark:text-orange-300" />;
      default: return <Droplet className="h-5 w-5 text-blue-400" />;
    }
  };

  const getStatusStyle = (status: string) => {
    const s = status?.toLowerCase();
    if (s === "good") return { bg: 'rgba(16,185,129,0.15)', color: 'text-emerald-500 dark:text-emerald-300', border: 'rgba(16,185,129,0.3)' };
    if (s === "warm" || s === "warning") return { bg: 'rgba(245,158,11,0.15)', color: 'text-amber-500 dark:text-amber-300', border: 'rgba(245,158,11,0.3)' };
    if (s === "bad" || s === "danger") return { bg: 'rgba(239,68,68,0.15)', color: 'text-red-500 dark:text-red-300', border: 'rgba(239,68,68,0.3)' };
    return { bg: 'rgba(255,255,255,0.08)', color: 'card-label', border: 'rgba(255,255,255,0.15)' };
  };

  const defaultMetrics = [
    { name: "pH Level", value: "6.8", status: "Good", icon: "ph" },
    { name: "TDS", value: "320", unit: "ppm", status: "Good", icon: "tds" },
    { name: "Temp", value: "28°C", status: "Warm", icon: "temp" },
  ];
  const metrics = (waterQualityData as any)?.metrics || defaultMetrics;

  const sections = [
    { color: 'rgba(59,130,246,0.15)', border: 'rgba(59,130,246,0.3)', icon: TestTube, iconColor: 'text-blue-500 dark:text-blue-300', title: "Current Readings" },
    { color: 'rgba(99,102,241,0.15)', border: 'rgba(99,102,241,0.3)', icon: TrendingUp, iconColor: 'text-indigo-500 dark:text-indigo-300', title: "Historical Data" },
    { color: 'rgba(16,185,129,0.15)', border: 'rgba(16,185,129,0.3)', icon: Waves, iconColor: 'text-emerald-500 dark:text-emerald-300', title: "Recommendations" },
    { color: 'rgba(168,85,247,0.15)', border: 'rgba(168,85,247,0.3)', icon: Clock, iconColor: 'text-purple-500 dark:text-purple-300', title: "Reading Schedule" },
  ];

  const SectionHeader = ({ idx }: { idx: number }) => {
    const s = sections[idx];
    return (
      <h3 className="text-base font-bold card-heading mb-3 flex items-center gap-2">
        <div className="h-7 w-7 rounded-xl flex items-center justify-center"
          style={{ background: s.color, border: `1px solid ${s.border}` }}>
          <s.icon className={`h-4 w-4 ${s.iconColor}`} />
        </div>
        {s.title}
      </h3>
    );
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
          <h1 className="text-xl font-bold card-heading">Water Quality Details</h1>
        </div>

        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map(i => <div key={i} className="h-40 glass-card animate-pulse rounded-2xl" />)}
          </div>
        ) : (
          <div className="space-y-5">
            {/* Current Readings */}
            <div className="slide-in-right">
              <SectionHeader idx={0} />
              <div className="glass-card rounded-[1.25rem] p-5">
                <div className="grid grid-cols-3 gap-3">
                  {metrics.map((metric: any, index: number) => {
                    const ss = getStatusStyle(metric.status);
                    return (
                      <div key={index} className="glass-tile rounded-2xl p-4 flex flex-col items-center gap-2 hover:scale-105 transition-all">
                        <div className="h-10 w-10 rounded-xl glass-tile flex items-center justify-center">{getIcon(metric.icon)}</div>
                        <div className="text-center">
                          <div className="text-lg font-bold card-value leading-none">{metric.value}</div>
                          {metric.unit && <div className="text-[10px] card-muted mt-0.5">{metric.unit}</div>}
                          <div className="text-[10px] card-label mt-1 font-medium">{metric.name}</div>
                        </div>
                        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${ss.color}`}
                          style={{ background: ss.bg, border: `1px solid ${ss.border}` }}>
                          {metric.status}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Historical Data */}
            <div className="slide-in-left">
              <SectionHeader idx={1} />
              <div className="glass-card rounded-[1.25rem] p-5 overflow-x-auto">
                <table className="w-full min-w-[440px]">
                  <thead>
                    <tr className="border-b divider">
                      {["Date", "pH Level", "TDS (ppm)", "Temp (°C)"].map(h => (
                        <th key={h} className="py-2 px-3 text-left text-xs font-semibold card-label">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {historicalData.map((entry, index) => (
                      <tr key={index} className={index !== historicalData.length - 1 ? "border-b divider" : ""}>
                        <td className="py-2.5 px-3 text-sm font-semibold card-value">{entry.date}</td>
                        <td className="py-2.5 px-3 text-sm card-body">{entry.ph}</td>
                        <td className="py-2.5 px-3 text-sm card-body">{entry.tds}</td>
                        <td className="py-2.5 px-3 text-sm card-body">{entry.temperature}°C</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Recommendations */}
            <div className="fade-in">
              <SectionHeader idx={2} />
              <div className="glass-card rounded-[1.25rem] p-5 space-y-3">
                {[
                  { color: 'rgba(16,185,129,0.12)', border: 'rgba(16,185,129,0.25)', labelColor: 'text-emerald-600 dark:text-emerald-400', label: 'pH Level (6.8):', text: 'Your water pH is optimal for most crops. Maintain the current irrigation system.' },
                  { color: 'rgba(59,130,246,0.12)', border: 'rgba(59,130,246,0.25)', labelColor: 'text-blue-600 dark:text-blue-400', label: 'TDS (320 ppm):', text: 'Good mineral content for plant growth. Consider testing specific nutrients if growing specialized crops.' },
                  { color: 'rgba(245,158,11,0.12)', border: 'rgba(245,158,11,0.25)', labelColor: 'text-amber-600 dark:text-amber-400', label: 'Temperature (28°C):', text: 'Slightly warm. Consider early morning irrigation to minimize evaporation and heat stress on plants.' },
                ].map((r, i) => (
                  <div key={i} className="rounded-xl p-3" style={{ background: r.color, border: `1px solid ${r.border}` }}>
                    <p className="text-sm card-body"><strong className={r.labelColor}>{r.label}</strong> {r.text}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Reading Schedule */}
            <div className="scale-in">
              <SectionHeader idx={3} />
              <div className="glass-card rounded-[1.25rem] p-5 mb-4">
                <p className="text-sm card-body mb-4">Sensors are set to record measurements at these intervals:</p>
                <div className="space-y-3">
                  {[
                    { label: "Regular Readings", value: "Every 24 hours" },
                    { label: "Irrigation Events", value: "Before & After" },
                    { label: "Weather Alerts", value: "As needed" },
                  ].map((row, i) => (
                    <div key={i} className={`flex justify-between items-center ${i < 2 ? 'pb-3 border-b divider' : ''}`}>
                      <span className="text-sm font-semibold card-value">{row.label}</span>
                      <span className="text-sm card-label">{row.value}</span>
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

export default WaterQualityDetails;
