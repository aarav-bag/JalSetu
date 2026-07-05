import { Bell, ShieldAlert, Droplet, AlertTriangle, Info, X, Check, Trash2, RefreshCw, PlugZap } from "lucide-react";
import BottomNavigation from "@/components/BottomNavigation";
import PageShell from "@/components/PageShell";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/context/LanguageContext";
import { useAlerts } from "@/hooks/useAlerts";
import { useAuth } from "@/hooks/useAuth";
import type { SensorAlert } from "@/hooks/useAlerts";

const getAlertStyles = (type: SensorAlert["type"]) => {
  switch (type) {
    case "danger":
      return {
        iconBg: 'rgba(239,68,68,0.18)',   iconBorder: 'rgba(239,68,68,0.3)',
        iconColor: 'text-red-400 dark:text-red-300',
        badgeBg: 'rgba(239,68,68,0.2)',   badgeBorder: 'rgba(239,68,68,0.35)',
        badgeColor: 'text-red-500 dark:text-red-300',
        cardAccent: 'rgba(239,68,68,0.06)', accentBorder: 'rgba(239,68,68,0.15)',
        Icon: ShieldAlert, label: "Danger",
      };
    case "warning":
      return {
        iconBg: 'rgba(245,158,11,0.18)',  iconBorder: 'rgba(245,158,11,0.3)',
        iconColor: 'text-amber-400 dark:text-amber-300',
        badgeBg: 'rgba(245,158,11,0.2)', badgeBorder: 'rgba(245,158,11,0.35)',
        badgeColor: 'text-amber-500 dark:text-amber-300',
        cardAccent: 'rgba(245,158,11,0.06)', accentBorder: 'rgba(245,158,11,0.15)',
        Icon: AlertTriangle, label: "Warning",
      };
    default:
      return {
        iconBg: 'rgba(59,130,246,0.18)',  iconBorder: 'rgba(59,130,246,0.3)',
        iconColor: 'text-blue-500 dark:text-blue-300',
        badgeBg: 'rgba(59,130,246,0.2)', badgeBorder: 'rgba(59,130,246,0.35)',
        badgeColor: 'text-blue-600 dark:text-blue-300',
        cardAccent: 'rgba(59,130,246,0.06)', accentBorder: 'rgba(59,130,246,0.15)',
        Icon: Info, label: "Info",
      };
  }
};

export default function Alerts() {
  const { toast } = useToast();
  const { t } = useLanguage();
  const { user } = useAuth();
  const { alerts, allAlerts, isLoading, dismiss, clearAll, refetch, generatedAt } = useAlerts(user?.id);

  const handleDismiss = (id: string) => {
    dismiss(id);
    toast({ title: "Alert dismissed", description: "Removed from your alert list." });
  };

  const handleClearAll = () => {
    clearAll();
    toast({ title: "All alerts cleared", description: "Your alerts have been cleared." });
  };

  const counts = {
    danger:  alerts.filter(a => a.type === "danger").length,
    warning: alerts.filter(a => a.type === "warning").length,
    info:    alerts.filter(a => a.type === "info").length,
  };

  const updatedTime = generatedAt
    ? new Date(generatedAt).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: true })
    : null;

  return (
    <PageShell>
      <header className="px-6 pt-12 pb-4 relative z-10">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold gradient-text">{t.alertsTitle}</h1>
            <p className="text-sm page-subtitle font-medium mt-1">{t.alertsSubtitle}</p>
          </div>
          <div className="flex items-center gap-2">
            {/* Refresh button */}
            <button
              onClick={() => refetch()}
              className="h-10 w-10 rounded-xl glass-tile flex items-center justify-center transition-all hover:scale-105"
              title="Refresh alerts"
            >
              <RefreshCw className="h-4 w-4 card-label" />
            </button>
            {/* Bell with badge */}
            <div className="h-12 w-12 rounded-2xl glass-tile flex items-center justify-center shadow-md relative">
              <Bell className={`h-6 w-6 ${alerts.length > 0 ? "text-red-500 dark:text-red-400" : "text-gray-400 dark:text-white/40"}`} />
              {alerts.length > 0 && (
                <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-red-500 text-white text-[9px] font-bold flex items-center justify-center shadow">
                  {alerts.length > 9 ? "9+" : alerts.length}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Last updated + summary pills */}
        {!isLoading && (
          <div className="flex flex-wrap items-center gap-2 mt-4">
            {alerts.length > 0 && (
              <>
                {counts.danger > 0 && (
                  <div className="flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold text-red-500 dark:text-red-300"
                    style={{ background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.25)' }}>
                    {counts.danger} Danger
                  </div>
                )}
                {counts.warning > 0 && (
                  <div className="flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold text-amber-500 dark:text-amber-300"
                    style={{ background: 'rgba(245,158,11,0.12)', border: '1px solid rgba(245,158,11,0.25)' }}>
                    {counts.warning} Warning
                  </div>
                )}
                {counts.info > 0 && (
                  <div className="flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold text-blue-600 dark:text-blue-300"
                    style={{ background: 'rgba(59,130,246,0.12)', border: '1px solid rgba(59,130,246,0.25)' }}>
                    {counts.info} Info
                  </div>
                )}
                <button type="button" onClick={handleClearAll}
                  className="ml-auto flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold text-gray-500 dark:text-white/40 transition-all hover:text-red-500 dark:hover:text-red-400"
                  style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)' }}>
                  <Trash2 className="h-3 w-3" /> Clear all
                </button>
              </>
            )}
            {updatedTime && (
              <span className="text-[10px] card-muted ml-auto">Updated {updatedTime}</span>
            )}
          </div>
        )}
      </header>

      <main className="flex-1 px-5 pt-2 pb-28 overflow-y-auto z-10">
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-24 glass-card animate-pulse rounded-[1.25rem]" />
            ))}
          </div>
        ) : alerts.length > 0 ? (
          <div className="space-y-3">
            {alerts.map((alert, index) => {
              const s = getAlertStyles(alert.type);
              return (
                <div key={alert.id} className="glass-card rounded-[1.25rem] overflow-hidden scale-in"
                  style={{ animationDelay: `${index * 0.05}s` }}>
                  <div className="p-4">
                    <div className="flex items-start gap-3">
                      <div className={`h-11 w-11 rounded-xl flex items-center justify-center flex-shrink-0 ${s.iconColor}`}
                        style={{ background: s.iconBg, border: `1px solid ${s.iconBorder}` }}>
                        <s.Icon className="h-5 w-5" />
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <h3 className="font-bold text-sm card-heading leading-tight">{alert.title}</h3>
                          <button onClick={() => handleDismiss(alert.id)}
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

            {/* If some alerts are dismissed but there are no active ones */}
            {allAlerts.length > alerts.length && (
              <p className="text-center text-xs card-muted py-2">
                {allAlerts.length - alerts.length} alert{allAlerts.length - alerts.length > 1 ? "s" : ""} dismissed
              </p>
            )}
          </div>
        ) : allAlerts.length > 0 ? (
          /* All alerts dismissed but server returned some — all clear from user's view */
          <div className="flex flex-col items-center justify-center py-20 fade-in">
            <div className="h-20 w-20 rounded-3xl glass-card flex items-center justify-center mb-5 shadow-xl">
              <Check className="h-10 w-10 text-emerald-500 dark:text-emerald-400" />
            </div>
            <h3 className="text-xl font-bold card-heading mb-2">All Caught Up!</h3>
            <p className="text-sm card-body text-center max-w-xs">
              You've dismissed all alerts. Alerts refresh every 30 seconds.
            </p>
          </div>
        ) : (
          /* Server returned nothing — no sensor data yet */
          <div className="flex flex-col items-center justify-center py-20 fade-in">
            <div className="h-20 w-20 rounded-3xl glass-card flex items-center justify-center mb-5 shadow-xl">
              <PlugZap className="h-10 w-10 text-blue-400 dark:text-blue-300" />
            </div>
            <h3 className="text-xl font-bold card-heading mb-2">No Alerts Yet</h3>
            <p className="text-sm card-body text-center max-w-xs">
              Connect your ESP32 device to start receiving real-time sensor alerts.
            </p>
          </div>
        )}
      </main>

      <BottomNavigation />
    </PageShell>
  );
}
