import { Droplet, Moon, Sun, LogOut, User } from "lucide-react";
import { useTheme } from "@/context/ThemeContext";
import { useLanguage } from "@/context/LanguageContext";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
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
  
  const handleLogout = () => {
    logout(undefined, {
      onSuccess: () => {
        toast({
          title: "Logged out",
          description: "You have been logged out successfully"
        });
      }
    });
  };
  
  return (
    <header className="px-6 pt-12 pb-6 relative z-10">
      <div className="flex items-center justify-between fade-in">
        <div className="flex-1">
          <div className="flex items-center mb-2">
            <h1 className="text-3xl font-bold flex items-center">
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary via-blue-600 to-primary gradient-text">Jal</span>
              <span className="text-blue-600 dark:text-blue-400 font-black ml-1">Setu</span>
              <div className="ml-2 p-1 rounded-full bg-gradient-to-r from-primary/10 to-blue-600/10">
                <Droplet className="h-6 w-6 text-primary dark:text-blue-400 floating" />
              </div>
            </h1>
          </div>
          <p className="text-sm font-semibold text-gray-600 dark:text-gray-300 opacity-90">Smart Water Management System</p>
        </div>
        
        <div className="flex items-center space-x-4">
          <button
            onClick={() => {
              toggleDarkMode();
              toast({
                title: darkMode ? "Light mode enabled" : "Dark mode enabled",
                description: "Your display preference has been updated"
              });
            }}
            className="h-11 w-11 rounded-2xl bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-700 shadow-lg hover:shadow-xl flex items-center justify-center transition-all duration-300 hover:scale-105 border border-gray-200/50 dark:border-gray-600/50"
          >
            {darkMode ? (
              <Sun className="h-6 w-6 text-amber-500" />
            ) : (
              <Moon className="h-6 w-6 text-slate-600 dark:text-slate-400" />
            )}
          </button>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <div className="h-12 w-12 rounded-2xl shadow-lg bg-gradient-to-br from-primary/5 via-white to-blue-50 dark:from-gray-800 dark:via-gray-700 dark:to-gray-600 ring-2 ring-primary/20 dark:ring-gray-600/50 flex items-center justify-center cursor-pointer transition-all duration-300 hover:scale-105 hover:ring-primary/40 hover:shadow-xl">
                <User className="h-7 w-7 text-primary dark:text-blue-400" />
              </div>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>
                {user?.username || 'My Account'}
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => window.location.href = '/settings'}>
                <User className="mr-2 h-4 w-4" />
                <span>Profile</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout} disabled={logoutIsPending}>
                <LogOut className="mr-2 h-4 w-4" />
                <span>{logoutIsPending ? 'Logging out...' : 'Log out'}</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
};

export default Header;
