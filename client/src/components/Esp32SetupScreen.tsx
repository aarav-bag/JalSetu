import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { Droplet, Scale, Shrub, ChevronRight, SkipForward } from "lucide-react";
import { useTheme } from "@/context/ThemeContext";

interface Esp32Status {
  online: boolean;
  lastSeen: string | null;
  lastData: { ph?: number; tds?: number; soilMoisture?: number };
}

type Phase = "waiting" | "connected" | "sensors";

interface Esp32SetupScreenProps {
  onComplete: () => void;
}

// ── Spinning/success ring ─────────────────────────────────────────────────────
function StatusRing({ phase }: { phase: "spinning" | "success" }) {
  const r = 36;
  const circ = 2 * Math.PI * r;

  return (
    <div className="relative w-24 h-24 flex items-center justify-center">
      {/* Glow behind ring */}
      <motion.div
        className="absolute inset-0 rounded-full"
        animate={{
          boxShadow:
            phase === "success"
              ? "0 0 32px rgba(16,185,129,0.45)"
              : "0 0 20px rgba(59,130,246,0.3)",
        }}
        transition={{ duration: 0.6 }}
      />

      <svg className="absolute inset-0 w-24 h-24 -rotate-90" viewBox="0 0 88 88">
        {/* Track */}
        <circle cx="44" cy="44" r={r} stroke="rgba(128,128,128,0.18)" strokeWidth="6" fill="none" />

        {/* Spinning arc → full green circle */}
        {phase === "spinning" ? (
          <motion.circle
            cx="44" cy="44" r={r}
            stroke="#3b82f6"
            strokeWidth="6"
            fill="none"
            strokeLinecap="round"
            strokeDasharray={`${circ * 0.28} ${circ * 0.72}`}
            animate={{ rotate: [0, 360] }}
            style={{ transformOrigin: "44px 44px" }}
            transition={{ duration: 1.1, repeat: Infinity, ease: "linear" }}
          />
        ) : (
          <motion.circle
            cx="44" cy="44" r={r}
            stroke="#10b981"
            strokeWidth="6"
            fill="rgba(16,185,129,0.12)"
            strokeLinecap="round"
            strokeDasharray={circ}
            initial={{ strokeDashoffset: circ }}
            animate={{ strokeDashoffset: 0 }}
            transition={{ duration: 0.55, ease: "easeOut" }}
          />
        )}

        {/* Checkmark draws in after ring fills */}
        {phase === "success" && (
          <motion.path
            d="M 26 45 L 38 57 L 63 31"
            stroke="#10b981"
            strokeWidth="5.5"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{ rotate: "90deg", transformOrigin: "44px 44px" }}
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 1 }}
            transition={{ duration: 0.45, delay: 0.45, ease: "easeOut" }}
          />
        )}
      </svg>
    </div>
  );
}

// ── Plug animation ────────────────────────────────────────────────────────────
function PlugAnimation() {
  return (
    <div className="relative flex items-center justify-center w-20 h-20 mx-auto mb-2">
      {/* Outer pulsing ring */}
      <motion.div
        className="absolute inset-0 rounded-full"
        style={{ background: "rgba(59,130,246,0.12)", border: "1.5px solid rgba(59,130,246,0.25)" }}
        animate={{ scale: [1, 1.18, 1], opacity: [0.7, 0.3, 0.7] }}
        transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
      />
      {/* Middle ring */}
      <motion.div
        className="absolute rounded-full"
        style={{
          inset: 8,
          background: "rgba(59,130,246,0.15)",
          border: "1.5px solid rgba(59,130,246,0.3)",
        }}
        animate={{ scale: [1, 1.12, 1], opacity: [0.8, 0.4, 0.8] }}
        transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut", delay: 0.3 }}
      />
      {/* Icon core */}
      <div
        className="relative z-10 w-12 h-12 rounded-2xl flex items-center justify-center text-2xl"
        style={{ background: "rgba(59,130,246,0.18)", border: "1.5px solid rgba(59,130,246,0.35)" }}
      >
        🔌
      </div>
    </div>
  );
}

// ── Sensor row ────────────────────────────────────────────────────────────────
function SensorRow({
  icon,
  label,
  desc,
  detected,
  delay,
  color,
}: {
  icon: React.ReactNode;
  label: string;
  desc: string;
  detected: boolean;
  delay: number;
  color: string;
}) {
  return (
    <motion.div
      initial={{ x: -24, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ delay, type: "spring", stiffness: 320, damping: 28 }}
      className="flex items-center gap-3 rounded-2xl px-4 py-3"
      style={{
        background: detected ? `${color}12` : "rgba(245,158,11,0.10)",
        border: `1px solid ${detected ? `${color}35` : "rgba(245,158,11,0.3)"}`,
      }}
    >
      <div
        className="h-9 w-9 rounded-xl flex items-center justify-center flex-shrink-0"
        style={{ background: detected ? `${color}22` : "rgba(245,158,11,0.18)", color: detected ? color : "#f59e0b" }}
      >
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-bold" style={{ color: detected ? color : "#f59e0b" }}>{label}</p>
        <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{desc}</p>
      </div>
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: delay + 0.15, type: "spring", stiffness: 400, damping: 20 }}
        className="flex-shrink-0 text-lg"
      >
        {detected ? "✅" : "⚠️"}
      </motion.div>
    </motion.div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────
export function Esp32SetupScreen({ onComplete }: Esp32SetupScreenProps) {
  const [phase, setPhase] = useState<Phase>("waiting");
  const hasConnected = useRef(false);
  const { darkMode } = useTheme();

  const { data: status } = useQuery<Esp32Status>({
    queryKey: ["/api/esp32/status"],
    refetchInterval: phase === "waiting" ? 3000 : false,
  });

  // Detect connection
  useEffect(() => {
    if (status?.online && !hasConnected.current) {
      hasConnected.current = true;
      setPhase("connected");
      // Auto-advance to sensor check after animation plays
      setTimeout(() => setPhase("sensors"), 2400);
    }
  }, [status?.online]);

  // Dark-mode palette
  const cardBg     = darkMode ? "rgba(15,20,32,0.97)"  : "rgba(255,255,255,0.98)";
  const cardShadow = darkMode
    ? "0 30px 70px rgba(0,0,0,0.65), 0 0 0 1px rgba(255,255,255,0.07)"
    : "0 30px 70px rgba(0,0,0,0.18), 0 0 0 1px rgba(255,255,255,0.8)";
  const titleColor   = darkMode ? "#f1f5f9" : "#0f172a";
  const bodyColor    = darkMode ? "#94a3b8"  : "#64748b";
  const dividerColor = darkMode ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.07)";

  const sensors = [
    {
      key: "ph",
      icon: <Droplet className="h-4 w-4" />,
      label: "pH Sensor",
      desc: "Measures water acidity level",
      detected: status?.lastData?.ph !== undefined,
      color: "#3b82f6",
    },
    {
      key: "tds",
      icon: <Scale className="h-4 w-4" />,
      label: "TDS Sensor",
      desc: "Measures dissolved minerals in water",
      detected: status?.lastData?.tds !== undefined,
      color: "#8b5cf6",
    },
    {
      key: "soil",
      icon: <Shrub className="h-4 w-4" />,
      label: "Soil Moisture Sensor",
      desc: "Measures water content in soil",
      detected: status?.lastData?.soilMoisture !== undefined,
      color: "#10b981",
    },
  ];

  const allDetected = sensors.every((s) => s.detected);

  return (
    <div
      className="fixed inset-0 z-[300] flex items-end sm:items-center justify-center p-3 sm:p-4"
      style={{ background: "rgba(0,0,0,0.72)", backdropFilter: "blur(10px)" }}
    >
      <motion.div
        initial={{ y: 70, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 70, opacity: 0 }}
        transition={{ type: "spring", stiffness: 360, damping: 30 }}
        className="w-full max-w-sm rounded-[2rem] flex flex-col overflow-hidden"
        style={{ background: cardBg, boxShadow: cardShadow, maxHeight: "calc(100dvh - 24px)" }}
      >
        {/* ── Top strip gradient ── */}
        <div className="h-1 w-full" style={{ background: "linear-gradient(to right, #3b82f6, #10b981)" }} />

        <div className="flex-1 overflow-y-auto">
          <AnimatePresence mode="wait">

            {/* ════ PHASE: WAITING ════ */}
            {phase === "waiting" && (
              <motion.div
                key="waiting"
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="px-6 pt-6 pb-5 flex flex-col items-center text-center gap-5"
              >
                <PlugAnimation />

                <div className="space-y-1.5">
                  <h2 className="text-xl font-bold" style={{ color: titleColor }}>
                    Connect Your ESP32
                  </h2>
                  <p className="text-sm leading-relaxed" style={{ color: bodyColor }}>
                    Plug your sensor device into a <strong>wall charger</strong> or USB power source to begin monitoring your farm.
                  </p>
                </div>

                {/* Steps */}
                <div className="w-full space-y-2.5">
                  {[
                    { step: "1", text: "Take the ESP32 sensor unit", icon: "📦" },
                    { step: "2", text: "Connect it to a wall charger via USB", icon: "🔌" },
                    { step: "3", text: "Wait for the blue light to blink", icon: "💡" },
                  ].map((s) => (
                    <div key={s.step} className="flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-left"
                      style={{ background: darkMode ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.04)", border: `1px solid ${dividerColor}` }}>
                      <span className="text-lg flex-shrink-0">{s.icon}</span>
                      <span className="text-sm font-medium" style={{ color: bodyColor }}>{s.text}</span>
                    </div>
                  ))}
                </div>

                {/* Spinner + label */}
                <div className="flex flex-col items-center gap-3">
                  <StatusRing phase="spinning" />
                  <motion.p
                    className="text-xs font-semibold"
                    style={{ color: "#3b82f6" }}
                    animate={{ opacity: [1, 0.4, 1] }}
                    transition={{ duration: 1.6, repeat: Infinity }}
                  >
                    Waiting for device…
                  </motion.p>
                </div>

                {/* Skip */}
                <button
                  onClick={onComplete}
                  className="flex items-center gap-1.5 text-xs font-semibold transition-opacity hover:opacity-70"
                  style={{ color: bodyColor }}
                >
                  <SkipForward className="h-3.5 w-3.5" />
                  Skip for now
                </button>
              </motion.div>
            )}

            {/* ════ PHASE: CONNECTED ════ */}
            {phase === "connected" && (
              <motion.div
                key="connected"
                initial={{ opacity: 0, scale: 0.94 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.94 }}
                className="px-6 py-10 flex flex-col items-center text-center gap-5"
              >
                <motion.div
                  animate={{ scale: [1, 1.08, 1] }}
                  transition={{ duration: 0.5, delay: 0.5 }}
                >
                  <StatusRing phase="success" />
                </motion.div>

                <motion.div
                  initial={{ y: 12, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.7 }}
                  className="space-y-1.5"
                >
                  <h2 className="text-xl font-bold" style={{ color: "#10b981" }}>
                    ESP32 Connected!
                  </h2>
                  <p className="text-sm" style={{ color: bodyColor }}>
                    Device found. Checking your sensors…
                  </p>
                </motion.div>

                {/* Animated dots */}
                <div className="flex gap-1.5">
                  {[0, 1, 2].map((i) => (
                    <motion.div key={i}
                      className="w-2 h-2 rounded-full bg-emerald-500"
                      animate={{ y: [0, -6, 0] }}
                      transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.15 }}
                    />
                  ))}
                </div>
              </motion.div>
            )}

            {/* ════ PHASE: SENSORS ════ */}
            {phase === "sensors" && (
              <motion.div
                key="sensors"
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="px-6 pt-6 pb-5 flex flex-col gap-5"
              >
                {/* Header */}
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-2xl flex items-center justify-center flex-shrink-0"
                    style={{ background: "rgba(16,185,129,0.18)", border: "1px solid rgba(16,185,129,0.35)" }}>
                    <span className="text-lg">🌿</span>
                  </div>
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: bodyColor }}>
                      Sensor Check
                    </p>
                    <h2 className="text-base font-bold leading-tight" style={{ color: titleColor }}>
                      Verifying Sensors
                    </h2>
                  </div>
                </div>

                <div className="h-px" style={{ background: dividerColor }} />

                {/* Sensor list */}
                <div className="space-y-2.5">
                  {sensors.map((s, i) => (
                    <SensorRow
                      key={s.key}
                      icon={s.icon}
                      label={s.label}
                      desc={s.desc}
                      detected={s.detected}
                      delay={i * 0.18}
                      color={s.color}
                    />
                  ))}
                </div>

                {/* Status note */}
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.7 }}
                  className="rounded-xl px-4 py-3"
                  style={{
                    background: allDetected ? "rgba(16,185,129,0.1)" : "rgba(245,158,11,0.1)",
                    border: `1px solid ${allDetected ? "rgba(16,185,129,0.3)" : "rgba(245,158,11,0.3)"}`,
                  }}
                >
                  <p className="text-xs font-semibold" style={{ color: allDetected ? "#10b981" : "#f59e0b" }}>
                    {allDetected
                      ? "✅ All sensors detected! Your farm is ready to monitor."
                      : "⚠️ Some sensors aren't sending data yet. Make sure all wires are connected, then tap Continue."}
                  </p>
                </motion.div>

                {/* CTA */}
                <motion.button
                  onClick={onComplete}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.85 }}
                  whileTap={{ scale: 0.97 }}
                  className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl text-sm font-bold text-white"
                  style={{ background: "linear-gradient(135deg, #3b82f6, #10b981)" }}
                >
                  Let's Go
                  <ChevronRight className="h-4 w-4" />
                </motion.button>

                {!allDetected && (
                  <button
                    onClick={onComplete}
                    className="text-center text-xs font-semibold transition-opacity hover:opacity-60"
                    style={{ color: bodyColor }}
                  >
                    Skip sensor check
                  </button>
                )}
              </motion.div>
            )}

          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}
