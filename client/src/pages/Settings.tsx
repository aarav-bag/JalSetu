import { Settings as SettingsIcon, User, Languages, Bell, HelpCircle, LogOut, ChevronRight, Moon, Sun, Sparkles, MapPin, Cpu } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import BottomNavigation from "@/components/BottomNavigation";
import PageShell from "@/components/PageShell";
import { useTheme } from "@/context/ThemeContext";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { useLocation } from "wouter";
import { useLanguage } from "@/context/LanguageContext";
import { useUserLocation } from "@/context/LocationContext";
import LocationPicker from "@/components/LocationPicker";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter, DialogClose } from "@/components/ui/dialog";

const Settings = () => {
  const { darkMode, toggleDarkMode, animationsEnabled, toggleAnimations } = useTheme();
  const [notifications, setNotifications] = useState(true);
  const { toast } = useToast();
  const { user, logout } = useAuth();
  const [, navigate] = useLocation();
  const { language, setLanguage, t, availableLanguages } = useLanguage();
  const [languageDialogOpen, setLanguageDialogOpen] = useState(false);
  const [locationDialogOpen, setLocationDialogOpen] = useState(false);
  const { location: userLocation, isSet: locationIsSet } = useUserLocation();

  const handleLogout = () => {
    logout(undefined, {
      onSuccess: () => {
        toast({ title: "Logged out successfully", description: "You have been logged out." });
        navigate('/login');
      }
    });
  };

  const settingsSections = [
    {
      title: t.account,
      items: [
        {
          id: "profile", label: t.profileInfo,
          icon: <User className="h-5 w-5 text-blue-500 dark:text-blue-400" />,
          action: <ChevronRight className="h-5 w-5 text-gray-400 dark:text-white/30" />,
          onClick: () => navigate('/edit-profile'),
        },
        {
          id: "language", label: t.language,
          icon: <Languages className="h-5 w-5 text-emerald-500 dark:text-emerald-400" />,
          subtext: availableLanguages.find(l => l.code === language)?.name || "English",
          action: <ChevronRight className="h-5 w-5 text-gray-400 dark:text-white/30" />,
          onClick: () => setLanguageDialogOpen(true),
        },
        {
          id: "location", label: "Farm Location",
          icon: <MapPin className="h-5 w-5 text-blue-500 dark:text-blue-400" />,
          subtext: locationIsSet && userLocation ? `${userLocation.cityName}` : "Not set — tap to add",
          action: <ChevronRight className="h-5 w-5 text-gray-400 dark:text-white/30" />,
          onClick: () => setLocationDialogOpen(true),
        },
      ],
    },
    {
      title: t.preferences,
      items: [
        {
          id: "darkMode", label: t.darkMode,
          icon: darkMode
            ? <Moon className="h-5 w-5 text-indigo-500 dark:text-indigo-400" />
            : <Sun className="h-5 w-5 text-amber-500" />,
          action: (
            <Switch checked={darkMode} onCheckedChange={() => {
              toggleDarkMode();
              toast({ title: darkMode ? t.lightModeEnabled : t.darkModeEnabled, description: t.themeUpdated });
            }} className="data-[state=checked]:bg-blue-500" />
          ),
        },
        {
          id: "animations", label: t.enableAnimations,
          icon: <Sparkles className="h-5 w-5 text-yellow-500 dark:text-yellow-400" />,
          action: (
            <Switch checked={animationsEnabled} onCheckedChange={() => {
              toggleAnimations();
              toast({ title: animationsEnabled ? "Animations disabled" : "Animations enabled", description: "Your animation preference has been updated." });
            }} className="data-[state=checked]:bg-blue-500" />
          ),
        },
        {
          id: "notifications", label: t.pushNotifications,
          icon: <Bell className="h-5 w-5 text-red-500 dark:text-red-400" />,
          action: (
            <Switch checked={notifications} onCheckedChange={(val) => {
              setNotifications(val);
              toast({ title: val ? "Notifications enabled" : "Notifications disabled", description: "Your notification preference has been updated." });
            }} className="data-[state=checked]:bg-blue-500" />
          ),
        },
      ],
    },
    {
      title: "Device",
      items: [
        {
          id: "esp32", label: "ESP32 Device Setup",
          icon: <Cpu className="h-5 w-5 text-blue-500 dark:text-blue-400" />,
          subtext: "Connect sensors to your dashboard",
          action: <ChevronRight className="h-5 w-5 text-gray-400 dark:text-white/30" />,
          onClick: () => navigate('/device-setup'),
        },
      ],
    },
    {
      title: t.support,
      items: [
        {
          id: "help", label: t.helpFaq,
          icon: <HelpCircle className="h-5 w-5 text-amber-500 dark:text-amber-400" />,
          action: <ChevronRight className="h-5 w-5 text-gray-400 dark:text-white/30" />,
          onClick: () => navigate('/help-chatbot'),
        },
        {
          id: "logout", label: t.logout,
          icon: <LogOut className="h-5 w-5 text-red-500 dark:text-red-400" />,
          action: <ChevronRight className="h-5 w-5 text-gray-400 dark:text-white/30" />,
          onClick: handleLogout,
        },
      ],
    },
  ];

  return (
    <PageShell>
      <header className="px-6 pt-12 pb-4 relative z-10">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold gradient-text">{t.settingsTitle}</h1>
            <p className="text-sm page-subtitle font-medium mt-1">{t.settingsSubtitle}</p>
          </div>
          <div className="h-12 w-12 rounded-2xl glass-tile flex items-center justify-center shadow-md">
            <SettingsIcon className="h-6 w-6 text-purple-600 dark:text-purple-400" />
          </div>
        </div>
      </header>

      <main className="flex-1 px-5 pt-2 pb-28 overflow-y-auto z-10">
        <div className="space-y-5">

          {/* Profile card */}
          <div className="glass-card rounded-[1.5rem] p-5 relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/40 to-transparent" />
            <div className="flex items-center gap-4">
              <div className="h-16 w-16 rounded-2xl glass-tile flex items-center justify-center shadow-lg border-0">
                <div className="h-full w-full rounded-2xl bg-gradient-to-br from-blue-500/80 to-cyan-500/80 flex items-center justify-center">
                  <User className="h-8 w-8 text-white" />
                </div>
              </div>
              <div>
                <h2 className="text-xl font-bold card-heading">{user?.firstName || user?.username || "User"}</h2>
                <p className="text-sm card-body mt-0.5">{user?.email || "JalSetu User"}</p>
              </div>
            </div>
            <button
              onClick={() => navigate('/edit-profile')}
              className="mt-4 w-full py-2.5 rounded-xl text-sm font-semibold text-blue-600 dark:text-blue-300 transition-all hover:scale-[1.01] flex items-center justify-center gap-1.5"
              style={{ background: 'rgba(59,130,246,0.12)', border: '1px solid rgba(59,130,246,0.25)' }}>
              {t.editProfile} <ChevronRight className="h-4 w-4" />
            </button>
          </div>

          {/* Settings sections */}
          {settingsSections.map((section, idx) => (
            <div key={section.title} className="space-y-2 slide-in-right" style={{ animationDelay: `${idx * 0.1}s` }}>
              <h3 className="text-xs font-bold page-subtitle uppercase tracking-widest px-1 ml-1">
                {section.title}
              </h3>
              <div className="glass-card rounded-[1.25rem] overflow-hidden">
                {section.items.map((item, index) => (
                  <div
                    key={item.id}
                    className={`flex items-center justify-between px-5 py-4 cursor-default transition-colors hover:bg-white/5 dark:hover:bg-white/5 ${
                      index !== section.items.length - 1 ? 'border-b divider' : ''
                    }`}
                    onClick={item.onClick}
                    style={{ cursor: item.onClick ? 'pointer' : 'default' }}
                  >
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-xl glass-tile flex items-center justify-center">
                        {item.icon}
                      </div>
                      <div>
                        <p className="text-sm font-semibold card-value">{item.label}</p>
                        {'subtext' in item && item.subtext && (
                          <p className="text-xs card-muted mt-0.5">{item.subtext as string}</p>
                        )}
                      </div>
                    </div>
                    {item.action}
                  </div>
                ))}
              </div>
            </div>
          ))}

          {/* Version footer */}
          <div className="text-center mt-6 fade-in">
            <div className="glass-card rounded-2xl py-3 px-5 inline-block">
              <p className="text-xs font-semibold card-value">JalSetu v1.0.0</p>
              <div className="w-12 h-0.5 bg-gradient-to-r from-blue-500 via-cyan-400 to-indigo-500 rounded-full mx-auto my-2" />
              <p className="text-xs card-muted">© 2026 JalSetu Smart Irrigation</p>
            </div>
          </div>
        </div>
      </main>

      <BottomNavigation />

      {/* Location dialog */}
      <Dialog open={locationDialogOpen} onOpenChange={setLocationDialogOpen}>
        <DialogContent className="sm:max-w-md rounded-2xl bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl border border-white/60 dark:border-white/10">
          <DialogHeader>
            <DialogTitle className="text-center card-heading">Farm Location</DialogTitle>
            <DialogDescription className="text-center card-body">
              Set your city or village so weather and recommendations are accurate for your area
            </DialogDescription>
          </DialogHeader>
          <div className="py-2">
            <LocationPicker onSet={() => setLocationDialogOpen(false)} compact={false} />
          </div>
          <DialogFooter className="sm:justify-center">
            <DialogClose asChild>
              <button className="rounded-xl px-5 py-2 text-sm font-semibold glass-tile card-value transition-colors hover:bg-white/30 dark:hover:bg-white/15">
                Close
              </button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Language dialog */}
      <Dialog open={languageDialogOpen} onOpenChange={setLanguageDialogOpen}>
        <DialogContent className="sm:max-w-md rounded-2xl bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl border border-white/60 dark:border-white/10">
          <DialogHeader>
            <DialogTitle className="text-center card-heading">{t.language}</DialogTitle>
            <DialogDescription className="text-center card-body">
              Choose your preferred language for the application
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-2 py-3">
            {availableLanguages.map((lang) => (
              <button key={lang.code}
                className={`flex items-center gap-3 p-3 rounded-xl transition-all ${
                  language === lang.code
                    ? 'bg-blue-500/15 border border-blue-500/30 text-blue-600 dark:text-blue-300'
                    : 'hover:bg-white/20 dark:hover:bg-white/10 card-value'
                }`}
                onClick={() => {
                  setLanguage(lang.code);
                  toast({ title: t.languageChanged, description: `App language changed to ${lang.name}` });
                  setLanguageDialogOpen(false);
                }}>
                <span className="text-xl">{lang.flag}</span>
                <span className="font-semibold text-sm">{lang.name}</span>
                {language === lang.code && (
                  <span className="ml-auto h-2 w-2 rounded-full bg-blue-500" />
                )}
              </button>
            ))}
          </div>
          <DialogFooter className="sm:justify-center">
            <DialogClose asChild>
              <button className="rounded-xl px-5 py-2 text-sm font-semibold glass-tile card-value transition-colors hover:bg-white/30 dark:hover:bg-white/15">
                {t.back}
              </button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </PageShell>
  );
};

export default Settings;
