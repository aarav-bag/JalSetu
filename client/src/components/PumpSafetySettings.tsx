import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AlertTriangle, Check, ShieldCheck } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

interface PumpSafety {
  fieldId: number;
  fieldName: string;
  powerVerified: boolean;
  relayVerified: boolean;
  lowWaterVerified: boolean;
  maxRunSeconds: number;
  firmwareEnabled: boolean;
  safetyReady: boolean;
}

interface PumpSafetyResponse {
  pumps: PumpSafety[];
}

interface SafetyValues {
  powerVerified: boolean;
  relayVerified: boolean;
  lowWaterVerified: boolean;
  maxRunSeconds: number;
}

const safetyChecks: { key: keyof Omit<SafetyValues, "maxRunSeconds">; label: string }[] = [
  { key: "powerVerified", label: "Pump uses regulated 5V power; no 9V direct connection" },
  { key: "relayVerified", label: "Relay GPIO and ON/OFF polarity tested with pump power disconnected" },
  { key: "lowWaterVerified", label: "Independent physical low-water cutoff tested" },
];

const MAX_PUMP_RUN_SECONDS = 5;

function PumpSafetyCard({
  pump,
  busy,
  onSave,
}: {
  pump: PumpSafety;
  busy: boolean;
  onSave: (fieldId: number, values: SafetyValues) => Promise<void>;
}) {
  const [checks, setChecks] = useState({
    powerVerified: pump.powerVerified,
    relayVerified: pump.relayVerified,
    lowWaterVerified: pump.lowWaterVerified,
  });
  const [dirty, setDirty] = useState(false);

  useEffect(() => {
    if (dirty) return;
    setChecks({
      powerVerified: pump.powerVerified,
      relayVerified: pump.relayVerified,
      lowWaterVerified: pump.lowWaterVerified,
    });
  }, [dirty, pump.powerVerified, pump.relayVerified, pump.lowWaterVerified]);
  const statusLabel = pump.safetyReady
    ? "Safety ready"
    : Object.values(checks).every(Boolean) && !pump.firmwareEnabled
      ? "Waiting for ESP32"
      : "Confirmation required";

  const save = async () => {
    try {
      await onSave(pump.fieldId, { ...checks, maxRunSeconds: MAX_PUMP_RUN_SECONDS });
      setDirty(false);
    } catch {
      // Mutation feedback is shown by the parent.
    }
  };

  return (
    <article className="glass-tile rounded-2xl p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-sm font-bold card-heading">{pump.fieldName}</h3>
          <p className="mt-1 text-xs card-muted">{statusLabel}</p>
        </div>
        {pump.safetyReady
          ? <ShieldCheck className="h-5 w-5 shrink-0 text-teal-600 dark:text-teal-300" aria-hidden="true" />
          : <AlertTriangle className="h-5 w-5 shrink-0 text-amber-600 dark:text-amber-300" aria-hidden="true" />}
      </div>

      <fieldset className="mt-4 space-y-3">
        <legend className="sr-only">{pump.fieldName} safety checks</legend>
        {safetyChecks.map(({ key, label }) => (
          <label key={key} className="flex items-start gap-2 text-[11px] leading-relaxed card-body">
            <input
              type="checkbox"
              checked={checks[key]}
              disabled={busy}
              onChange={(event) => {
                setDirty(true);
                setChecks((previous) => ({ ...previous, [key]: event.target.checked }));
              }}
              className="mt-0.5"
            />
            <span>{label}</span>
          </label>
        ))}
      </fieldset>

      <div className="mt-4 flex items-center justify-between gap-3 text-[11px] card-body">
        <span>Maximum run time per start</span>
        <span className="font-semibold card-heading">{MAX_PUMP_RUN_SECONDS} sec</span>
      </div>

      <button
        type="button"
        disabled={busy || !dirty}
        onClick={() => void save()}
        className="mt-4 flex min-h-10 w-full items-center justify-center gap-2 rounded-xl border border-teal-700/20 bg-teal-700/[0.06] px-3 text-xs font-bold text-teal-900 transition-colors hover:bg-teal-700/10 disabled:cursor-not-allowed disabled:opacity-45 dark:text-teal-100"
      >
        <Check className="h-3.5 w-3.5" aria-hidden="true" />
        Save safety settings
      </button>
      <p className="mt-2 text-[10px] leading-relaxed card-muted">
        Clearing a safety check locks this pump until the check is confirmed again.
      </p>
    </article>
  );
}

export default function PumpSafetySettings() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const pumpQuery = useQuery<PumpSafetyResponse>({
    queryKey: ["/api/irrigation/pumps"],
    refetchInterval: 5000,
    staleTime: 0,
  });

  const saveMutation = useMutation({
    mutationFn: async ({ fieldId, ...values }: SafetyValues & { fieldId: number }) => {
      await apiRequest(`/api/irrigation/pumps/${fieldId}/commissioning`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
    },
    onSuccess: () => {
      toast({ title: "Safety settings saved", description: "Pump controls stay locked until all safety checks and device requirements pass." });
      void queryClient.invalidateQueries({ queryKey: ["/api/irrigation/pumps"] });
    },
    onError: (error) => toast({
      title: "Safety settings could not be saved",
      description: error instanceof Error ? error.message : "Please try again.",
      variant: "destructive",
    }),
  });

  const savePumpSafety = (fieldId: number, values: SafetyValues) =>
    saveMutation.mutateAsync({ fieldId, ...values });

  return (
    <section id="pump-safety-settings" aria-labelledby="pump-safety-title" className="space-y-3">
      <div className="px-1">
        <h2 id="pump-safety-title" className="text-xs font-bold page-subtitle uppercase tracking-widest">
          Pump safety
        </h2>
        <p className="mt-1 text-xs card-muted">
          Review safety confirmations. Each pump stops after a maximum of 5 seconds per start.
        </p>
      </div>

      {pumpQuery.isLoading ? (
        <div className="grid gap-3 sm:grid-cols-2" aria-label="Loading pump safety settings">
          {[0, 1].map((item) => <div key={item} className="glass-card h-52 animate-pulse rounded-2xl" />)}
        </div>
      ) : pumpQuery.isError ? (
        <div className="glass-card rounded-2xl p-4" role="alert">
          <p className="text-sm font-semibold card-heading">Pump safety settings could not be loaded</p>
          <button
            type="button"
            onClick={() => void pumpQuery.refetch()}
            className="mt-2 rounded-lg border divider px-3 py-2 text-xs font-semibold card-body"
          >
            Retry
          </button>
        </div>
      ) : pumpQuery.data?.pumps.length ? (
        <div className="grid gap-3 sm:grid-cols-2">
          {pumpQuery.data.pumps.map((pump) => (
            <PumpSafetyCard
              key={pump.fieldId}
              pump={pump}
              busy={saveMutation.isPending}
              onSave={savePumpSafety}
            />
          ))}
        </div>
      ) : (
        <div className="glass-card rounded-2xl p-4 text-xs card-body">
          Add fields on the Irrigation tab to configure their pump safety settings.
        </div>
      )}
    </section>
  );
}
