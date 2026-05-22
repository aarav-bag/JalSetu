import { Droplets, Moon, Sun, LogOut, User, Bell } from "lucide-react";
import { useTheme } from "@/context/ThemeContext";
import { useLanguage } from "@/context/LanguageContext";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { useState, useEffect } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const Header = () => {
  const { darkMode, toggleDarkMode } = useTheme();
  const { t } = useLanguage();
  const { toast } = useToast();
  const { user, logout, logoutIsPending } = useAuth();
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const handleLogout = () => {
    logout(undefined, {
      onSuccess: () => toast({ title: "Logged out", description: "See you soon!" })
    });
  };

  const hour = time.getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";
  const timeStr = time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const dateStr = time.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' });

  return (
    <header className="px-5 pt-10 pb-4 relative z-10">
      <div className="flex items-center justify-between">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <div className="h-8 w-8 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center shadow-lg shadow-blue-500/30">
              <Droplets className="h-4 w-4 text-white" />
            </div>
            <span className="text-xl font-bold tracking-tight">
              <span className="page-title">Jal</span>
              <span className="text-cyan-500 dark:text-cyan-300 font-black">Setu</span>
            </span>
          </div>
          <div className="flex items-center gap-2">
            <p className="text-xs page-subtitle font-medium">{greeting} — {dateStr}</p>
            <span className="text-xs font-mono text-blue-600 dark:text-cyan-300/80 bg-blue-100/60 dark:bg-white/10 backdrop-blur-sm px-2 py-0.5 rounded-full border border-blue-200/60 dark:border-white/10">{timeStr}</span>
          </div>
        </div>

        <div className="flex items-center gap-2 ml-3">
          <button className="relative h-10 w-10 rounded-2xl glass-tile flex items-center justify-center transition-all duration-200 hover:scale-105 shadow-md">
            <Bell className="h-4 w-4 text-gray-600 dark:text-white/80" />
            <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-red-400 ring-2 ring-white/50 dark:ring-slate-900/50" />
          </button>

          <button
            onClick={() => {
              toggleDarkMode();
              toast({ title: darkMode ? "Light mode" : "Dark mode", description: "Display preference updated" });
            }}
            className="h-10 w-10 rounded-2xl glass-tile flex items-center justify-center transition-all duration-200 hover:scale-105 shadow-md"
          >
            {darkMode
              ? <Sun className="h-4 w-4 text-amber-400" />
              : <Moon className="h-4 w-4 text-indigo-600" />}
          </button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="h-10 w-10 rounded-2xl bg-gradient-to-br from-blue-500/80 to-cyan-500/80 backdrop-blur-md border border-white/30 flex items-center justify-center shadow-lg shadow-blue-500/20 transition-all duration-200 hover:scale-105 cursor-pointer">
                <span className="text-white text-sm font-bold">
                  {(user?.firstName?.[0] || user?.username?.[0] || 'U').toUpperCase()}
                </span>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-52 rounded-2xl bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl border border-white/60 dark:border-white/10 shadow-2xl">
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col">
                  <span className="font-semibold text-gray-900 dark:text-white">{user?.firstName || user?.username}</span>
                  <span className="text-xs text-gray-500">@{user?.username}</span>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => window.location.href = '/settings'} className="rounded-xl cursor-pointer">
                <User className="mr-2 h-4 w-4" />
                Profile & Settings
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout} disabled={logoutIsPending} className="rounded-xl text-red-500 dark:text-red-400 focus:text-red-500 cursor-pointer">
                <LogOut className="mr-2 h-4 w-4" />
                {logoutIsPending ? 'Logging out...' : 'Log out'}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
};

export default Header;
