import { Home, BarChart2, Bell, Settings } from "lucide-react";
import { useLocation, Link } from "wouter";
import { useLanguage } from "@/context/LanguageContext";

const BottomNavigation = () => {
  const [location] = useLocation();
  const { t } = useLanguage();

  const navItems = [
    { name: t.home, icon: Home, path: "/" },
    { name: t.reports, icon: BarChart2, path: "/reports" },
    { name: t.alerts, icon: Bell, path: "/alerts" },
    { name: t.settings, icon: Settings, path: "/settings" },
  ];

  return (
    <div className="fixed bottom-6 left-0 right-0 z-50 flex justify-center px-6">
      <div className="max-w-xs w-full bg-white/15 backdrop-blur-2xl border border-white/25 rounded-[2rem] shadow-2xl shadow-black/30 px-4 py-3 flex items-center justify-around">
        {navItems.map((item) => {
          const isActive = location === item.path;
          return (
            <Link key={item.name} href={item.path}>
              <div className="flex flex-col items-center gap-1 cursor-pointer group">
                <div className={`p-2.5 rounded-2xl transition-all duration-300 ${
                  isActive
                    ? 'bg-gradient-to-br from-blue-400/90 to-cyan-400/90 shadow-lg shadow-blue-500/40 scale-110 border border-white/30'
                    : 'hover:bg-white/15 hover:scale-105'
                }`}>
                  <item.icon className={`h-5 w-5 transition-colors duration-200 ${
                    isActive ? 'text-white' : 'text-white/50 group-hover:text-white/80'
                  }`} />
                </div>
                <span className={`text-[10px] font-semibold tracking-wide transition-colors duration-200 ${
                  isActive ? 'text-cyan-300' : 'text-white/40 group-hover:text-white/70'
                }`}>
                  {item.name}
                </span>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
};

export default BottomNavigation;
