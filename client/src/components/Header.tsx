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
      onSuccess: () => {
        toast({ title: "Logged out", description: "See you soon!" });
      }
    });
  };

  const hour = time.getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";
  const timeStr = time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const dateStr = time.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' });

  return (
    <header className="px-5 pt-10 pb-4 relative z-10">
      <div className="flex items-center justify-between">
        {/* Logo + greeting */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <div className="h-8 w-8 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center shadow-md">
              <Droplets className="h-4 w-4 text-white" />
            </div>
            <span className="text-xl font-bold tracking-tight">
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-cyan-500 dark:from-blue-400 dark:to-cyan-300">Jal</span>
              <span className="text-gray-800 dark:text-white">Setu</span>
            </span>
          </div>
          <div className="flex items-center gap-2">
            <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">{greeting} — {dateStr}</p>
            <span className="text-xs font-mono text-blue-500 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 px-2 py-0.5 rounded-full">{timeStr}</span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 ml-3">
          {/* Notifications */}
          <button className="relative h-10 w-10 rounded-2xl bg-white dark:bg-gray-800 shadow-sm border border-gray-100 dark:border-gray-700 flex items-center justify-center transition-all duration-200 hover:scale-105 hover:shadow-md">
            <Bell className="h-4.5 w-4.5 text-gray-600 dark:text-gray-300" />
            <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-red-500 ring-2 ring-white dark:ring-gray-800"></span>
          </button>

          {/* Dark mode toggle */}
          <button
            onClick={() => {
              toggleDarkMode();
              toast({ title: darkMode ? "Light mode" : "Dark mode", description: "Display preference updated" });
            }}
            className="h-10 w-10 rounded-2xl bg-white dark:bg-gray-800 shadow-sm border border-gray-100 dark:border-gray-700 flex items-center justify-center transition-all duration-200 hover:scale-105 hover:shadow-md"
          >
            {darkMode ? (
              <Sun className="h-4.5 w-4.5 text-amber-400" />
            ) : (
              <Moon className="h-4.5 w-4.5 text-gray-600" />
            )}
          </button>

          {/* User avatar */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="h-10 w-10 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center shadow-md transition-all duration-200 hover:scale-105 hover:shadow-lg cursor-pointer">
                <span className="text-white text-sm font-bold">
                  {(user?.firstName?.[0] || user?.username?.[0] || 'U').toUpperCase()}
                </span>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-52 rounded-2xl border-gray-100 dark:border-gray-700 shadow-xl">
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col">
                  <span className="font-semibold text-gray-900 dark:text-white">{user?.firstName || user?.username}</span>
                  <span className="text-xs text-gray-500">@{user?.username}</span>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => window.location.href = '/settings'} className="rounded-xl">
                <User className="mr-2 h-4 w-4" />
                Profile & Settings
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout} disabled={logoutIsPending} className="rounded-xl text-red-600 dark:text-red-400 focus:text-red-600">
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
