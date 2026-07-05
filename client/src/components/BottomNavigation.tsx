import { Home, BarChart2, Bell, Settings } from "lucide-react";
import { useLocation } from "wouter";
import { useLanguage } from "@/context/LanguageContext";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";

function useAlertBadge() {
  const { user } = useAuth();
  const { data } = useQuery<{ alerts: { id: string }[] }>({
    queryKey: ["/api/my-alerts"],
    refetchInterval: 30_000,
    enabled: !!user,
  });
  if (!data?.alerts?.length) return 0;
  try {
    const dismissed = new Set<string>(
      JSON.parse(localStorage.getItem(`jalsetu_dismissed_alerts_${user?.id ?? "anon"}`) || "[]")
    );
    return data.alerts.filter(a => !dismissed.has(a.id)).length;
  } catch {
    return data.alerts.length;
  }
}

const BottomNavigation = () => {
  const [location, navigate] = useLocation();
  const { t } = useLanguage();
  const alertCount = useAlertBadge();

  const navItems = [
    { name: t.home, icon: Home, path: "/" },
    { name: t.reports, icon: BarChart2, path: "/reports" },
    { name: t.alerts, icon: Bell, path: "/alerts" },
    { name: t.settings, icon: Settings, path: "/settings" },
  ];

  return (
    <div className="fixed bottom-6 left-0 right-0 z-50 flex justify-center px-6">
      <div className="max-w-xs w-full glass-nav rounded-[2rem] px-4 py-3 flex items-center justify-around">
        {navItems.map((item) => {
          const isActive = location === item.path;
          return (
            <button
              key={item.name}
              onClick={() => navigate(item.path)}
              className="flex flex-col items-center gap-1 cursor-pointer group bg-transparent border-0 p-0"
              aria-label={item.name}
            >
              <div className={`relative p-2.5 rounded-2xl transition-all duration-300 ${
                isActive
                  ? 'bg-gradient-to-br from-blue-500/90 to-cyan-500/90 shadow-lg shadow-blue-500/30 scale-110 border border-white/30'
                  : 'hover:bg-white/20 dark:hover:bg-white/15 hover:scale-105'
              }`}>
                <item.icon className={`h-5 w-5 transition-colors duration-200 ${
                  isActive
                    ? 'text-white'
                    : 'text-gray-500 dark:text-white/50 group-hover:text-gray-700 dark:group-hover:text-white/80'
                }`} />
                {item.path === "/alerts" && alertCount > 0 && (
                  <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-red-500 text-white text-[8px] font-bold flex items-center justify-center shadow">
                    {alertCount > 9 ? "9+" : alertCount}
                  </span>
                )}
              </div>
              <span className={`text-[10px] font-semibold tracking-wide transition-colors duration-200 ${
                isActive
                  ? 'text-blue-400 dark:text-cyan-300'
                  : 'text-gray-400 dark:text-white/40 group-hover:text-gray-600 dark:group-hover:text-white/70'
              }`}>
                {item.name}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default BottomNavigation;
