import "./_group.css";
import React from "react";
import {
  Droplets, Moon, Sun, Bell, Cpu, WifiOff, Wifi,
  Leaf, Cloud, TrendingUp, Sunset,
  TestTube, Droplet, Scale, Thermometer, ArrowRight, CheckCircle2, AlertTriangle,
  Shrub, CloudRain, CloudSun, Umbrella, MapPin, RefreshCw,
  Brain, ChevronRight, Zap, FlaskConical, Lightbulb, Check, Sparkles,
  Home, BarChart2, Settings, Activity, Gauge
} from "lucide-react";

function Header() {
  return (
    <header className="px-5 pt-8 pb-4 relative z-10 flex items-center justify-between">
      <div className="flex items-center gap-2">
        <div className="h-8 w-8 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center shadow-lg shadow-blue-500/30">
          <Droplets className="h-4 w-4 text-white" />
        </div>
        <span className="text-xl font-bold tracking-tight">
          <span className="page-title">Jal</span>
          <span className="text-cyan-500 font-black">Setu</span>
        </span>
      </div>
      <div className="flex items-center gap-2">
        <button className="h-10 w-10 rounded-2xl glass-tile flex items-center justify-center shadow-md relative">
          <Bell className="h-4 w-4 text-gray-600" />
          <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-red-400 ring-2 ring-white/50" />
        </button>
        <button className="h-10 w-10 rounded-2xl bg-gradient-to-br from-blue-500/80 to-cyan-500/80 backdrop-blur-md border border-white/30 flex items-center justify-center shadow-lg">
          <span className="text-white text-sm font-bold">A</span>
        </button>
      </div>
    </header>
  );
}

function HeroCockpit() {
  const score = 88;
  const circumference = 2 * Math.PI * 54;
  const offset = circumference - (score / 100) * circumference;

  return (
    <div className="px-5 mb-4 relative z-10">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Farm Status</h2>
          <p className="text-sm page-subtitle">Aarav · Fri, Jul 4</p>
        </div>
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl" style={{ background: "rgba(148,163,184,0.10)", border: "1px solid rgba(148,163,184,0.2)" }}>
          <Cpu className="h-3.5 w-3.5 text-slate-400" />
          <span className="text-[11px] font-semibold text-slate-500">Offline (12m)</span>
        </div>
      </div>

      <div className="glass-hero rounded-[2rem] p-6 text-center relative overflow-hidden">
        {/* Large Gauge */}
        <div className="relative w-48 h-48 mx-auto mb-4">
          <div className="absolute inset-4 rounded-full blur-xl opacity-30 bg-emerald-500" />
          <svg className="w-full h-full -rotate-90 relative z-10" viewBox="0 0 120 120">
            <circle cx="60" cy="60" r="54" stroke="rgba(255,255,255,0.2)" strokeWidth="8" fill="none" />
            <circle 
              cx="60" cy="60" r="54" stroke="#10b981" strokeWidth="8" fill="none" strokeLinecap="round"
              strokeDasharray={circumference} strokeDashoffset={offset}
              style={{ filter: "drop-shadow(0 0 8px rgba(16,185,129,0.6))" }} 
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <Gauge className="h-5 w-5 text-emerald-600 mb-1 opacity-80" />
            <span className="text-5xl font-black text-gray-900 tracking-tighter leading-none">{score}</span>
            <span className="text-[11px] font-bold text-emerald-600 tracking-widest uppercase mt-1">Optimal</span>
          </div>
        </div>

        {/* Top Priority Action */}
        <div className="rounded-2xl p-4 text-left" style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.22)" }}>
          <div className="flex items-start gap-3">
            <div className="h-10 w-10 rounded-xl flex flex-shrink-0 items-center justify-center bg-red-100/50 text-red-600">
              <AlertTriangle className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[10px] font-black px-2 py-0.5 rounded-md bg-red-500 text-white uppercase tracking-wider">Urgent</span>
                <span className="text-sm font-bold text-gray-900">Irrigation Overdue</span>
              </div>
              <p className="text-xs text-gray-700 leading-tight mb-2">
                Field B moisture at 45%. Water for 20 mins to prevent stress.
              </p>
              <button className="text-xs font-bold text-red-600 flex items-center gap-1">
                Start Pump Now <ArrowRight className="h-3 w-3" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function SecondaryMetrics() {
  return (
    <div className="px-5 pb-28 relative z-10 grid grid-cols-2 gap-3">
      {/* Soil Tile */}
      <div className="glass-tile rounded-[1.5rem] p-4 flex flex-col justify-between cursor-pointer hover:bg-white/40 transition-colors">
        <div className="flex items-start justify-between mb-3">
          <div className="h-8 w-8 rounded-xl bg-emerald-100/50 flex items-center justify-center text-emerald-600">
            <Shrub className="h-4 w-4" />
          </div>
          <span className="text-lg font-black text-gray-900">68%</span>
        </div>
        <div>
          <h4 className="text-xs font-bold text-gray-900">Soil Moisture</h4>
          <p className="text-[10px] text-gray-500 mt-0.5">Field A: 68% · Field B: 45%</p>
        </div>
      </div>

      {/* Water Quality Tile */}
      <div className="glass-tile rounded-[1.5rem] p-4 flex flex-col justify-between cursor-pointer hover:bg-white/40 transition-colors">
        <div className="flex items-start justify-between mb-3">
          <div className="h-8 w-8 rounded-xl bg-blue-100/50 flex items-center justify-center text-blue-600">
            <TestTube className="h-4 w-4" />
          </div>
          <CheckCircle2 className="h-4 w-4 text-emerald-500" />
        </div>
        <div>
          <h4 className="text-xs font-bold text-gray-900">Water Quality</h4>
          <p className="text-[10px] text-gray-500 mt-0.5">pH 6.8 · TDS 320ppm</p>
        </div>
      </div>

      {/* Weather Tile */}
      <div className="glass-tile rounded-[1.5rem] p-4 flex flex-col justify-between cursor-pointer hover:bg-white/40 transition-colors">
        <div className="flex items-start justify-between mb-3">
          <div className="h-8 w-8 rounded-xl bg-indigo-100/50 flex items-center justify-center text-indigo-600">
            <CloudRain className="h-4 w-4" />
          </div>
          <span className="text-lg font-black text-gray-900">27°</span>
        </div>
        <div>
          <h4 className="text-xs font-bold text-gray-900">Rain Expected</h4>
          <p className="text-[10px] text-gray-500 mt-0.5">80% chance today</p>
        </div>
      </div>

      {/* Smart Tip Tile */}
      <div className="glass-tile rounded-[1.5rem] p-4 flex flex-col justify-between cursor-pointer hover:bg-white/40 transition-colors">
        <div className="flex items-start justify-between mb-3">
          <div className="h-8 w-8 rounded-xl bg-amber-100/50 flex items-center justify-center text-amber-600">
            <Lightbulb className="h-4 w-4" />
          </div>
          <Sparkles className="h-4 w-4 text-amber-500" />
        </div>
        <div>
          <h4 className="text-xs font-bold text-gray-900">Smart Tip</h4>
          <p className="text-[10px] text-gray-500 mt-0.5">Water tomorrow morning</p>
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
    <div className="fixed bottom-6 left-0 right-0 z-50 flex justify-center px-6 pointer-events-none">
      <div className="max-w-xs w-full glass-nav rounded-[2rem] px-4 py-3 flex items-center justify-around pointer-events-auto">
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

export function Cockpit() {
  return (
    <div className="jalsetu-scope max-w-md mx-auto min-h-screen flex flex-col relative overflow-hidden page-bg">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="orb w-96 h-96 bg-blue-400/20 -top-20 -left-20" />
        <div className="orb w-80 h-80 bg-cyan-400/20 top-40 -right-20" />
        <div className="orb w-96 h-96 bg-indigo-400/20 -bottom-32 -left-32" />
      </div>

      <Header />
      <div className="flex-1 overflow-y-auto pb-6">
        <HeroCockpit />
        <SecondaryMetrics />
      </div>
      <BottomNavigation />
    </div>
  );
}
