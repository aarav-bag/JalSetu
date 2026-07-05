import { useRoute, Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, TestTube, Droplet, Scale, Thermometer, TrendingUp, Waves, Clock, PlugZap } from "lucide-react";
import Header from "@/components/Header";
import BottomNavigation from "@/components/BottomNavigation";
import PageShell from "@/components/PageShell";

interface WaterQualityRecord {
  id: number;
  farmId: number;
  phLevel: string | null;
  tds: string | null;
  temperature: string | null;
  createdAt: string;
}

interface WaterQualityApiResponse {
  latest: WaterQualityRecord | null;
  history: WaterQualityRecord[];
}

const WaterQualityDetails = () => {
  const [, params] = useRoute("/water-quality/:id");
  const farmId = params?.id ? parseInt(params.id) : 1;

  const { data, isLoading } = useQuery<WaterQualityApiResponse>({
    queryKey: [`/api/farm/${farmId}/water-quality`],
  });

  const latest  = data?.latest ?? null;
  const history = data?.history ?? [];

  const getIcon = (icon: string) => {
    switch (icon) {
      case "ph":   return <Droplet     className="h-5 w-5 text-blue-400 dark:text-blue-300" />;
      case "tds":  return <Scale       className="h-5 w-5 text-purple-400 dark:text-purple-300" />;
      case "temp": return <Thermometer className="h-5 w-5 text-orange-400 dark:text-orange-300" />;
      default:     return <Droplet     className="h-5 w-5 text-blue-400" />;
    }
  };

  const getStatusStyle = (status: string) => {
    const s = status?.toLowerCase();
    if (s === "good")                    return { bg: 'rgba(16,185,129,0.15)', color: 'text-emerald-500 dark:text-emerald-300', border: 'rgba(16,185,129,0.3)' };
    if (s === "warm" || s === "warning") return { bg: 'rgba(245,158,11,0.15)', color: 'text-amber-500 dark:text-amber-300',   border: 'rgba(245,158,11,0.3)' };
    if (s === "bad"  || s === "danger")  return { bg: 'rgba(239,68,68,0.15)',  color: 'text-red-500 dark:text-red-300',       border: 'rgba(239,68,68,0.3)' };
    return { bg: 'rgba(255,255,255,0.08)', color: 'card-label', border: 'rgba(255,255,255,0.15)' };
  };

  // Build current-readings metrics from the latest real DB record
  const metrics = latest ? (() => {
    const ph  = parseFloat(latest.phLevel  ?? "0");
    const tds = parseFloat((latest.tds ?? "0").toString().replace(/[^\d.]/g, ""));
    const phStatus  = ph  >= 6.5 && ph  <= 8.5 ? "Good" : "Warning";
    const tdsStatus = tds >= 0   && tds <= 500  ? "Good" : "Warning";
    const rows = [];
    if (latest.phLevel  && latest.phLevel  !== "N/A") rows.push({ name: "pH Level", value: latest.phLevel,  status: phStatus,  icon: "ph" });
    if (latest.tds      && latest.tds      !== "N/A") rows.push({ name: "TDS",      value: latest.tds,      status: tdsStatus, icon: "tds", unit: "ppm" });
    if (latest.temperature && latest.temperature !== "N/A") rows.push({ name: "Temp", value: latest.temperature, status: "Good", icon: "temp" });
    return rows;
  })() : [];

  const formatDate = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleDateString("en-IN", { day: "numeric", month: "short" });
  };

  const formatTime = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });
  };

  const sections = [
    { color: 'rgba(59,130,246,0.15)',  border: 'rgba(59,130,246,0.3)',  icon: TestTube,   iconColor: 'text-blue-500 dark:text-blue-300',    title: "Current Readings" },
    { color: 'rgba(99,102,241,0.15)',  border: 'rgba(99,102,241,0.3)',  icon: TrendingUp, iconColor: 'text-indigo-500 dark:text-indigo-300', title: "Historical Data" },
    { color: 'rgba(16,185,129,0.15)',  border: 'rgba(16,185,129,0.3)',  icon: Waves,      iconColor: 'text-emerald-500 dark:text-emerald-300', title: "Recommendations" },
    { color: 'rgba(168,85,247,0.15)', border: 'rgba(168,85,247,0.3)',  icon: Clock,      iconColor: 'text-purple-500 dark:text-purple-300',  title: "Reading Schedule" },
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

  const NoDataState = ({ message }: { message: string }) => (
    <div className="flex flex-col items-center justify-center py-8 gap-3">
      <div className="h-12 w-12 rounded-2xl flex items-center justify-center"
        style={{ background: 'rgba(59,130,246,0.10)', border: '1px solid rgba(59,130,246,0.2)' }}>
        <PlugZap className="h-6 w-6 text-blue-400 dark:text-blue-300" />
      </div>
      <p className="text-sm card-muted text-center leading-relaxed">{message}</p>
    </div>
  );

  // Build dynamic recommendations from real data
  const buildRecommendations = () => {
    if (!latest) return [];
    const recs = [];
    const ph  = parseFloat(latest.phLevel  ?? "0");
    const tds = parseFloat((latest.tds ?? "0").toString().replace(/[^\d.]/g, ""));
    if (latest.phLevel && latest.phLevel !== "N/A") {
      const ok = ph >= 6.5 && ph <= 8.5;
      recs.push({
        color: ok ? 'rgba(16,185,129,0.12)' : 'rgba(245,158,11,0.12)',
        border: ok ? 'rgba(16,185,129,0.25)' : 'rgba(245,158,11,0.25)',
        labelColor: ok ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400',
        label: `pH Level (${latest.phLevel}):`,
        text: ok
          ? 'Water pH is optimal for most crops. Maintain the current irrigation system.'
          : 'pH is outside the ideal range (6.5–8.5). Consider adjusting with pH buffer solutions.',
      });
    }
    if (latest.tds && latest.tds !== "N/A") {
      const ok = tds >= 0 && tds <= 500;
      recs.push({
        color: ok ? 'rgba(59,130,246,0.12)' : 'rgba(245,158,11,0.12)',
        border: ok ? 'rgba(59,130,246,0.25)' : 'rgba(245,158,11,0.25)',
        labelColor: ok ? 'text-blue-600 dark:text-blue-400' : 'text-amber-600 dark:text-amber-400',
        label: `TDS (${latest.tds}):`,
        text: ok
          ? 'Good mineral content for plant growth. Consider testing specific nutrients for specialised crops.'
          : 'High dissolved solids detected. Check your water source or use a filter before irrigation.',
      });
    }
    if (latest.temperature && latest.temperature !== "N/A") {
      recs.push({
        color: 'rgba(245,158,11,0.12)',
        border: 'rgba(245,158,11,0.25)',
        labelColor: 'text-amber-600 dark:text-amber-400',
        label: `Temperature (${latest.temperature}):`,
        text: 'Consider early morning irrigation to minimise evaporation and heat stress on plants.',
      });
    }
    return recs;
  };

  const recommendations = buildRecommendations();

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

            {/* ── Current Readings ── */}
            <div className="slide-in-right">
              <SectionHeader idx={0} />
              <div className="glass-card rounded-[1.25rem] p-5">
                {metrics.length === 0 ? (
                  <NoDataState message={"No sensor readings yet.\nConnect your ESP32 to see live water quality data."} />
                ) : (
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
                )}
              </div>
            </div>

            {/* ── Historical Data ── */}
            <div className="slide-in-left">
              <SectionHeader idx={1} />
              <div className="glass-card rounded-[1.25rem] p-5 overflow-x-auto">
                {history.length === 0 ? (
                  <NoDataState message="No historical data yet. Each ESP32 reading is stored and will appear here." />
                ) : (
                  <table className="w-full min-w-[440px]">
                    <thead>
                      <tr className="border-b divider">
                        {["Date", "Time", "pH Level", "TDS", "Temp"].map(h => (
                          <th key={h} className="py-2 px-3 text-left text-xs font-semibold card-label">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {history.map((entry, index) => (
                        <tr key={entry.id} className={index !== history.length - 1 ? "border-b divider" : ""}>
                          <td className="py-2.5 px-3 text-sm font-semibold card-value">{formatDate(entry.createdAt)}</td>
                          <td className="py-2.5 px-3 text-xs card-muted">{formatTime(entry.createdAt)}</td>
                          <td className="py-2.5 px-3 text-sm card-body">{entry.phLevel ?? "—"}</td>
                          <td className="py-2.5 px-3 text-sm card-body">{entry.tds ?? "—"}</td>
                          <td className="py-2.5 px-3 text-sm card-body">{entry.temperature ?? "—"}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>

            {/* ── Recommendations ── */}
            <div className="fade-in">
              <SectionHeader idx={2} />
              <div className="glass-card rounded-[1.25rem] p-5 space-y-3">
                {recommendations.length === 0 ? (
                  <NoDataState message="Recommendations will appear here once your ESP32 sends water quality readings." />
                ) : (
                  recommendations.map((r, i) => (
                    <div key={i} className="rounded-xl p-3" style={{ background: r.color, border: `1px solid ${r.border}` }}>
                      <p className="text-sm card-body"><strong className={r.labelColor}>{r.label}</strong> {r.text}</p>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* ── Reading Schedule ── */}
            <div className="scale-in">
              <SectionHeader idx={3} />
              <div className="glass-card rounded-[1.25rem] p-5 mb-4">
                <p className="text-sm card-body mb-4">Sensors are set to record measurements at these intervals:</p>
                <div className="space-y-3">
                  {[
                    { label: "Regular Readings", value: "Every 30 seconds" },
                    { label: "Irrigation Events", value: "Before & After" },
                    { label: "Weather Alerts",    value: "As needed" },
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
