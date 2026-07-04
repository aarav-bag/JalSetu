import "./_group.css";
import {
  Droplets, Moon, Sun, Bell, Cpu, WifiOff, Wifi,
  Leaf, Cloud, TrendingUp, Sunset,
  TestTube, Droplet, Scale, Thermometer, ArrowRight, CheckCircle2, AlertTriangle,
  Shrub,
  CloudRain, CloudSun, Umbrella, MapPin, RefreshCw,
  Brain, ChevronRight, Zap, FlaskConical,
  Lightbulb, Check, Sparkles,
  Home, BarChart2, Settings,
} from "lucide-react";

function Header() {
  return (
    <header className="px-5 pt-8 pb-4 relative z-10">
      <div className="flex items-center justify-between">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <div className="h-8 w-8 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center shadow-lg shadow-blue-500/30">
              <Droplets className="h-4 w-4 text-white" />
            </div>
            <span className="text-xl font-bold tracking-tight">
              <span className="page-title">Jal</span>
              <span className="text-cyan-500 font-black">Setu</span>
            </span>
          </div>
          <div className="flex items-center gap-2">
            <p className="text-xs page-subtitle font-medium">Good morning — Fri, Jul 4</p>
            <span className="text-xs font-mono text-blue-600 bg-blue-100/60 backdrop-blur-sm px-2 py-0.5 rounded-full border border-blue-200/60">10:24 AM</span>
          </div>
        </div>

        <div className="flex items-center gap-2 ml-3">
          <button className="relative h-10 w-10 rounded-2xl glass-tile flex items-center justify-center shadow-md">
            <Bell className="h-4 w-4 text-gray-600" />
            <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-red-400 ring-2 ring-white/50" />
          </button>
          <button className="h-10 w-10 rounded-2xl glass-tile flex items-center justify-center shadow-md">
            <Moon className="h-4 w-4 text-indigo-600" />
          </button>
          <button className="h-10 w-10 rounded-2xl bg-gradient-to-br from-blue-500/80 to-cyan-500/80 backdrop-blur-md border border-white/30 flex items-center justify-center shadow-lg shadow-blue-500/20">
            <span className="text-white text-sm font-bold">A</span>
          </button>
        </div>
      </div>
    </header>
  );
}

function Esp32Badge() {
  return (
    <div
      className="flex items-center gap-2 px-3 py-2 rounded-2xl"
      style={{ background: "rgba(148,163,184,0.10)", border: "1px solid rgba(148,163,184,0.2)" }}
    >
      <Cpu className="h-4 w-4 text-slate-400" />
      <WifiOff className="h-3.5 w-3.5 text-slate-400" />
      <span className="text-xs font-semibold text-slate-400">ESP32 Offline</span>
      <span className="text-xs card-muted">· 12m ago</span>
    </div>
  );
}

function WelcomeCard() {
  const quickStats = [
    { label: "Farm Health", value: "94%", icon: TrendingUp, color: "text-emerald-600" },
    { label: "Water Level", value: "78%", icon: Droplets, color: "text-blue-600" },
    { label: "Crop Stage", value: "Grow", icon: Leaf, color: "text-green-600" },
  ];

  return (
    <div className="mb-2">
      <div className="glass-hero rounded-[1.75rem] overflow-hidden relative">
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/60 to-transparent" />
        <div className="absolute top-0 left-[10%] w-[40%] h-16 bg-white/10 rounded-full blur-2xl" />

        <div className="relative z-10 p-6">
          <div className="flex items-start justify-between mb-5">
            <div>
              <p className="text-sm font-medium text-gray-700 mb-1">Good morning</p>
              <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Aarav 👋</h2>
              <p className="text-xs text-gray-500 mt-1">Friday, July 4</p>
            </div>
            <div className="h-14 w-14 rounded-2xl glass-tile flex items-center justify-center">
              <Sun className="h-7 w-7 text-blue-600" />
            </div>
          </div>

          <div className="flex items-center gap-2 mb-5">
            <div className="h-2 w-2 rounded-full bg-emerald-500 shadow-sm shadow-emerald-500/60 animate-pulse" />
            <span className="text-sm font-semibold text-gray-700">Farm Active</span>
          </div>

          <div className="grid grid-cols-3 gap-3">
            {quickStats.map((stat) => (
              <div key={stat.label} className="glass-tile rounded-2xl p-3 text-center">
                <stat.icon className={`h-4 w-4 ${stat.color} mx-auto mb-1`} />
                <div className="text-gray-900 font-bold text-base">{stat.value}</div>
                <div className="text-gray-500 text-[10px] font-medium">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function WaterQualityCard() {
  const metrics = [
    { name: "pH Level", value: "6.8", status: "Good", icon: Droplet, bg: "rgba(59,130,246,0.15)", border: "rgba(59,130,246,0.3)" },
    { name: "TDS", value: "320", unit: "ppm", status: "Good", icon: Scale, bg: "rgba(168,85,247,0.15)", border: "rgba(168,85,247,0.3)" },
    { name: "Temp", value: "28°C", status: "Warm", icon: Thermometer, bg: "rgba(249,115,22,0.15)", border: "rgba(249,115,22,0.3)" },
  ];

  const statusStyle = (status: string) =>
    status === "Good"
      ? { Icon: CheckCircle2, color: "text-emerald-600", bg: "rgba(16,185,129,0.12)", border: "rgba(16,185,129,0.25)" }
      : { Icon: AlertTriangle, color: "text-amber-600", bg: "rgba(245,158,11,0.12)", border: "rgba(245,158,11,0.25)" };

  return (
    <div className="mb-2">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-bold card-heading flex items-center gap-2">
          <div className="h-7 w-7 rounded-xl flex items-center justify-center" style={{ background: "rgba(59,130,246,0.15)", border: "1px solid rgba(59,130,246,0.3)" }}>
            <TestTube className="h-4 w-4 text-blue-600" />
          </div>
          Water Quality
        </h3>
        <span className="text-xs font-semibold text-blue-600 flex items-center gap-1">
          View all <ArrowRight className="h-3 w-3" />
        </span>
      </div>

      <div className="glass-card rounded-[1.5rem] p-5">
        <div className="grid grid-cols-3 gap-3">
          {metrics.map((metric) => {
            const s = statusStyle(metric.status);
            return (
              <div key={metric.name} className="glass-tile rounded-2xl p-4 flex flex-col items-center gap-2">
                <div className="h-10 w-10 rounded-xl flex items-center justify-center" style={{ background: metric.bg, border: `1px solid ${metric.border}` }}>
                  <metric.icon className="h-5 w-5" style={{ color: "inherit" }} />
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold card-value leading-none">{metric.value}</div>
                  {metric.unit && <div className="text-[10px] card-muted mt-0.5">{metric.unit}</div>}
                  <div className="text-[10px] card-label font-medium mt-1">{metric.name}</div>
                </div>
                <div className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold ${s.color}`} style={{ background: s.bg, border: `1px solid ${s.border}` }}>
                  <s.Icon className="h-2.5 w-2.5" />
                  {metric.status}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function SoilMoistureCard() {
  const displayLevel = 68;
  const circumference = 2 * Math.PI * 36;
  const offset = circumference - (displayLevel / 100) * circumference;
  const readings = [
    { id: 1, name: "Field A", value: 68, colorClass: "text-emerald-600", bg: "rgba(16,185,129,0.12)", border: "rgba(16,185,129,0.3)" },
    { id: 2, name: "Field B", value: 45, colorClass: "text-amber-600", bg: "rgba(245,158,11,0.12)", border: "rgba(245,158,11,0.3)" },
  ];

  return (
    <div className="mb-2">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-bold card-heading flex items-center gap-2">
          <div className="h-7 w-7 rounded-xl flex items-center justify-center" style={{ background: "rgba(16,185,129,0.15)", border: "1px solid rgba(16,185,129,0.3)" }}>
            <Shrub className="h-4 w-4 text-emerald-600" />
          </div>
          Soil Moisture
        </h3>
        <span className="text-xs font-semibold text-blue-600 flex items-center gap-1">
          View all <ArrowRight className="h-3 w-3" />
        </span>
      </div>

      <div className="glass-card rounded-[1.5rem] p-5">
        <div className="flex items-center gap-5">
          <div className="relative flex-shrink-0 w-28 h-28">
            <div className="absolute inset-2 rounded-full blur-md opacity-20" style={{ background: "#10b981" }} />
            <svg className="w-28 h-28 -rotate-90 relative z-10" viewBox="0 0 88 88">
              <circle cx="44" cy="44" r="36" stroke="rgba(128,128,128,0.2)" strokeWidth="7" fill="none" />
              <circle cx="44" cy="44" r="36" stroke="#10b981" strokeWidth="7" fill="none" strokeLinecap="round"
                strokeDasharray={circumference} strokeDashoffset={offset}
                style={{ filter: "drop-shadow(0 0 6px #10b981)" }} />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-2xl font-bold leading-none text-emerald-600">{displayLevel}%</span>
              <span className="text-[9px] card-muted font-semibold mt-1 tracking-wider uppercase">moisture</span>
            </div>
          </div>

          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold card-heading mb-1 truncate">Ideal Moisture Level</p>
            <p className="text-xs card-body mb-3 leading-relaxed">Levels within recommended range for optimal crop growth.</p>
            <div className="flex flex-wrap gap-1.5">
              {readings.map((field) => (
                <span key={field.id} className={`px-2.5 py-1 rounded-xl text-xs font-semibold ${field.colorClass}`} style={{ background: field.bg, border: `1px solid ${field.border}` }}>
                  {field.name}: {field.value}%
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-4 pt-4 border-t divider">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs card-label">Moisture level</span>
            <span className="text-xs font-bold text-emerald-600">{displayLevel}%</span>
          </div>
          <div className="h-1.5 rounded-full overflow-hidden bg-gray-200/60">
            <div className="h-full rounded-full bg-emerald-500" style={{ width: `${displayLevel}%`, boxShadow: "0 0 8px #10b981" }} />
          </div>
          <div className="flex justify-between mt-1">
            <span className="text-[10px] card-muted">Dry</span>
            <span className="text-[10px] card-muted">Optimal 60–80%</span>
            <span className="text-[10px] card-muted">Wet</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function WaterPredictionCard() {
  const forecast = [
    { day: "Today", temperature: "27°C", weather: "rainy" as const, rainChance: 80 },
    { day: "Sat", temperature: "29°C", weather: "partly-cloudy" as const, rainChance: 35 },
    { day: "Sun", temperature: "31°C", weather: "sunny" as const, rainChance: 5 },
  ];

  const weatherIcon = (type: string) => {
    switch (type) {
      case "sunny": return <Sun className="h-6 w-6 text-amber-500" />;
      case "rainy": return <CloudRain className="h-6 w-6 text-blue-500" />;
      case "partly-cloudy": return <CloudSun className="h-6 w-6 text-cyan-500" />;
      default: return <Cloud className="h-6 w-6 text-gray-400" />;
    }
  };

  return (
    <div className="mb-2">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-bold card-heading flex items-center gap-2">
          <div className="h-7 w-7 rounded-xl flex items-center justify-center" style={{ background: "rgba(59,130,246,0.15)", border: "1px solid rgba(59,130,246,0.3)" }}>
            <Cloud className="h-4 w-4 text-blue-600" />
          </div>
          Weather Prediction
        </h3>
        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1 text-[10px] font-semibold text-emerald-600 px-2 py-0.5 rounded-full" style={{ background: "rgba(16,185,129,0.12)", border: "1px solid rgba(16,185,129,0.25)" }}>
            <MapPin className="h-2.5 w-2.5" />
            Nashik
          </span>
          <button className="h-6 w-6 rounded-xl glass-tile flex items-center justify-center">
            <RefreshCw className="h-3 w-3 card-label" />
          </button>
        </div>
      </div>

      <div className="glass-card rounded-[1.5rem] p-5">
        <div className="flex items-start gap-3 p-3 rounded-2xl mb-4" style={{ background: "rgba(59,130,246,0.10)", border: "1px solid rgba(59,130,246,0.22)" }}>
          <div className="h-8 w-8 flex-shrink-0 rounded-xl gradient-blue flex items-center justify-center shadow-md">
            <Umbrella className="h-4 w-4 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold card-heading leading-tight">Rain expected today</p>
            <p className="text-xs card-body mt-0.5 leading-relaxed">Skip irrigation for the next 24 hours to conserve water.</p>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2">
          {forecast.map((day) => (
            <div key={day.day} className="glass-tile rounded-2xl p-3 text-center">
              <p className="text-[10px] font-semibold card-label uppercase tracking-wider mb-2">{day.day}</p>
              <div className="flex justify-center mb-2">{weatherIcon(day.weather)}</div>
              <p className="text-sm font-bold card-value mb-1">{day.temperature}</p>
              <div className="flex items-center justify-center gap-0.5 text-[10px] font-semibold text-blue-600">
                <CloudRain className="h-2.5 w-2.5" />{day.rainChance}%
              </div>
            </div>
          ))}
        </div>

        <div className="flex items-center justify-between mt-4 pt-3 border-t divider">
          <p className="text-[10px] card-muted flex items-center gap-1">
            Powered by <span className="font-semibold card-label">Open-Meteo</span> · Free &amp; accurate
          </p>
          <span className="text-xs font-semibold text-blue-600 flex items-center gap-1">
            Details <ArrowRight className="h-3 w-3" />
          </span>
        </div>
      </div>
    </div>
  );
}

function RecommendationsCard() {
  const recs = [
    { id: "1", priority: "high" as const, title: "Irrigation overdue", description: "Soil moisture in Field B has dropped below the safe threshold for the past 6 hours. Immediate irrigation is recommended to prevent crop stress.", action: "Irrigate Field B for 20 minutes within the next 2 hours.", icon: AlertTriangle, metric: "45%", confidence: 92 },
    { id: "2", priority: "medium" as const, title: "Rain expected — hold off watering", description: "Weather forecast shows an 80% chance of rain today. Delaying irrigation will conserve water without affecting crop health.", action: "Skip scheduled irrigation today.", icon: CloudRain, metric: "80%", confidence: 85 },
    { id: "3", priority: "low" as const, title: "Water quality stable", description: "pH and TDS readings remain within the optimal range across all sensors.", action: "No action needed — continue current schedule.", icon: FlaskConical, confidence: 97 },
  ];

  const styles = {
    high: { card: "rgba(239,68,68,0.08)", border: "rgba(239,68,68,0.22)", badge: "text-red-600", badgeBg: "rgba(239,68,68,0.12)", badgeBr: "rgba(239,68,68,0.28)", icon: "text-red-500", iconBg: "rgba(239,68,68,0.14)" },
    medium: { card: "rgba(245,158,11,0.08)", border: "rgba(245,158,11,0.22)", badge: "text-amber-600", badgeBg: "rgba(245,158,11,0.12)", badgeBr: "rgba(245,158,11,0.28)", icon: "text-amber-500", iconBg: "rgba(245,158,11,0.14)" },
    low: { card: "rgba(16,185,129,0.06)", border: "rgba(16,185,129,0.18)", badge: "text-emerald-600", badgeBg: "rgba(16,185,129,0.10)", badgeBr: "rgba(16,185,129,0.25)", icon: "text-emerald-500", iconBg: "rgba(16,185,129,0.14)" },
  };

  return (
    <div className="mb-2">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-bold card-heading flex items-center gap-2">
          <div className="h-7 w-7 rounded-xl flex items-center justify-center" style={{ background: "rgba(139,92,246,0.18)", border: "1px solid rgba(139,92,246,0.35)" }}>
            <Brain className="h-4 w-4 text-violet-600" />
          </div>
          AI Recommendations
          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full text-red-600" style={{ background: "rgba(239,68,68,0.12)", border: "1px solid rgba(239,68,68,0.25)" }}>
            1 urgent
          </span>
        </h3>
        <button className="h-7 w-7 rounded-xl glass-tile flex items-center justify-center">
          <RefreshCw className="h-3.5 w-3.5 card-label" />
        </button>
      </div>

      <div className="glass-card rounded-[1.5rem] p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="h-7 w-7 rounded-xl flex items-center justify-center" style={{ background: "linear-gradient(135deg,rgba(139,92,246,0.8),rgba(99,102,241,0.8))", border: "1px solid rgba(255,255,255,0.2)" }}>
              <Zap className="h-3.5 w-3.5 text-white" />
            </div>
            <div>
              <p className="text-xs font-bold card-heading">Smart Rule Engine</p>
              <p className="text-[10px] card-muted">Updated at 10:20 AM</p>
            </div>
          </div>
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full text-violet-600" style={{ background: "rgba(139,92,246,0.12)", border: "1px solid rgba(139,92,246,0.28)" }}>
            FREE
          </span>
        </div>

        <div className="space-y-2.5">
          {recs.map((rec) => (
            <div key={rec.id} className="rounded-2xl overflow-hidden" style={{ background: styles[rec.priority].card, border: `1px solid ${styles[rec.priority].border}` }}>
              <div className="w-full text-left p-3.5 flex items-start gap-3">
                <div className={`h-9 w-9 rounded-xl flex items-center justify-center flex-shrink-0 ${styles[rec.priority].icon}`} style={{ background: styles[rec.priority].iconBg }}>
                  <rec.icon className="h-4.5 w-4.5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-sm font-bold card-heading leading-tight">{rec.title}</p>
                    <div className="flex items-center gap-1.5 flex-shrink-0 mt-0.5">
                      {rec.metric && (
                        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${styles[rec.priority].badge}`} style={{ background: styles[rec.priority].badgeBg, border: `1px solid ${styles[rec.priority].badgeBr}` }}>
                          {rec.metric}
                        </span>
                      )}
                      <ChevronRight className="h-3.5 w-3.5 card-muted" />
                    </div>
                  </div>
                  <p className="text-[11px] card-body truncate mt-0.5">{rec.description.slice(0, 70)}…</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        <p className="text-[10px] card-muted text-center mt-3">
          Based on live sensor readings · Updated every 10 min · 100% free
        </p>
      </div>
    </div>
  );
}

function SmartIrrigationTipCard() {
  return (
    <div className="mb-24">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-bold card-heading flex items-center gap-2">
          <div className="h-7 w-7 rounded-xl flex items-center justify-center" style={{ background: "rgba(245,158,11,0.18)", border: "1px solid rgba(245,158,11,0.35)" }}>
            <Lightbulb className="h-4 w-4 text-amber-600" />
          </div>
          Irrigation Tip
        </h3>
      </div>

      <div className="glass-card rounded-[1.5rem] p-5">
        <div className="flex items-center gap-3 mb-4">
          <div className="h-9 w-9 rounded-xl flex items-center justify-center shadow-md flex-shrink-0" style={{ background: "linear-gradient(135deg, rgba(251,191,36,0.9), rgba(249,115,22,0.9))", border: "1px solid rgba(251,191,36,0.4)" }}>
            <Sparkles className="h-5 w-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold card-heading">AI-Powered Suggestion</span>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold text-amber-600" style={{ background: "rgba(245,158,11,0.12)", border: "1px solid rgba(245,158,11,0.3)" }}>
                <Zap className="h-2.5 w-2.5" />SMART
              </span>
            </div>
            <p className="text-[10px] card-muted">Updated just now</p>
          </div>
        </div>

        <div className="rounded-2xl p-4 mb-4" style={{ background: "rgba(245,158,11,0.08)", border: "1px solid rgba(245,158,11,0.2)" }}>
          <p className="text-sm card-body leading-relaxed">
            Based on soil moisture and weather forecast, consider watering your crops tomorrow morning for optimal growth.
          </p>
        </div>

        <div className="flex gap-2">
          <button className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold text-emerald-700" style={{ background: "rgba(16,185,129,0.18)", border: "1px solid rgba(16,185,129,0.35)" }}>
            <Check className="h-4 w-4 text-emerald-600" />
            Apply
          </button>
          <button className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold card-body glass-tile">
            View details
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

function BottomNavigation() {
  const navItems = [
    { name: "Home", icon: Home, active: true },
    { name: "Reports", icon: BarChart2, active: false },
    { name: "Alerts", icon: Bell, active: false },
    { name: "Settings", icon: Settings, active: false },
  ];

  return (
    <div className="absolute bottom-6 left-0 right-0 z-50 flex justify-center px-6">
      <div className="max-w-xs w-full glass-nav rounded-[2rem] px-4 py-3 flex items-center justify-around">
        {navItems.map((item) => (
          <button key={item.name} className="flex flex-col items-center gap-1 bg-transparent border-0 p-0">
            <div className={`p-2.5 rounded-2xl ${item.active ? "bg-gradient-to-br from-blue-500/90 to-cyan-500/90 shadow-lg shadow-blue-500/30 scale-110 border border-white/30" : ""}`}>
              <item.icon className={`h-5 w-5 ${item.active ? "text-white" : "text-gray-500"}`} />
            </div>
            <span className={`text-[10px] font-semibold tracking-wide ${item.active ? "text-blue-400" : "text-gray-400"}`}>
              {item.name}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}

export function Current() {
  return (
    <div className="jalsetu-scope max-w-md mx-auto min-h-screen flex flex-col relative overflow-hidden page-bg">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="orb top-[-80px] left-[-60px] w-72 h-72 bg-blue-400 opacity-20" />
        <div className="orb top-[30%] right-[-80px] w-64 h-64 bg-cyan-300 opacity-15" />
        <div className="orb top-[55%] left-[-40px] w-56 h-56 bg-emerald-400 opacity-10" />
        <div className="orb bottom-[-60px] right-[20%] w-72 h-72 bg-indigo-400 opacity-15" />
        <div className="orb bottom-[25%] left-[30%] w-48 h-48 bg-purple-400 opacity-10" />
      </div>

      <Header />
      <main className="flex-1 px-4 pt-1 pb-28 relative z-10">
        <div className="space-y-4 mt-2">
          <Esp32Badge />
          <WelcomeCard />
          <WaterQualityCard />
          <SoilMoistureCard />
          <WaterPredictionCard />
          <RecommendationsCard />
          <SmartIrrigationTipCard />
        </div>
      </main>
      <BottomNavigation />
    </div>
  );
}
