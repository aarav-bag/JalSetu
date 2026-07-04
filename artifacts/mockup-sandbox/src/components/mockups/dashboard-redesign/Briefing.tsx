import "./_group.css";
import React from "react";
import {
  Droplets, Moon, Sun, Bell, Cpu, WifiOff,
  Leaf, Cloud, TrendingUp, 
  TestTube, Droplet, Scale, Thermometer, ArrowRight, CheckCircle2, AlertTriangle,
  Shrub, CloudRain, CloudSun, Umbrella, MapPin, RefreshCw,
  Brain, ChevronRight, Zap, FlaskConical, Lightbulb, Check, Sparkles,
  Home, BarChart2, Settings, Activity
} from "lucide-react";

function Header() {
  return (
    <header className="px-5 pt-8 pb-4 relative z-10">
      <div className="flex items-center justify-between">
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
          <div
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-full"
            style={{ background: "rgba(148,163,184,0.10)", border: "1px solid rgba(148,163,184,0.2)" }}
          >
            <Cpu className="h-3.5 w-3.5 text-slate-400" />
            <WifiOff className="h-3 w-3 text-slate-400" />
            <span className="text-[10px] font-semibold text-slate-400">ESP32 Offline</span>
          </div>
          
          <button className="h-10 w-10 rounded-2xl glass-tile flex items-center justify-center shadow-md relative">
            <Bell className="h-4 w-4 text-gray-600" />
            <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-red-400 ring-2 ring-white/50" />
          </button>
          <button className="h-10 w-10 rounded-2xl bg-gradient-to-br from-blue-500/80 to-cyan-500/80 backdrop-blur-md border border-white/30 flex items-center justify-center shadow-lg shadow-blue-500/20">
            <span className="text-white text-sm font-bold">A</span>
          </button>
        </div>
      </div>
    </header>
  );
}

function FeedItem({ 
  icon: Icon, 
  title, 
  time, 
  children, 
  iconBg, 
  iconColor, 
  isLast = false 
}: { 
  icon: any, 
  title: string, 
  time: string, 
  children: React.ReactNode, 
  iconBg: string, 
  iconColor: string,
  isLast?: boolean
}) {
  return (
    <div className="relative pl-6 pb-8">
      {/* Vertical line connecting feed items */}
      {!isLast && (
        <div className="absolute left-2.5 top-8 bottom-0 w-px bg-gradient-to-b from-blue-200/50 to-transparent" />
      )}
      
      {/* Icon node */}
      <div 
        className={`absolute left-0 top-1 h-5 w-5 rounded-full flex items-center justify-center border border-white z-10 ${iconColor}`}
        style={{ background: iconBg }}
      >
        <Icon className="h-3 w-3" style={{ color: "inherit" }} />
      </div>

      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-bold card-heading">{title}</h3>
        <span className="text-[10px] card-muted font-medium">{time}</span>
      </div>
      
      {children}
    </div>
  );
}

function BriefingFeed() {
  const forecast = [
    { day: "Today", temperature: "27°C", weather: "rainy" as const, rainChance: 80 },
    { day: "Sat", temperature: "29°C", weather: "partly-cloudy" as const, rainChance: 35 },
    { day: "Sun", temperature: "31°C", weather: "sunny" as const, rainChance: 5 },
  ];

  const weatherIcon = (type: string) => {
    switch (type) {
      case "sunny": return <Sun className="h-5 w-5 text-amber-500" />;
      case "rainy": return <CloudRain className="h-5 w-5 text-blue-500" />;
      case "partly-cloudy": return <CloudSun className="h-5 w-5 text-cyan-500" />;
      default: return <Cloud className="h-5 w-5 text-gray-400" />;
    }
  };

  return (
    <div className="px-5 py-2 relative z-10 flex-1">
      {/* Main Greeting */}
      <div className="mb-8 mt-2">
        <p className="text-sm font-medium text-gray-600 mb-1">Good morning, Aarav 👋</p>
        <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight leading-tight">
          Here is your <br />
          <span className="gradient-text">Friday Briefing</span>
        </h1>
        <p className="text-xs card-muted mt-2">July 4 · Farm Health is at 94%</p>
      </div>

      <div className="space-y-0">
        {/* Top Priority */}
        <FeedItem 
          icon={AlertTriangle} 
          title="Priority Action" 
          time="Just now"
          iconBg="#fee2e2" 
          iconColor="text-red-500"
        >
          <div className="glass-card rounded-2xl p-4" style={{ background: "rgba(254,226,226,0.4)", border: "1px solid rgba(239,68,68,0.3)" }}>
            <p className="text-sm font-bold text-red-900 mb-1">Irrigation overdue</p>
            <p className="text-xs text-red-800/80 leading-relaxed mb-3">
              Soil moisture in Field B dropped to 45%. Immediate irrigation is recommended to prevent crop stress.
            </p>
            <button className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-red-500 to-red-600 shadow-md shadow-red-500/20">
              <Droplets className="h-3.5 w-3.5" />
              Irrigate Field B (20m)
            </button>
          </div>
        </FeedItem>

        {/* Weather Narrative */}
        <FeedItem 
          icon={CloudRain} 
          title="Weather Forecast" 
          time="10:24 AM"
          iconBg="#e0f2fe" 
          iconColor="text-cyan-600"
        >
          <div className="glass-card rounded-2xl p-4">
            <p className="text-sm card-body leading-relaxed mb-4">
              <strong className="card-heading">Rain is expected today</strong> with an 80% chance of precipitation. It's advisable to hold off on scheduled watering to conserve resources.
            </p>
            
            <div className="flex gap-2">
              {forecast.map((day) => (
                <div key={day.day} className="flex-1 rounded-xl p-2 text-center" style={{ background: "rgba(255,255,255,0.4)" }}>
                  <p className="text-[10px] font-semibold card-label uppercase">{day.day}</p>
                  <div className="flex justify-center my-1.5">{weatherIcon(day.weather)}</div>
                  <p className="text-xs font-bold card-value">{day.temperature}</p>
                </div>
              ))}
            </div>
          </div>
        </FeedItem>

        {/* Farm Status Narrative */}
        <FeedItem 
          icon={Activity} 
          title="Farm Status" 
          time="Updated 10m ago"
          iconBg="#dcfce7" 
          iconColor="text-emerald-600"
        >
          <div className="glass-tile rounded-2xl p-4">
            <div className="flex items-start gap-3 mb-3">
              <div className="mt-1 h-2 w-2 rounded-full bg-emerald-500 shadow-sm shadow-emerald-500/60" />
              <p className="text-sm card-body leading-relaxed flex-1">
                <strong className="card-heading">Water quality is stable.</strong> pH level is optimal at 6.8 and TDS remains at 320 ppm.
              </p>
            </div>
            <div className="flex items-start gap-3">
              <div className="mt-1 h-2 w-2 rounded-full bg-emerald-500 shadow-sm shadow-emerald-500/60" />
              <p className="text-sm card-body leading-relaxed flex-1">
                <strong className="card-heading">Field A is healthy.</strong> Soil moisture is currently sitting perfectly at 68%.
              </p>
            </div>
          </div>
        </FeedItem>

        {/* Closing Action */}
        <FeedItem 
          icon={Lightbulb} 
          title="Smart Tip" 
          time="Daily insight"
          iconBg="#fef3c7" 
          iconColor="text-amber-500"
          isLast={true}
        >
          <div className="glass-card rounded-2xl p-4 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-10">
              <Brain className="h-16 w-16 text-amber-500" />
            </div>
            <div className="relative z-10">
              <div className="flex items-center gap-1.5 mb-2">
                <Sparkles className="h-4 w-4 text-amber-500" />
                <span className="text-xs font-bold text-amber-700">AI Suggestion</span>
              </div>
              <p className="text-sm card-body leading-relaxed mb-4">
                Based on current readings, consider watering crops tomorrow morning for optimal growth.
              </p>
              <button className="flex items-center text-xs font-bold text-amber-600 gap-1">
                View details <ArrowRight className="h-3 w-3" />
              </button>
            </div>
          </div>
        </FeedItem>
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

export function Briefing() {
  return (
    <div className="jalsetu-scope max-w-md mx-auto min-h-screen flex flex-col relative overflow-hidden page-bg pb-24">
      {/* Background orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="orb bg-blue-400/20 w-64 h-64 top-[-10%] left-[-10%]" />
        <div className="orb bg-cyan-400/20 w-80 h-80 top-[40%] right-[-20%]" />
        <div className="orb bg-indigo-400/10 w-72 h-72 bottom-[10%] left-[-10%]" />
      </div>

      <Header />
      <BriefingFeed />
      <BottomNavigation />
    </div>
  );
}
