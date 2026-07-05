import { useState } from "react";
import { Bell, ShieldAlert, AlertTriangle, Info, X, Check, Trash2, RefreshCw, PlugZap, History, ChevronDown, ChevronUp } from "lucide-react";
import BottomNavigation from "@/components/BottomNavigation";
import PageShell from "@/components/PageShell";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/context/LanguageContext";
import { useAlerts } from "@/hooks/useAlerts";
import { useAuth } from "@/hooks/useAuth";
import type { SensorAlert, HistoryAlert } from "@/hooks/useAlerts";

const getAlertStyles = (type: SensorAlert["type"]) => {
  switch (type) {
    case "danger":
      return {
        iconBg: 'rgba(239,68,68,0.18)',   iconBorder: 'rgba(239,68,68,0.3)',
        iconColor: 'text-red-400 dark:text-red-300',
        badgeBg: 'rgba(239,68,68,0.2)',   badgeBorder: 'rgba(239,68,68,0.35)',
        badgeColor: 'text-red-500 dark:text-red-300',
        Icon: ShieldAlert, label: "Danger",
      };
    case "warning":
      return {
        iconBg: 'rgba(245,158,11,0.18)',  iconBorder: 'rgba(245,158,11,0.3)',
        iconColor: 'text-amber-400 dark:text-amber-300',
        badgeBg: 'rgba(245,158,11,0.2)', badgeBorder: 'rgba(245,158,11,0.35)',
        badgeColor: 'text-amber-500 dark:text-amber-300',
        Icon: AlertTriangle, label: "Warning",
      };
    default:
      return {
        iconBg: 'rgba(59,130,246,0.18)',  iconBorder: 'rgba(59,130,246,0.3)',
        iconColor: 'text-blue-500 dark:text-blue-300',
        badgeBg: 'rgba(59,130,246,0.2)', badgeBorder: 'rgba(59,130,246,0.35)',
        badgeColor: 'text-blue-600 dark:text-blue-300',
        Icon: Info, label: "Info",
      };
  }
};

function ActiveAlertCard({ alert, onDismiss }: { alert: SensorAlert; onDismiss: (id: string) => void }) {
  const s = getAlertStyles(alert.type);
  return (
    <div className="glass-card rounded-[1.25rem] overflow-hidden scale-in">
      <div className="p-4">
        <div className="flex items-start gap-3">
          <div className={`h-11 w-11 rounded-xl flex items-center justify-center flex-shrink-0 ${s.iconColor}`}
            style={{ background: s.iconBg, border: `1px solid ${s.iconBorder}` }}>
            <s.Icon className="h-5 w-5" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <h3 className="font-bold text-sm card-heading leading-tight">{alert.title}</h3>
              <button onClick={() => onDismiss(alert.id)}
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
}

function HistoryAlertCard({ alert }: { alert: HistoryAlert }) {
  const s = getAlertStyles(alert.type);
  return (
    <div className="glass-card rounded-[1.25rem] overflow-hidden opacity-75">
      <div className="p-4">
        <div className="flex items-start gap-3">
          <div className={`h-10 w-10 rounded-xl flex items-center justify-center flex-shrink-0 ${s.iconColor}`}
            style={{ background: s.iconBg, border: `1px solid ${s.iconBorder}`, opacity: 0.7 }}>
            <s.Icon className="h-4 w-4" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <h3 className="font-semibold text-sm card-label leading-tight line-through">{alert.title}</h3>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full text-emerald-600 dark:text-emerald-300 flex-shrink-0"
                style={{ background: 'rgba(16,185,129,0.12)', border: '1px solid rgba(16,185,129,0.25)' }}>
                Resolved
              </span>
            </div>
            <p className="text-xs card-muted mt-1 leading-relaxed">{alert.message}</p>
            <div className="flex items-center gap-2 mt-2">
              {alert.triggeredAt && (
                <span className="text-[10px] card-muted">Triggered: {alert.triggeredAt}</span>
              )}
              {alert.resolvedAt && (
                <>
                  <span className="text-[10px] card-muted">·</span>
                  <span className="text-[10px] text-emerald-500 dark:text-emerald-400">Resolved: {alert.resolvedAt}</span>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Alerts() {
  const { toast } = useToast();
  const { t } = useLanguage();
  const { user } = useAuth();
  const { alerts, allAlerts, history, isLoading, dismiss, clearAll, refetch, generatedAt } = useAlerts(user?.id);
  const [showHistory, setShowHistory] = useState(false);

  const handleDismiss = (id: string) => {
    dismiss(id);
    toast({ title: "Alert dismissed", description: "Removed from your active alerts." });
  };

  const handleClearAll = () => {
    clearAll();
    toast({ title: "All alerts cleared", description: "Active alerts have been cleared." });
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
            <button onClick={() => refetch()}
              className="h-10 w-10 rounded-xl glass-tile flex items-center justify-center transition-all hover:scale-105"
              title="Refresh alerts">
              <RefreshCw className="h-4 w-4 card-label" />
            </button>
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
        ) : (
          <div className="space-y-3">
            {/* ── Active alerts ── */}
            {alerts.length > 0 ? (
              alerts.map((alert, i) => (
                <ActiveAlertCard key={`${alert.id}-${i}`} alert={alert} onDismiss={handleDismiss} />
              ))
            ) : (
              <div className="flex flex-col items-center justify-center py-10 fade-in">
                <div className="h-16 w-16 rounded-3xl glass-card flex items-center justify-center mb-4 shadow-xl">
                  {allAlerts.length > 0
                    ? <Check className="h-8 w-8 text-emerald-500 dark:text-emerald-400" />
                    : <PlugZap className="h-8 w-8 text-blue-400 dark:text-blue-300" />}
                </div>
                <h3 className="text-lg font-bold card-heading mb-1">
                  {allAlerts.length > 0 ? "All Caught Up!" : "No Active Alerts"}
                </h3>
                <p className="text-sm card-body text-center max-w-xs">
                  {allAlerts.length > 0
                    ? "You've dismissed all active alerts. Check the history below."
                    : "Connect your ESP32 to start receiving real-time sensor alerts."}
                </p>
              </div>
            )}

            {/* ── Alert History ── */}
            {history.length > 0 && (
              <div className="mt-2">
                <button
                  onClick={() => setShowHistory(h => !h)}
                  className="w-full flex items-center justify-between px-4 py-3 rounded-2xl glass-tile text-sm font-semibold card-label transition-all hover:scale-[1.01]"
                >
                  <span className="flex items-center gap-2">
                    <History className="h-4 w-4" />
                    Alert History
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full card-muted"
                      style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)' }}>
                      {history.length}
                    </span>
                  </span>
                  {showHistory
                    ? <ChevronUp className="h-4 w-4" />
                    : <ChevronDown className="h-4 w-4" />}
                </button>

                {showHistory && (
                  <div className="space-y-2 mt-2">
                    {history.map((h, i) => (
                      <HistoryAlertCard key={`hist-${h.dbId ?? i}`} alert={h} />
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </main>

      <BottomNavigation />
    </PageShell>
  );
}
