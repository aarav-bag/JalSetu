import { Home, BarChart2, Bell, Settings } from "lucide-react";
import { useLocation, Link } from "wouter";
import { useLanguage } from "@/context/LanguageContext";

const BottomNavigation = () => {
  const [location] = useLocation();
  const { t } = useLanguage();
  
  const navItems = [
    {
      name: t.home,
      icon: Home,
      path: "/",
      active: location === "/"
    },
    {
      name: t.reports,
      icon: BarChart2,
      path: "/reports",
      active: location === "/reports"
    },
    {
      name: t.alerts,
      icon: Bell,
      path: "/alerts",
      active: location === "/alerts"
    },
    {
      name: t.settings,
      icon: Settings,
      path: "/settings",
      active: location === "/settings"
    }
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50">
      <div className="max-w-md mx-auto">
        <div className="glass-effect border-t border-white/20 dark:border-gray-700/50 px-6 py-3 flex items-center justify-around shadow-2xl rounded-t-3xl backdrop-blur-xl">
          {navItems.map((item, index) => (
            <Link key={item.name} href={item.path}>
              <div className={`flex flex-col items-center py-3 px-4 rounded-2xl transition-all duration-300 hover:scale-105 cursor-pointer relative ${
                item.active ? 'transform scale-105' : ''
              }`}
              style={{ animationDelay: `${index * 0.1}s` }}>
                <div 
                  className={`p-2.5 rounded-2xl mb-1.5 transition-all duration-300 ${
                    item.active 
                      ? "bg-gradient-to-r from-primary to-primary/80 text-white shadow-lg shadow-primary/30" 
                      : "text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
                  }`}
                >
                  <item.icon className={`h-5 w-5 ${item.active ? "text-white" : ""}`} />
                  {item.active && (
                    <div className="absolute -inset-1 bg-gradient-to-r from-primary to-primary/80 rounded-2xl opacity-30 animate-pulse"></div>
                  )}
                </div>
                <span 
                  className={`text-xs font-semibold transition-colors duration-300 ${
                    item.active ? "text-primary dark:text-blue-400" : "text-gray-500 dark:text-gray-400"
                  }`}
                >
                  {item.name}
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

export default BottomNavigation;