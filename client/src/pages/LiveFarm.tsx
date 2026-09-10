import {
  Camera,
  CheckCircle2,
  ChevronDown,
  Clock3,
  Expand,
  Gauge,
  MapPin,
  RefreshCw,
  ShieldCheck,
  Video,
  VideoOff,
  Wifi,
  WifiOff,
  Wind,
} from "lucide-react";
import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import PageShell from "@/components/PageShell";
import BottomNavigation from "@/components/BottomNavigation";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

interface FarmField {
  id: number;
  name: string;
  value: number | null;
  status: "optimal" | "warning" | "danger";
  hasReading?: boolean;
}

interface DashboardData {
  farm?: {
    name?: string;
  };
  soilMoisture?: {
    fields?: FarmField[];
  };
  waterQuality?: Array<{
    name: string;
    value: string | number;
    unit?: string;
    icon: "ph" | "tds" | "temp";
  }>;
}

interface Esp32Status {
  online: boolean;
  lastSeen: string | null;
}

const fallbackFields: FarmField[] = [
  { id: 1, name: "Field 1", value: null, status: "optimal", hasReading: false },
  { id: 2, name: "Field 2", value: null, status: "optimal", hasReading: false },
];

function formatValue(value: number | string | null | undefined, unit = "") {
  if (value === null || value === undefined || value === "") return "No reading";
  return `${value}${unit}`;
}

function getMetric(
  metrics: DashboardData["waterQuality"],
  icon: "ph" | "tds" | "temp",
) {
  return metrics?.find((metric) => metric.icon === icon);
}

function relativeTime(iso: string | null | undefined) {
  if (!iso) return "No device connection yet";
  const seconds = Math.max(0, Math.floor((Date.now() - new Date(iso).getTime()) / 1000));
  if (seconds < 60) return `${seconds}s ago`;
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  return `${Math.floor(seconds / 3600)}h ago`;
}

export default function LiveFarm() {
  const { toast } = useToast();
  const [selectedFieldId, setSelectedFieldId] = useState<number | null>(null);

  const { data: dashboard, isLoading: dashboardLoading } = useQuery<DashboardData>({
    queryKey: ["/api/user-dashboard"],
  });
  const {
    data: esp32,
    isLoading: esp32Loading,
    refetch: refetchEsp32,
    isFetching: esp32Fetching,
  } = useQuery<Esp32Status>({
    queryKey: ["/api/esp32/status"],
    refetchInterval: 15000,
  });

  const fields = useMemo(() => {
    const liveFields = dashboard?.soilMoisture?.fields ?? [];
    return liveFields.length > 0 ? liveFields : fallbackFields;
  }, [dashboard?.soilMoisture?.fields]);

  const activeFieldId = selectedFieldId ?? fields[0]?.id ?? 1;
  const activeField = fields.find((field) => field.id === activeFieldId) ?? fields[0];
  const temperature = getMetric(dashboard?.waterQuality, "temp");
  const ph = getMetric(dashboard?.waterQuality, "ph");
  const tds = getMetric(dashboard?.waterQuality, "tds");
  const handleRefresh = async () => {
    await refetchEsp32();
    toast({
      title: "Device status refreshed",
      description: "JalSetu checked the connected ESP32 device.",
    });
  };

  return (
    <PageShell>
      <header className="px-5 pt-10 pb-4 relative z-10">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <div className="h-9 w-9 rounded-2xl bg-gradient-to-br from-indigo-500 to-blue-500 flex items-center justify-center shadow-lg shadow-blue-500/25">
                <Video className="h-4 w-4 text-white" />
              </div>
              <span className="text-xs font-bold uppercase tracking-[0.18em] text-blue-600 dark:text-cyan-300">
                Farm watch
              </span>
            </div>
            <h1 className="text-3xl font-bold gradient-text">Live Farm View</h1>
            <p className="text-sm page-subtitle font-medium mt-1">
              Monitor your fields when the camera is connected
            </p>
          </div>
          <button
            type="button"
            onClick={handleRefresh}
            disabled={esp32Fetching}
            aria-label="Refresh device status"
            className="h-11 w-11 rounded-2xl glass-tile flex items-center justify-center shadow-md transition hover:scale-105 disabled:opacity-60"
          >
            <RefreshCw className={`h-4 w-4 text-blue-600 dark:text-cyan-300 ${esp32Fetching ? "animate-spin" : ""}`} />
          </button>
        </div>
      </header>

      <main className="flex-1 px-5 pb-28 overflow-y-auto z-10">
        <div className="space-y-4">
          <section className="glass-card rounded-[1.75rem] overflow-hidden scale-in">
            <div className="relative aspect-video min-h-[220px] overflow-hidden bg-slate-950">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(34,197,94,0.28),transparent_34%),radial-gradient(circle_at_80%_75%,rgba(14,165,233,0.25),transparent_38%),linear-gradient(145deg,#0f172a,#172554_60%,#064e3b)]" />
              <div className="absolute inset-0 opacity-20 [background-image:linear-gradient(rgba(255,255,255,.2)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.2)_1px,transparent_1px)] [background-size:32px_32px]" />

              <div className="absolute top-4 left-4 right-4 flex items-center justify-between">
                <div className="flex items-center gap-2 rounded-full border border-white/15 bg-black/25 px-3 py-1.5 backdrop-blur-md">
                  <span className="h-2 w-2 rounded-full bg-amber-300 shadow-[0_0_12px_rgba(252,211,77,0.8)]" />
                  <span className="text-xs font-semibold text-white/90">Camera standby</span>
                </div>
                <button
                  type="button"
                  disabled
                  aria-label="Expand live video"
                  className="h-9 w-9 rounded-xl border border-white/15 bg-black/25 flex items-center justify-center text-white/50 backdrop-blur-md disabled:cursor-not-allowed"
                >
                  <Expand className="h-4 w-4" />
                </button>
              </div>

              <div className="absolute inset-0 flex flex-col items-center justify-center px-8 text-center">
                <div className="h-16 w-16 rounded-3xl border border-white/20 bg-white/10 flex items-center justify-center shadow-2xl backdrop-blur-md">
                  <Camera className="h-8 w-8 text-cyan-200" />
                </div>
                <h2 className="mt-4 text-lg font-bold text-white">Camera not connected yet</h2>
                <p className="mt-1 max-w-xs text-xs leading-5 text-white/60">
                  Your ESP32-S3 camera stream will appear here after the camera firmware and connection are configured.
                </p>
              </div>

              <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between">
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-white/45">Selected view</p>
                  <p className="text-sm font-bold text-white">{activeField?.name ?? "Field 1"}</p>
                </div>
                <span className="rounded-full bg-white/10 px-2.5 py-1 text-[10px] font-semibold text-white/60 backdrop-blur-md">
                  Stream will be added later
                </span>
              </div>
            </div>

            <div className="p-4 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2 min-w-0">
                <div className="h-9 w-9 rounded-xl glass-tile flex items-center justify-center shrink-0">
                  <VideoOff className="h-4 w-4 text-slate-400" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-bold card-heading">ESP32-S3 camera</p>
                  <p className="text-xs card-body truncate">Ready for future streaming setup</p>
                </div>
              </div>
              <Button
                type="button"
                size="sm"
                className="rounded-xl bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-md shadow-blue-500/20 shrink-0"
                onClick={() =>
                  toast({
                    title: "Camera setup is coming next",
                    description: "This page is ready for the ESP32-S3 stream connection.",
                  })
                }
              >
                Set up camera
              </Button>
            </div>
          </section>

          <section className="glass-card rounded-[1.5rem] p-4 scale-in" style={{ animationDelay: "0.08s" }}>
            <div className="flex items-center justify-between mb-3">
              <div>
                <p className="text-xs card-label font-semibold uppercase tracking-[0.14em]">Camera location</p>
                <div className="flex items-center gap-1.5 mt-1">
                  <MapPin className="h-4 w-4 text-blue-500" />
                  <h2 className="font-bold card-heading">{dashboard?.farm?.name || "Your farm"}</h2>
                </div>
              </div>
              <div className={`flex items-center gap-1.5 rounded-full px-2.5 py-1.5 text-[10px] font-bold ${
                esp32?.online
                  ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-300"
                  : "bg-slate-500/10 text-slate-500 dark:text-white/45"
              }`}>
                {esp32?.online ? <Wifi className="h-3 w-3" /> : <WifiOff className="h-3 w-3" />}
                {esp32Loading ? "Checking" : esp32?.online ? "Sensor online" : "Sensor offline"}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {fields.map((field) => {
                const isSelected = field.id === activeFieldId;
                return (
                  <button
                    key={field.id}
                    type="button"
                    onClick={() => setSelectedFieldId(field.id)}
                    className={`rounded-2xl border p-3 text-left transition ${
                      isSelected
                        ? "border-blue-400/60 bg-blue-500/10 shadow-sm"
                        : "border-white/10 bg-white/5 hover:bg-white/10 dark:border-white/10"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className={`text-xs font-bold ${isSelected ? "text-blue-600 dark:text-cyan-300" : "card-body"}`}>
                        {field.name}
                      </span>
                      <ChevronDown className={`h-3.5 w-3.5 transition ${isSelected ? "rotate-180 text-blue-500" : "text-slate-400"}`} />
                    </div>
                    <p className="mt-2 text-sm font-bold card-value">
                      {field.hasReading === false || field.value === null ? "No reading" : formatValue(field.value, "%")}
                    </p>
                  </button>
                );
              })}
            </div>
          </section>

          <section className="grid grid-cols-2 gap-3">
            <div className="glass-card rounded-[1.35rem] p-4 scale-in" style={{ animationDelay: "0.14s" }}>
              <div className="flex items-center gap-2 text-blue-500">
                <Gauge className="h-4 w-4" />
                <span className="text-[10px] font-bold uppercase tracking-[0.12em]">Moisture</span>
              </div>
              <p className="mt-3 text-xl font-bold card-value">
                {dashboardLoading || !activeField ? "…" : activeField.hasReading === false || activeField.value === null ? "—" : formatValue(activeField.value, "%")}
              </p>
              <p className="mt-1 text-[11px] card-label">{activeField?.name || "Selected field"}</p>
            </div>
            <div className="glass-card rounded-[1.35rem] p-4 scale-in" style={{ animationDelay: "0.18s" }}>
              <div className="flex items-center gap-2 text-cyan-500">
                <Wind className="h-4 w-4" />
                <span className="text-[10px] font-bold uppercase tracking-[0.12em]">Temperature</span>
              </div>
              <p className="mt-3 text-xl font-bold card-value">{formatValue(temperature?.value, temperature?.unit)}</p>
              <p className="mt-1 text-[11px] card-label">Latest water reading</p>
            </div>
            <div className="glass-card rounded-[1.35rem] p-4 scale-in" style={{ animationDelay: "0.22s" }}>
              <div className="flex items-center gap-2 text-violet-500">
                <ShieldCheck className="h-4 w-4" />
                <span className="text-[10px] font-bold uppercase tracking-[0.12em]">Water pH</span>
              </div>
              <p className="mt-3 text-xl font-bold card-value">{formatValue(ph?.value, ph?.unit)}</p>
              <p className="mt-1 text-[11px] card-label">Latest water reading</p>
            </div>
            <div className="glass-card rounded-[1.35rem] p-4 scale-in" style={{ animationDelay: "0.26s" }}>
              <div className="flex items-center gap-2 text-amber-500">
                <Clock3 className="h-4 w-4" />
                <span className="text-[10px] font-bold uppercase tracking-[0.12em]">TDS</span>
              </div>
              <p className="mt-3 text-xl font-bold card-value">{formatValue(tds?.value, tds?.unit)}</p>
              <p className="mt-1 text-[11px] card-label">Latest water reading</p>
            </div>
          </section>

          <section className="glass-card rounded-[1.5rem] p-4 flex items-start gap-3 scale-in" style={{ animationDelay: "0.3s" }}>
            <div className="h-10 w-10 rounded-2xl bg-emerald-500/10 flex items-center justify-center shrink-0">
              <CheckCircle2 className="h-5 w-5 text-emerald-500" />
            </div>
            <div className="min-w-0">
              <p className="font-bold card-heading">Device connection</p>
              <p className="text-xs card-body mt-1 leading-5">
                ESP32 sensor status: {esp32?.online ? "online" : "waiting for connection"} · Last seen {relativeTime(esp32?.lastSeen)}
              </p>
              <p className="text-xs card-muted mt-2">
                Camera streaming and water-level sensing will use this view when their devices are configured.
              </p>
            </div>
          </section>
        </div>
      </main>

      <BottomNavigation />
    </PageShell>
  );
}