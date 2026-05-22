import { useState } from "react";
import { Bell, ShieldAlert, Droplet, Leaf, DropletIcon, Trash2, Check, AlertTriangle, Info, X } from "lucide-react";
import BottomNavigation from "@/components/BottomNavigation";
import PageShell from "@/components/PageShell";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/context/LanguageContext";

type AlertType = "info" | "warning" | "danger";

interface Alert {
  id: number;
  title: string;
  message: string;
  time: string;
  type: AlertType;
  iconKey: string;
}

const SAMPLE_ALERTS: Alert[] = [
  { id: 1, title: "Low Soil Moisture", message: "Field 2 moisture level is below 40%. Consider irrigation.", time: "2 hours ago", type: "warning", iconKey: "droplet" },
  { id: 2, title: "Pest Detection Alert", message: "Possible pest infestation detected in north section. Inspect crops.", time: "Yesterday", type: "danger", iconKey: "shield" },
  { id: 3, title: "Optimal Watering Time", message: "Best time to water crops is now, based on weather forecast.", time: "Today", type: "info", iconKey: "droplet2" },
  { id: 4, title: "Nutrient Deficiency", message: "Field 1 showing signs of nitrogen deficiency. Consider fertilization.", time: "2 days ago", type: "warning", iconKey: "leaf" },
  { id: 5, title: "Irrigation System Maintenance", message: "Your irrigation system is due for maintenance. Schedule service soon.", time: "3 days ago", type: "info", iconKey: "bell" },
  { id: 6, title: "Weather Alert", message: "Heavy rain expected tomorrow. Consider adjusting irrigation schedule.", time: "4 days ago", type: "warning", iconKey: "droplet" },
  { id: 7, title: "Sensor Offline", message: "Field 3 moisture sensor is offline. Please check connection.", time: "5 days ago", type: "danger", iconKey: "shield" },
  { id: 8, title: "Crop Growth Report", message: "Your wheat crop is growing at an optimal rate. Keep up the good work!", time: "1 week ago", type: "info", iconKey: "leaf" },
];

const getAlertStyles = (type: AlertType) => {
  switch (type) {
    case "danger":
      return {
        iconBg: 'rgba(239,68,68,0.18)',
        iconBorder: 'rgba(239,68,68,0.3)',
        iconColor: 'text-red-400 dark:text-red-300',
        badgeBg: 'rgba(239,68,68,0.2)',
        badgeBorder: 'rgba(239,68,68,0.35)',
        badgeColor: 'text-red-500 dark:text-red-300',
        cardAccent: 'rgba(239,68,68,0.06)',
        accentBorder: 'rgba(239,68,68,0.15)',
        Icon: ShieldAlert,
        label: "Danger",
      };
    case "warning":
      return {
        iconBg: 'rgba(245,158,11,0.18)',
        iconBorder: 'rgba(245,158,11,0.3)',
        iconColor: 'text-amber-400 dark:text-amber-300',
        badgeBg: 'rgba(245,158,11,0.2)',
        badgeBorder: 'rgba(245,158,11,0.35)',
        badgeColor: 'text-amber-500 dark:text-amber-300',
        cardAccent: 'rgba(245,158,11,0.06)',
        accentBorder: 'rgba(245,158,11,0.15)',
        Icon: AlertTriangle,
        label: "Warning",
      };
    default:
      return {
        iconBg: 'rgba(59,130,246,0.18)',
        iconBorder: 'rgba(59,130,246,0.3)',
        iconColor: 'text-blue-500 dark:text-blue-300',
        badgeBg: 'rgba(59,130,246,0.2)',
        badgeBorder: 'rgba(59,130,246,0.35)',
        badgeColor: 'text-blue-600 dark:text-blue-300',
        cardAccent: 'rgba(59,130,246,0.06)',
        accentBorder: 'rgba(59,130,246,0.15)',
        Icon: Info,
        label: "Info",
      };
  }
};

export default function Alerts() {
  const { toast } = useToast();
  const { t } = useLanguage();
  const [alerts, setAlerts] = useState<Alert[]>(SAMPLE_ALERTS);
  const [visibleCount, setVisibleCount] = useState(5);

  const visibleAlerts = alerts.slice(0, visibleCount);

  const dismissAlert = (id: number) => {
    setAlerts(prev => prev.filter(a => a.id !== id));
    toast({ title: "Alert dismissed", description: "Removed from your alert list." });
  };

  const clearAll = () => {
    setAlerts([]);
    toast({ title: "All alerts cleared", description: "Your alerts have been cleared." });
  };

  const loadMore = () => {
    setVisibleCount(prev => Math.min(prev + 4, alerts.length));
  };

  const counts = { danger: alerts.filter(a => a.type === "danger").length, warning: alerts.filter(a => a.type === "warning").length, info: alerts.filter(a => a.type === "info").length };

  return (
    <PageShell>
      <header className="px-6 pt-12 pb-4 relative z-10">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold gradient-text">{t.alertsTitle}</h1>
            <p className="text-sm page-subtitle font-medium mt-1">{t.alertsSubtitle}</p>
          </div>
          <div className="h-12 w-12 rounded-2xl glass-tile flex items-center justify-center shadow-md relative">
            <Bell className="h-6 w-6 text-red-500 dark:text-red-400" />
            {alerts.length > 0 && (
              <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-red-500 text-white text-[9px] font-bold flex items-center justify-center shadow">
                {alerts.length}
              </span>
            )}
          </div>
        </div>

        {/* Summary pills */}
        {alerts.length > 0 && (
          <div className="flex gap-2 mt-4">
            {[
              { label: 'Danger', count: counts.danger, color: 'text-red-500 dark:text-red-300', bg: 'rgba(239,68,68,0.12)', border: 'rgba(239,68,68,0.25)' },
              { label: 'Warning', count: counts.warning, color: 'text-amber-500 dark:text-amber-300', bg: 'rgba(245,158,11,0.12)', border: 'rgba(245,158,11,0.25)' },
              { label: 'Info', count: counts.info, color: 'text-blue-600 dark:text-blue-300', bg: 'rgba(59,130,246,0.12)', border: 'rgba(59,130,246,0.25)' },
            ].map(p => (
              <div key={p.label} className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold ${p.color}`}
                style={{ background: p.bg, border: `1px solid ${p.border}` }}>
                {p.count} {p.label}
              </div>
            ))}
            <button onClick={clearAll} className="ml-auto flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold text-gray-500 dark:text-white/40 transition-all hover:text-red-500 dark:hover:text-red-400"
              style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)' }}>
              <Trash2 className="h-3 w-3" /> Clear all
            </button>
          </div>
        )}
      </header>

      <main className="flex-1 px-5 pt-2 pb-28 overflow-y-auto z-10">
        {alerts.length > 0 ? (
          <div className="space-y-3">
            {visibleAlerts.map((alert, index) => {
              const s = getAlertStyles(alert.type);
              return (
                <div key={alert.id} className="glass-card rounded-[1.25rem] overflow-hidden scale-in" style={{ animationDelay: `${index * 0.05}s` }}>
                  <div className="p-4">
                    <div className="flex items-start gap-3">
                      <div className={`h-11 w-11 rounded-xl flex items-center justify-center flex-shrink-0 ${s.iconColor}`}
                        style={{ background: s.iconBg, border: `1px solid ${s.iconBorder}` }}>
                        <s.Icon className="h-5 w-5" />
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <h3 className="font-bold text-sm card-heading leading-tight">{alert.title}</h3>
                          <button onClick={() => dismissAlert(alert.id)}
                            className="h-6 w-6 rounded-lg flex items-center justify-center flex-shrink-0 transition-all hover:scale-110 text-gray-400 dark:text-white/30 hover:text-gray-600 dark:hover:text-white/70"
                            style={{ background: 'rgba(255,255,255,0.06)' }}>
                            <X className="h-3 w-3" />
                          </button>
                        </div>
                        <p className="text-xs card-body mt-1 leading-relaxed">{alert.message}</p>
                        <div className="flex items-center justify-between mt-2.5">
                          <span className="text-[10px] card-muted font-medium">{alert.time}</span>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${s.badgeColor}`}
                            style={{ background: s.badgeBg, border: `1px solid ${s.badgeBorder}` }}>
                            {s.label}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}

            {visibleCount < alerts.length && (
              <button onClick={loadMore}
                className="w-full py-3 rounded-2xl glass-tile text-sm font-semibold text-blue-600 dark:text-blue-300 transition-all hover:scale-[1.01]">
                Load {Math.min(4, alerts.length - visibleCount)} more alerts
              </button>
            )}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 fade-in">
            <div className="h-20 w-20 rounded-3xl glass-card flex items-center justify-center mb-5 shadow-xl">
              <Check className="h-10 w-10 text-emerald-500 dark:text-emerald-400" />
            </div>
            <h3 className="text-xl font-bold card-heading mb-2">All Caught Up!</h3>
            <p className="text-sm card-body text-center max-w-xs">
              You've dismissed all alerts. Check back later for new notifications.
            </p>
          </div>
        )}
      </main>

      <BottomNavigation />
    </PageShell>
  );
}
