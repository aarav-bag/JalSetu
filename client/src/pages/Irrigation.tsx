import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  AlertTriangle,
  Check,
  Cloud,
  CloudRain,
  CloudSun,
  Droplet,
  Gauge,
  Info,
  MapPin,
  RefreshCw,
  Settings as SettingsIcon,
  ShieldCheck,
  Sprout,
  Sun,
  Waves,
} from "lucide-react";
import BottomNavigation from "@/components/BottomNavigation";
import LocationPicker from "@/components/LocationPicker";
import PageShell from "@/components/PageShell";
import { useUserLocation } from "@/context/LocationContext";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useLocation as useRouterLocation } from "wouter";

interface SoilField {
  id: number;
  name: string;
  value: number;
  status: "optimal" | "warning" | "danger" | string;
  hasReading?: boolean;
}

interface FarmData {
  soilMoisture?: {
    level: number;
    status: string;
    fields: SoilField[];
  };
}

type WeatherKind = "sunny" | "cloudy" | "rainy" | "partly-cloudy";

interface ForecastDay {
  day: string;
  date: string;
  temperature: string | number;
  tempMin?: string | number;
  weather: WeatherKind;
  rainChance?: number;
  precipitation?: number;
}

interface WeatherData {
  message: string;
  advice: string;
  forecast: ForecastDay[];
  location?: { lat: number; lon: number };
}

interface PumpControl {
  fieldId: number;
  fieldName: string;
  mode: "off" | "manual" | "auto";
  manualOn: boolean;
  powerVerified: boolean;
  relayVerified: boolean;
  lowWaterVerified: boolean;
  maxRunSeconds: number;
  firmwareEnabled: boolean;
  actualOn: boolean;
  actualUpdatedAt: string | null;
  soilMoisture: number | null;
  rainChance: number | null;
  desiredOn: boolean;
  decisionReason: string;
  safetyReady: boolean;
}

interface PumpControlResponse {
  farmId: number;
  locationConfigured: boolean;
  pumps: PumpControl[];
}

const safetyRequirements = [
  "Verified GPIO pin and relay polarity",
  "Pump power wiring checked for the installed load",
  "Calibrated low-water cutoff",
  "Independent low-water protection",
  "Safe maximum run-time limit",
];

function statusStyle(status: SoilField["status"]): string {
  if (status === "optimal") {
    return "border-teal-500/25 bg-teal-500/10 text-teal-700 dark:text-teal-200";
  }
  if (status === "warning") {
    return "border-amber-500/25 bg-amber-500/10 text-amber-700 dark:text-amber-200";
  }
  if (status === "danger") {
    return "border-rose-500/25 bg-rose-500/10 text-rose-700 dark:text-rose-200";
  }
  return "border-slate-400/25 bg-slate-400/10 text-slate-600 dark:text-slate-300";
}

function weatherIcon(weather: WeatherKind) {
  switch (weather) {
    case "sunny":
      return <Sun className="h-5 w-5 text-amber-500 dark:text-amber-300" aria-hidden="true" />;
    case "cloudy":
      return <Cloud className="h-5 w-5 text-slate-500 dark:text-slate-300" aria-hidden="true" />;
    case "rainy":
      return <CloudRain className="h-5 w-5 text-cyan-700 dark:text-cyan-300" aria-hidden="true" />;
    case "partly-cloudy":
      return <CloudSun className="h-5 w-5 text-teal-700 dark:text-teal-300" aria-hidden="true" />;
  }
}

function valueText(value: string | number | undefined): string | null {
  if (typeof value === "number") {
    return Number.isFinite(value) ? String(value) : null;
  }
  return typeof value === "string" && value.trim().length > 0 ? value : null;
}

function formatTemperature(value: string | number | undefined): string | null {
  const text = valueText(value);
  if (!text) return null;
  return /°\s*C?$/i.test(text) ? text : `${text}°C`;
}

function FieldMoistureCard({ field }: { field: SoilField }) {
  const hasValidReading = field.hasReading === true
    && typeof field.value === "number"
    && Number.isFinite(field.value);
  const clampedValue = hasValidReading ? Math.min(100, Math.max(0, field.value)) : 0;

  return (
    <article className="glass-tile rounded-2xl p-4 sm:p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-teal-500/20 bg-teal-500/10">
            <Sprout className="h-5 w-5 text-teal-700 dark:text-teal-300" aria-hidden="true" />
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-bold card-heading">{field.name}</p>
            <p className="mt-0.5 text-xs card-muted">Soil moisture sensor</p>
          </div>
        </div>
        {hasValidReading && (
          <span className={`shrink-0 rounded-full border px-2.5 py-1 text-[10px] font-semibold capitalize ${statusStyle(field.status)}`}>
            {field.status}
          </span>
        )}
      </div>

      {hasValidReading ? (
        <div className="mt-5">
          <div className="flex items-baseline gap-1.5">
            <span className="text-3xl font-bold tracking-tight card-value">{field.value}</span>
            <span className="text-sm font-semibold card-muted">%</span>
          </div>
          <div
            className="mt-3 h-2 overflow-hidden rounded-full bg-teal-950/10 dark:bg-white/10"
            role="meter"
            aria-label={`${field.name} soil moisture`}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={clampedValue}
          >
            <div
              className="h-full rounded-full bg-gradient-to-r from-teal-600 to-lime-500 transition-[width] duration-500"
              style={{ width: `${clampedValue}%` }}
            />
          </div>
        </div>
      ) : (
        <div className="mt-4 flex items-center gap-2 rounded-xl border border-amber-500/20 bg-amber-500/[0.07] px-3 py-2.5">
          <AlertTriangle className="h-4 w-4 shrink-0 text-amber-600 dark:text-amber-300" aria-hidden="true" />
          <span className="text-xs font-semibold text-amber-800 dark:text-amber-100">Reading unavailable</span>
        </div>
      )}
    </article>
  );
}

interface PumpControlCardProps {
  pump: PumpControl;
  busy: boolean;
  onMode: (pump: PumpControl, mode: "off" | "auto") => Promise<void>;
  onManual: (pump: PumpControl, on: boolean) => Promise<void>;
}

function PumpControlCard({ pump, busy, onMode, onManual }: PumpControlCardProps) {
  const statusText = pump.actualUpdatedAt
    ? `${pump.actualOn ? "ON" : "OFF"} · device reported`
    : "Waiting for ESP32 status";
  const checksConfirmed = pump.powerVerified && pump.relayVerified && pump.lowWaterVerified;
  const safetyStatus = pump.safetyReady
    ? statusText
    : checksConfirmed
      ? "Waiting for ESP32"
      : "Safety locked";
  const controlId = `pump-${pump.fieldId}`;

  return (
    <article className="glass-tile rounded-2xl p-4 sm:p-5">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-400/20 bg-slate-400/10">
            <Waves className="h-5 w-5 text-slate-600 dark:text-slate-300" aria-hidden="true" />
          </div>
          <div>
            <h3 className="text-sm font-bold card-heading">{pump.fieldName}</h3>
            <p className="mt-0.5 text-xs card-muted">Pump control</p>
          </div>
        </div>
        <span className={`rounded-full border px-2.5 py-1 text-[10px] font-semibold ${
          pump.safetyReady
            ? "border-teal-500/25 bg-teal-500/10 text-teal-700 dark:text-teal-200"
            : "border-amber-500/25 bg-amber-500/10 text-amber-700 dark:text-amber-200"
        }`}>
          {safetyStatus}
        </span>
      </div>

      <p className="mt-4 text-xs leading-relaxed card-body">
        Mode: <span className="font-semibold capitalize">{pump.mode}</span>
        {" · "}Maximum run: <span className="font-semibold">{pump.maxRunSeconds}s</span>
      </p>
      {!pump.safetyReady && (
        <p className="mt-2 text-xs leading-relaxed text-amber-800 dark:text-amber-200">
          Safety setup is incomplete. Complete this pump’s setup in Settings to unlock manual and automatic controls.
        </p>
      )}
      <div className="mt-3 rounded-xl border border-cyan-700/15 bg-cyan-700/[0.04] p-3">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wide card-muted">Controller decision</p>
            <p className="mt-1 text-xs leading-relaxed card-body">{pump.decisionReason}</p>
          </div>
          <span className={`shrink-0 rounded-full px-2 py-1 text-[10px] font-bold ${
            pump.desiredOn
              ? "bg-teal-600/10 text-teal-800 dark:text-teal-200"
              : "bg-slate-500/10 text-slate-700 dark:text-slate-200"
          }`}>
            Target {pump.desiredOn ? "ON" : "OFF"}
          </span>
        </div>
        <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-[10px] font-semibold card-muted">
          <span>Soil: {pump.soilMoisture === null ? "unavailable" : `${pump.soilMoisture}%`}</span>
          <span>Today’s rain chance: {pump.rainChance === null ? "unavailable" : `${pump.rainChance}%`}</span>
          <span>Device: {pump.actualOn ? "ON" : "OFF"}</span>
        </div>
      </div>
      <div className="mt-4 grid grid-cols-2 gap-2">
        <button
          type="button"
          onClick={() => void onManual(pump, true)}
          disabled={busy || !pump.safetyReady}
          aria-describedby={`${controlId}-control-note`}
          className="flex min-h-11 items-center justify-center gap-2 rounded-xl border border-teal-700/20 bg-teal-700/[0.06] px-3 text-xs font-bold text-teal-900 transition-colors hover:bg-teal-700/10 disabled:cursor-not-allowed disabled:opacity-45 dark:text-teal-100"
        >
          <Check className="h-3.5 w-3.5" aria-hidden="true" />
          Manual on
        </button>
        <button
          type="button"
          onClick={() => void onManual(pump, false)}
          disabled={busy}
          aria-describedby={`${controlId}-control-note`}
          className="flex min-h-11 items-center justify-center gap-2 rounded-xl border border-slate-400/25 bg-slate-400/[0.07] px-3 text-xs font-bold text-slate-700 transition-colors hover:bg-slate-400/15 disabled:cursor-not-allowed disabled:opacity-45 dark:text-slate-200"
        >
          <Waves className="h-3.5 w-3.5" aria-hidden="true" />
          Stop
        </button>
      </div>
      <div className="mt-2 grid grid-cols-2 gap-2">
        <button
          type="button"
          onClick={() => void onMode(pump, "auto")}
          disabled={busy || !pump.safetyReady}
          className="min-h-10 rounded-xl border border-cyan-700/20 bg-cyan-700/[0.06] px-3 text-xs font-bold text-cyan-900 transition-colors hover:bg-cyan-700/10 disabled:cursor-not-allowed disabled:opacity-45 dark:text-cyan-100"
        >
          Automatic
        </button>
        <button
          type="button"
          onClick={() => void onMode(pump, "off")}
          disabled={busy}
          className="min-h-10 rounded-xl border border-slate-400/25 px-3 text-xs font-bold card-body transition-colors hover:bg-slate-400/10 disabled:cursor-not-allowed disabled:opacity-45"
        >
          Disable mode
        </button>
      </div>

      <p id={`${controlId}-control-note`} className="mt-3 text-[11px] leading-relaxed card-muted">
        Manual control still uses the device maximum-run timer and low-water protection.
      </p>
    </article>
  );
}

const Irrigation = () => {
  const [, navigate] = useRouterLocation();
  const { location, isSet } = useUserLocation();
  const configuredLocation = isSet ? location : null;
  const [showLocationPicker, setShowLocationPicker] = useState(!isSet);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const {
    data: farmData,
    isLoading: isFarmLoading,
    isError: isFarmError,
    refetch: refetchFarm,
  } = useQuery<FarmData>({ queryKey: ["/api/user-dashboard"] });

  const {
    data: weather,
    isLoading: isWeatherLoading,
    isError: isWeatherError,
    refetch: refetchWeather,
  } = useQuery<WeatherData>({
    queryKey: ["/api/weather", configuredLocation?.lat ?? null, configuredLocation?.lon ?? null],
    queryFn: async () => {
      const url = configuredLocation
        ? `/api/weather?lat=${encodeURIComponent(String(configuredLocation.lat))}&lon=${encodeURIComponent(String(configuredLocation.lon))}`
        : "/api/weather";
      const response = await fetch(url);
      if (!response.ok) throw new Error("Weather forecast could not be loaded");
      return response.json() as Promise<WeatherData>;
    },
    staleTime: 15 * 60 * 1000,
    retry: 2,
  });

  useEffect(() => {
    if (!configuredLocation) return;
    void apiRequest("/api/irrigation/location", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ lat: configuredLocation.lat, lon: configuredLocation.lon }),
    }).catch(() => {
      toast({
        title: "Farm location could not be synced",
        description: "Automatic irrigation needs a saved farm location to check rain forecasts.",
        variant: "destructive",
      });
    });
  }, [configuredLocation?.lat, configuredLocation?.lon, toast]);

  const pumpQuery = useQuery<PumpControlResponse>({
    queryKey: ["/api/irrigation/pumps"],
    refetchInterval: 5000,
    staleTime: 0,
  });

  const updatePumpMutation = useMutation({
    mutationFn: async (input: { fieldId: number; mode: "off" | "manual" | "auto"; manualOn?: boolean }) => {
      await apiRequest(`/api/irrigation/pumps/${input.fieldId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mode: input.mode, manualOn: input.manualOn }),
      });
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["/api/irrigation/pumps"] }),
    onError: (error) => toast({
      title: "Pump command was not accepted",
      description: error instanceof Error ? error.message : "Check the safety status and try again.",
      variant: "destructive",
    }),
  });

  const setPumpMode = async (pump: PumpControl, mode: "off" | "auto") => {
    try {
      await updatePumpMutation.mutateAsync({ fieldId: pump.fieldId, mode });
    } catch {
      // Mutation feedback is shown by onError.
    }
  };

  const setManualPump = async (pump: PumpControl, manualOn: boolean) => {
    try {
      await updatePumpMutation.mutateAsync({ fieldId: pump.fieldId, mode: "manual", manualOn });
    } catch {
      // Mutation feedback is shown by onError.
    }
  };

  const fields = farmData?.soilMoisture?.fields ?? [];
  const pumps = pumpQuery.data?.pumps ?? [];
  const allPumpsSafetyReady = pumps.length > 0 && pumps.every((pump) => pump.safetyReady);
  const allPumpChecksConfirmed = pumps.length > 0 && pumps.every((pump) =>
    pump.powerVerified && pump.relayVerified && pump.lowWaterVerified
  );
  const reportingCount = fields.filter((field) =>
    field.hasReading === true && typeof field.value === "number" && Number.isFinite(field.value)
  ).length;

  return (
    <PageShell>
      <header className="relative z-10 px-5 pb-4 pt-10 sm:px-7 sm:pt-12">
        <div className="mx-auto flex max-w-5xl items-start justify-between gap-4">
          <div>
            <div className="mb-2 flex items-center gap-2">
              <span className="h-px w-7 bg-teal-600/60 dark:bg-teal-300/60" />
              <span className="text-[10px] font-bold uppercase tracking-[0.22em] text-teal-800 dark:text-teal-200">JalSetu · Field systems</span>
            </div>
            <h1 className="text-3xl font-bold tracking-tight page-title sm:text-4xl">Irrigation</h1>
            <p className="mt-1 max-w-md text-sm page-subtitle">Soil readings, weather outlook, and pump safety in one place.</p>
          </div>
          <div className="mt-1 flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-teal-500/20 bg-teal-500/10 shadow-sm">
            <Droplet className="h-6 w-6 text-teal-700 dark:text-teal-300" aria-hidden="true" />
          </div>
        </div>
      </header>

      <main className="z-10 flex-1 overflow-y-auto px-4 pb-32 pt-1 sm:px-6">
        <div className="mx-auto max-w-5xl space-y-5">
          <section
            className="relative overflow-hidden rounded-[1.75rem] border border-teal-700/15 p-5 shadow-lg shadow-teal-950/[0.06] sm:p-7"
            style={{
              background: "linear-gradient(125deg, rgba(13,148,136,0.16) 0%, rgba(132,204,22,0.09) 58%, rgba(255,255,255,0.16) 100%)",
            }}
            aria-labelledby="moisture-title"
          >
            <div className="pointer-events-none absolute -right-10 -top-14 h-48 w-48 rounded-full border border-teal-700/10" />
            <div className="pointer-events-none absolute -right-1 -top-5 h-28 w-28 rounded-full border border-teal-700/10" />
            <div className="relative flex flex-col justify-between gap-6 sm:flex-row sm:items-end">
              <div className="max-w-xl">
                <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-teal-700/15 bg-white/25 px-3 py-1.5 text-[11px] font-semibold text-teal-900 dark:bg-black/10 dark:text-teal-100">
                  <Gauge className="h-3.5 w-3.5" aria-hidden="true" />
                  Sensor overview
                </div>
                <h2 id="moisture-title" className="text-xl font-bold tracking-tight card-heading sm:text-2xl">Soil moisture</h2>
                <p className="mt-1.5 text-sm leading-relaxed card-body">
                  Readings come from your connected field sensors. No estimate is substituted when a sensor has not reported.
                </p>
              </div>
              <div className="flex items-end gap-3 sm:min-w-[190px] sm:justify-end">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-teal-700/15 bg-teal-700/10">
                  <Droplet className="h-6 w-6 text-teal-800 dark:text-teal-200" aria-hidden="true" />
                </div>
                <div>
                  <p className="text-2xl font-bold leading-none tracking-tight card-value">
                    {isFarmLoading ? "—" : `${reportingCount}/${fields.length}`}
                  </p>
                  <p className="mt-1 text-[11px] font-medium card-muted">fields reporting</p>
                </div>
              </div>
            </div>
          </section>

          <section aria-labelledby="field-readings-title">
            <div className="mb-3 flex items-end justify-between gap-3 px-1">
              <div>
                <h2 id="field-readings-title" className="text-base font-bold card-heading">Field readings</h2>
                <p className="mt-0.5 text-xs card-muted">Most recent values received by JalSetu</p>
              </div>
              {isFarmError && (
                <button
                  type="button"
                  onClick={() => void refetchFarm()}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-teal-700/15 px-3 py-2 text-xs font-semibold text-teal-800 transition-colors hover:bg-teal-700/5 dark:text-teal-200"
                >
                  <RefreshCw className="h-3.5 w-3.5" aria-hidden="true" />
                  Retry
                </button>
              )}
            </div>

            {isFarmLoading ? (
              <div className="grid gap-3 sm:grid-cols-2" aria-label="Loading field readings">
                {[0, 1].map((item) => (
                  <div key={item} className="glass-card h-36 animate-pulse rounded-2xl p-4">
                    <div className="h-3 w-1/3 rounded-full bg-teal-900/10 dark:bg-white/10" />
                    <div className="mt-5 h-7 w-1/4 rounded-lg bg-teal-900/10 dark:bg-white/10" />
                    <div className="mt-4 h-2 w-full rounded-full bg-teal-900/10 dark:bg-white/10" />
                  </div>
                ))}
              </div>
            ) : isFarmError ? (
              <div className="glass-card rounded-2xl p-5" role="alert">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-600 dark:text-amber-300" aria-hidden="true" />
                  <div>
                    <p className="text-sm font-semibold card-heading">Field readings could not be loaded</p>
                    <p className="mt-1 text-xs leading-relaxed card-body">Check your connection and try again. No readings are being shown until they can be verified.</p>
                  </div>
                </div>
              </div>
            ) : fields.length > 0 ? (
              <div className="grid gap-3 sm:grid-cols-2">
                {fields.map((field) => <FieldMoistureCard key={field.id} field={field} />)}
              </div>
            ) : (
              <div className="glass-card rounded-2xl px-5 py-7 text-center">
                <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-2xl border border-teal-700/15 bg-teal-700/[0.07]">
                  <Sprout className="h-5 w-5 text-teal-700 dark:text-teal-300" aria-hidden="true" />
                </div>
                <h3 className="mt-3 text-sm font-bold card-heading">No field sensors listed</h3>
                <p className="mx-auto mt-1 max-w-sm text-xs leading-relaxed card-body">When field sensors are connected to your farm, their verified moisture readings will appear here.</p>
              </div>
            )}
          </section>

          <section aria-labelledby="forecast-title">
            <div className="mb-3 flex items-end justify-between gap-3 px-1">
              <div>
                <h2 id="forecast-title" className="text-base font-bold card-heading">Seven-day outlook</h2>
                <p className="mt-0.5 text-xs card-muted">Weather is guidance only, not a pump command.</p>
              </div>
              <button
                type="button"
                onClick={() => void refetchWeather()}
                disabled={isWeatherLoading}
                aria-label="Refresh weather forecast"
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-teal-700/15 bg-white/20 text-teal-800 transition-colors hover:bg-teal-700/5 disabled:opacity-50 dark:text-teal-200"
              >
                <RefreshCw className={`h-4 w-4 ${isWeatherLoading ? "animate-spin" : ""}`} aria-hidden="true" />
              </button>
            </div>

            <div className="glass-card rounded-[1.5rem] p-4 sm:p-5">
              <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2 rounded-full border border-teal-700/15 bg-teal-700/[0.06] px-3 py-1.5 text-xs font-semibold text-teal-900 dark:text-teal-100">
                  <MapPin className="h-3.5 w-3.5" aria-hidden="true" />
                  {configuredLocation?.cityName || "Location not configured"}
                </div>
                {configuredLocation ? (
                  <button
                    type="button"
                    onClick={() => setShowLocationPicker((visible) => !visible)}
                    className="rounded-xl border border-teal-700/15 px-3 py-1.5 text-xs font-semibold text-teal-800 transition-colors hover:bg-teal-700/5 dark:text-teal-200"
                  >
                    {showLocationPicker ? "Close" : "Change location"}
                  </button>
                ) : (
                  <span className="text-[11px] card-muted">Using the forecast service default area</span>
                )}
              </div>

              {showLocationPicker && (
                <div className="mb-4">
                  <LocationPicker compact={false} onSet={() => setShowLocationPicker(false)} />
                </div>
              )}

              {isWeatherLoading ? (
                <div className="space-y-4" aria-label="Loading forecast">
                  <div className="h-14 animate-pulse rounded-2xl bg-teal-900/[0.05] dark:bg-white/[0.05]" />
                  <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 lg:grid-cols-7">
                    {Array.from({ length: 7 }, (_, index) => (
                      <div key={index} className="h-28 animate-pulse rounded-2xl bg-teal-900/[0.05] dark:bg-white/[0.05]" />
                    ))}
                  </div>
                </div>
              ) : isWeatherError ? (
                <div className="rounded-2xl border border-rose-500/20 bg-rose-500/[0.06] p-4" role="alert">
                  <div className="flex items-start gap-3">
                    <Cloud className="mt-0.5 h-5 w-5 shrink-0 text-rose-700 dark:text-rose-300" aria-hidden="true" />
                    <div>
                      <p className="text-sm font-semibold card-heading">Forecast unavailable</p>
                      <p className="mt-1 text-xs card-body">Weather advice is unavailable until the forecast can be reached.</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => void refetchWeather()}
                    className="mt-3 inline-flex items-center gap-1.5 rounded-lg border border-rose-500/20 px-3 py-2 text-xs font-semibold text-rose-800 dark:text-rose-200"
                  >
                    <RefreshCw className="h-3 w-3" aria-hidden="true" />
                    Try again
                  </button>
                </div>
              ) : !weather || !Array.isArray(weather.forecast) || weather.forecast.length === 0 ? (
                <div className="rounded-2xl border border-teal-700/10 bg-teal-700/[0.04] px-4 py-6 text-center">
                  <Cloud className="mx-auto h-6 w-6 text-teal-700/60 dark:text-teal-200/60" aria-hidden="true" />
                  <p className="mt-2 text-sm font-semibold card-heading">No forecast days available</p>
                  <p className="mt-1 text-xs card-body">There are no forecast details to show right now.</p>
                </div>
              ) : (
                <>
                  <div className="mb-4 flex items-start gap-3 rounded-2xl border border-teal-700/15 bg-teal-700/[0.06] p-3.5 sm:p-4">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-teal-700/10">
                      <Info className="h-4.5 w-4.5 text-teal-800 dark:text-teal-200" aria-hidden="true" />
                    </div>
                    <div className="min-w-0">
                      {weather.message && <p className="text-sm font-bold leading-snug card-heading">{weather.message}</p>}
                      <p className="text-sm leading-relaxed card-body">{weather.advice || "No weather advice is available for this forecast."}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 lg:grid-cols-7">
                    {weather.forecast.slice(0, 7).map((day, index) => {
                      const temperature = formatTemperature(day.temperature);
                      const low = formatTemperature(day.tempMin);
                      const rainChance = typeof day.rainChance === "number" && Number.isFinite(day.rainChance)
                        ? `${day.rainChance}%`
                        : null;
                      const precipitation = typeof day.precipitation === "number" && Number.isFinite(day.precipitation)
                        ? `${day.precipitation} mm`
                        : null;

                      return (
                        <article key={`${day.date}-${index}`} className="glass-tile min-w-0 rounded-2xl p-3 text-center">
                          <p className="truncate text-[11px] font-bold card-heading">{day.day || "Forecast day"}</p>
                          <p className="mt-0.5 truncate text-[10px] card-muted">{day.date || "Date unavailable"}</p>
                          <div className="my-3 flex justify-center">{weatherIcon(day.weather)}</div>
                          <p className="text-sm font-bold card-value">{temperature || "—"}</p>
                          {low && <p className="mt-0.5 text-[10px] card-muted">Low {low}</p>}
                          {(rainChance || precipitation) && (
                            <div className="mt-3 space-y-1 border-t divider pt-2 text-[10px] font-semibold text-teal-800 dark:text-teal-200">
                              {rainChance && (
                                <p className="flex items-center justify-center gap-1">
                                  <CloudRain className="h-3 w-3" aria-hidden="true" />
                                  {rainChance}
                                </p>
                              )}
                              {precipitation && <p>{precipitation}</p>}
                            </div>
                          )}
                        </article>
                      );
                    })}
                  </div>
                </>
              )}
            </div>
          </section>

          <section aria-labelledby="pump-title">
            <div className="mb-3 px-1">
              <h2 id="pump-title" className="text-base font-bold card-heading">Pump controls</h2>
              <p className="mt-0.5 text-xs card-muted">
                Automatic starts below 35% soil moisture only when rain chance is below 50%; it stops at 60% moisture or high rain. Safety checks and run-time limits are saved in Settings.
              </p>
            </div>

            {pumpQuery.isLoading ? (
              <div className="grid gap-3 sm:grid-cols-2" aria-label="Loading pump controls">
                {[0, 1].map((item) => <div key={item} className="glass-card h-52 animate-pulse rounded-2xl" />)}
              </div>
            ) : pumpQuery.isError ? (
              <div className="glass-card rounded-2xl p-4" role="alert">
                <p className="text-sm font-semibold card-heading">Pump settings could not be loaded</p>
                <button
                  type="button"
                  onClick={() => void pumpQuery.refetch()}
                  className="mt-2 rounded-lg border divider px-3 py-2 text-xs font-semibold card-body"
                >
                  Retry
                </button>
              </div>
            ) : (
              <div className="grid gap-3 sm:grid-cols-2">
                {(pumpQuery.data?.pumps ?? []).map((pump) => (
                  <PumpControlCard
                    key={pump.fieldId}
                    pump={pump}
                    busy={updatePumpMutation.isPending}
                    onMode={setPumpMode}
                    onManual={setManualPump}
                  />
                ))}
                {!pumpQuery.data?.pumps.length && (
                  <div className="glass-card rounded-2xl p-4 text-xs card-body">
                    Add two fields to this farm before assigning pump controls.
                  </div>
                )}
              </div>
            )}

            {allPumpChecksConfirmed ? (
              <div
                className={`mt-3 flex items-center justify-between gap-3 rounded-2xl border p-3 sm:p-4 ${
                  allPumpsSafetyReady
                    ? "border-teal-600/20 bg-teal-600/[0.06]"
                    : "border-amber-500/25 bg-amber-500/[0.07]"
                }`}
                role="status"
              >
                <div className="flex min-w-0 items-center gap-3">
                  <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border ${
                    allPumpsSafetyReady
                      ? "border-teal-600/20 bg-teal-600/10"
                      : "border-amber-500/20 bg-amber-500/10"
                  }`}>
                    <ShieldCheck
                      className={`h-5 w-5 ${
                        allPumpsSafetyReady
                          ? "text-teal-700 dark:text-teal-200"
                          : "text-amber-700 dark:text-amber-200"
                      }`}
                      aria-hidden="true"
                    />
                  </div>
                  <div className="min-w-0">
                    <p className={`text-sm font-bold ${
                      allPumpsSafetyReady
                        ? "text-teal-950 dark:text-teal-100"
                        : "text-amber-950 dark:text-amber-100"
                    }`}>
                      {allPumpsSafetyReady ? "Safety confirmed" : "Safety checks saved"}
                    </p>
                    <p className={`text-xs ${
                      allPumpsSafetyReady
                        ? "text-teal-900/75 dark:text-teal-100/70"
                        : "text-amber-900/80 dark:text-amber-100/70"
                    }`}>
                      {allPumpsSafetyReady
                        ? "Edit checks and run time in Settings."
                        : "Waiting for ESP32 outputs. Edit settings anytime."}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => navigate("/settings")}
                  className="flex min-h-10 shrink-0 items-center gap-1.5 rounded-xl border border-teal-700/20 bg-white/40 px-3 text-xs font-bold text-teal-900 transition-colors hover:bg-white/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-600 dark:bg-black/10 dark:text-teal-100 dark:hover:bg-black/20"
                >
                  <SettingsIcon className="h-3.5 w-3.5" aria-hidden="true" />
                  Settings
                </button>
              </div>
            ) : (
              <div className="mt-3 rounded-2xl border border-amber-500/25 bg-amber-500/[0.07] p-4 sm:p-5">
                <div className="flex items-start gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-amber-500/20 bg-amber-500/10">
                    <ShieldCheck className="h-5 w-5 text-amber-700 dark:text-amber-200" aria-hidden="true" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-sm font-bold text-amber-950 dark:text-amber-100">Safety commissioning required</h3>
                    <p className="mt-1 text-xs leading-relaxed text-amber-900/80 dark:text-amber-100/70">
                      The ESP32 must report its relay outputs enabled. Missing or stale sensor/weather data blocks automatic starts; each run is limited by its saved maximum duration.
                    </p>
                  </div>
                </div>
                <ul className="mt-4 grid gap-2 sm:grid-cols-2">
                  {safetyRequirements.map((requirement) => (
                    <li key={requirement} className="flex items-start gap-2 text-xs leading-relaxed text-amber-950/85 dark:text-amber-100/80">
                      <span className="mt-0.5 h-1.5 w-1.5 shrink-0 rounded-full bg-amber-600 dark:bg-amber-300" />
                      {requirement}
                    </li>
                  ))}
                </ul>
                <button
                  type="button"
                  onClick={() => navigate("/settings")}
                  className="mt-4 min-h-10 rounded-xl border border-amber-700/20 bg-white/50 px-4 text-xs font-bold text-amber-950 transition-colors hover:bg-white/75 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-600 dark:bg-black/10 dark:text-amber-100 dark:hover:bg-black/20"
                >
                  Configure safety in Settings
                </button>
              </div>
            )}

            <details className="glass-tile mt-3 rounded-2xl p-4 sm:p-5">
              <summary className="cursor-pointer text-sm font-bold card-heading">
                Two-pump relay wiring tutorial
              </summary>
              <div className="mt-4 space-y-4 text-xs leading-relaxed card-body">
                <p>
                  Your COM/NO/NC switching layout is right. Because the pumps are labeled 5V DC,
                  use a regulated 5V pump supply in place of the 9V batteries. Do not connect 9V
                  directly to a 5V pump or to relay VCC. No series resistor is needed.
                </p>
                <div className="grid gap-3 sm:grid-cols-2">
                  {["Field 1 / Relay 1 / Pump 1", "Field 2 / Relay 2 / Pump 2"].map((label) => (
                    <div key={label} className="rounded-xl border divider p-3">
                      <p className="mb-2 font-bold card-heading">{label}</p>
                      <ol className="list-decimal space-y-1 pl-4">
                        <li>5V supply positive → inline fuse → relay COM</li>
                        <li>Relay NO → pump positive</li>
                        <li>Pump negative → 5V supply negative</li>
                        <li>Leave relay NC unconnected</li>
                      </ol>
                    </div>
                  ))}
                </div>
                <p>
                  Size the 5V supply and each fuse for the pump’s startup current. Use the terminal
                  labels printed on the relay board. Relay VCC is a separate 5V control connection;
                  never connect the 9V battery to VCC or an ESP32 GPIO. The relay input pins and
                  pump controls stay disabled until the ESP32 pin mapping, trigger polarity, and
                  low-water/run-time safeguards are verified.
                </p>
                <p>
                  The firmware uses GPIO 25 for Field 1 and GPIO 26 for Field 2 relay inputs, with
                  active-low relay control. Outputs initialize OFF and only follow authenticated
                  server targets. Settings safety checks gate app commands; the ESP32 also enforces
                  its run-time limit and turns pumps off if it loses contact with the server.
                </p>
              </div>
            </details>
          </section>
        </div>
      </main>

      <BottomNavigation />
    </PageShell>
  );
};

export default Irrigation;
