import "./_group.css";
import React from "react";
import {
  Droplets,
  Moon,
  Bell,
  Cpu,
  Wifi,
  Leaf,
  CloudRain,
  TestTube,
  Thermometer,
  Shrub,
  AlertTriangle,
  FlaskConical,
  Zap,
  Lightbulb,
  Check,
  Home,
  BarChart2,
  Settings,
  ArrowUpRight,
  ArrowDownRight,
  TrendingUp,
  Droplet
} from "lucide-react";

function Header() {
  return (
    <header className="px-5 pt-8 pb-4 relative z-10">
      <div className="flex items-center justify-between">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
              Aarav 👋
            </span>
          </div>
          <div className="flex items-center gap-2">
            <p className="text-xs page-subtitle font-medium">Friday, July 4</p>
            <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full" style={{ background: "rgba(148,163,184,0.10)", border: "1px solid rgba(148,163,184,0.2)" }}>
              <Cpu className="h-3 w-3 text-emerald-500" />
              <Wifi className="h-2.5 w-2.5 text-emerald-500" />
              <span className="text-[10px] font-bold text-emerald-600">Online</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 ml-3">
          <button className="relative h-10 w-10 rounded-2xl glass-tile flex items-center justify-center shadow-md">
            <Bell className="h-4 w-4 text-gray-600 dark:text-gray-300" />
            <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-red-400 ring-2 ring-white/50" />
          </button>
          <button className="h-10 w-10 rounded-2xl glass-tile flex items-center justify-center shadow-md">
            <Moon className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
          </button>
        </div>
      </div>
    </header>
  );
}

function Sparkline({ data, color, type = "line" }: { data: number[]; color: string; type?: "line" | "bar" }) {
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const height = 24;
  const width = 60;
  
  if (type === "bar") {
    return (
      <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} className="overflow-visible">
        {data.map((d, i) => {
          const h = Math.max(2, ((d - min) / range) * height);
          const x = (i / (data.length - 1)) * (width - 4);
          const y = height - h;
          return (
            <rect key={i} x={x} y={y} width="4" height={h} rx="2" fill={color} opacity={0.8} />
          );
        })}
      </svg>
    );
  }

  const points = data.map((d, i) => {
    const x = (i / (data.length - 1)) * width;
    const y = height - ((d - min) / range) * height;
    return `${x},${y}`;
  }).join(" ");

  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} className="overflow-visible">
      <polyline points={points} fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function ScorecardGrid() {
  const metrics = [
    {
      id: "health",
      title: "Farm Health",
      value: "94%",
      trend: "+2.1%",
      trendUp: true,
      icon: TrendingUp,
      color: "text-emerald-600",
      bg: "rgba(16,185,129,0.12)",
      border: "rgba(16,185,129,0.3)",
      sparkline: [88, 89, 90, 89, 92, 94, 94],
      sparklineColor: "#10b981",
      sparklineType: "line" as const
    },
    {
      id: "moisture",
      title: "Soil Moisture",
      value: "68%",
      trend: "-5.4%",
      trendUp: false,
      icon: Shrub,
      color: "text-amber-600",
      bg: "rgba(245,158,11,0.12)",
      border: "rgba(245,158,11,0.3)",
      sparkline: [82, 80, 75, 71, 68, 69, 68],
      sparklineColor: "#f59e0b",
      sparklineType: "bar" as const
    },
    {
      id: "water",
      title: "Water Quality",
      value: "Good",
      subtitle: "pH 6.8 · TDS 320",
      trend: "Stable",
      trendUp: true,
      icon: TestTube,
      color: "text-blue-600",
      bg: "rgba(59,130,246,0.12)",
      border: "rgba(59,130,246,0.3)",
      sparkline: [6.5, 6.6, 6.7, 6.8, 6.8, 6.9, 6.8],
      sparklineColor: "#3b82f6",
      sparklineType: "line" as const
    },
    {
      id: "weather",
      title: "Weather",
      value: "27°C",
      subtitle: "80% rain today",
      trend: "-2°C",
      trendUp: false,
      icon: CloudRain,
      color: "text-cyan-600",
      bg: "rgba(6,182,212,0.12)",
      border: "rgba(6,182,212,0.3)",
      sparkline: [31, 30, 29, 28, 27, 28, 27],
      sparklineColor: "#06b6d4",
      sparklineType: "line" as const
    }
  ];

  return (
    <div className="px-5 mb-6">
      <div className="grid grid-cols-2 gap-3">
        {metrics.map((m) => (
          <div key={m.id} className="glass-card rounded-[1.25rem] p-4 flex flex-col relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-3 opacity-20 pointer-events-none">
              <m.icon className={`h-12 w-12 ${m.color}`} />
            </div>
            
            <div className="flex items-start justify-between mb-3 relative z-10">
              <div className="h-8 w-8 rounded-xl flex items-center justify-center" style={{ background: m.bg, border: `1px solid ${m.border}` }}>
                <m.icon className={`h-4 w-4 ${m.color}`} />
              </div>
              <div className={`flex items-center gap-0.5 text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-white/50 dark:bg-black/20 ${m.trend === 'Stable' ? 'text-gray-500' : m.trendUp ? 'text-emerald-600' : 'text-amber-600'}`}>
                {m.trend !== 'Stable' && (m.trendUp ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />)}
                {m.trend}
              </div>
            </div>
            
            <div className="relative z-10 mb-3">
              <p className="text-[11px] font-bold card-label uppercase tracking-wider mb-0.5">{m.title}</p>
              <div className="flex items-baseline gap-1">
                <p className="text-2xl font-black card-value tracking-tight leading-none">{m.value}</p>
              </div>
              {m.subtitle && <p className="text-[10px] font-medium card-muted mt-1">{m.subtitle}</p>}
            </div>

            <div className="mt-auto relative z-10 pt-2 border-t divider flex items-end justify-between">
              <div className="text-[9px] font-medium card-muted">7 days</div>
              <Sparkline data={m.sparkline} color={m.sparklineColor} type={m.sparklineType} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function ActionItems() {
  const actions = [
    {
      id: "tip-1",
      type: "tip",
      priority: "high",
      title: "Irrigation overdue",
      desc: "Field B moisture at 45%. Water for 20 mins soon.",
      icon: Shrub,
      actionText: "Water Field B",
      bg: "rgba(239,68,68,0.08)",
      border: "rgba(239,68,68,0.22)",
      iconColor: "text-red-500",
      iconBg: "rgba(239,68,68,0.14)"
    },
    {
      id: "tip-2",
      type: "smart",
      priority: "medium",
      title: "Rain Expected",
      desc: "80% chance of rain today. Skip scheduled watering.",
      icon: CloudRain,
      actionText: "Skip Schedule",
      bg: "rgba(59,130,246,0.08)",
      border: "rgba(59,130,246,0.22)",
      iconColor: "text-blue-500",
      iconBg: "rgba(59,130,246,0.14)"
    },
    {
      id: "tip-3",
      type: "info",
      priority: "low",
      title: "Water quality stable",
      desc: "pH and TDS readings are optimal.",
      icon: FlaskConical,
      actionText: "View Details",
      bg: "rgba(16,185,129,0.06)",
      border: "rgba(16,185,129,0.18)",
      iconColor: "text-emerald-500",
      iconBg: "rgba(16,185,129,0.14)"
    }
  ];

  return (
    <div className="px-5 mb-24">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-bold card-heading flex items-center gap-2">
          Action Items
          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full text-white bg-red-500 shadow-sm shadow-red-500/30">
            2 pending
          </span>
        </h3>
      </div>
      
      <div className="flex flex-col gap-2">
        {actions.map((action) => (
          <div key={action.id} className="glass-card rounded-[1.25rem] p-3.5 flex items-start gap-3" style={{ background: action.bg, border: `1px solid ${action.border}` }}>
            <div className={`h-10 w-10 rounded-xl flex items-center justify-center flex-shrink-0 ${action.iconColor}`} style={{ background: action.iconBg }}>
              {action.type === 'smart' ? <Zap className="h-5 w-5" /> : <action.icon className="h-5 w-5" />}
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex justify-between items-start mb-0.5">
                <p className="text-sm font-bold card-heading leading-tight">{action.title}</p>
                {action.type === 'smart' && (
                  <span className="text-[9px] font-black px-1.5 py-0.5 rounded uppercase tracking-wider text-blue-600 bg-blue-500/10 border border-blue-500/20">AI Tip</span>
                )}
              </div>
              <p className="text-xs card-body leading-snug mb-2">{action.desc}</p>
              
              <button className={`w-full py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-transform active:scale-95 ${
                action.priority === 'high' ? 'bg-red-500 text-white shadow-md shadow-red-500/20' : 
                action.priority === 'medium' ? 'bg-blue-500 text-white shadow-md shadow-blue-500/20' : 
                'glass-tile card-heading'
              }`}>
                {action.priority !== 'low' && <Check className="h-3.5 w-3.5" />}
                {action.actionText}
              </button>
            </div>
          </div>
        ))}
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

export function Scorecard() {
  return (
    <div className="jalsetu-scope max-w-md mx-auto min-h-screen flex flex-col relative overflow-hidden page-bg">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="orb w-96 h-96 bg-blue-400/20 top-[-10%] left-[-20%]" />
        <div className="orb w-80 h-80 bg-cyan-400/20 bottom-[10%] right-[-10%]" />
        <div className="orb w-64 h-64 bg-indigo-400/10 top-[40%] left-[20%]" />
      </div>

      <div className="relative z-10 flex-1 overflow-y-auto pb-20 no-scrollbar">
        <Header />
        <ScorecardGrid />
        <ActionItems />
      </div>

      <BottomNavigation />
    </div>
  );
}
