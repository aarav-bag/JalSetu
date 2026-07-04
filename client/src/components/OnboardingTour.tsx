import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Droplet,
  Scale,
  Shrub,
  Thermometer,
  LayoutDashboard,
  ChevronRight,
  ChevronLeft,
  X,
  Sparkles,
  CheckCircle2,
} from "lucide-react";

interface Step {
  id: string;
  icon: React.ReactNode;
  iconBg: string;
  iconBorder: string;
  title: string;
  subtitle: string;
  description: string;
  visual: React.ReactNode;
  tip?: string;
}

// ─── Reusable mini-gauge for soil moisture preview ───────────────────────────
const MiniGauge = ({ level, color }: { level: number; color: string }) => {
  const r = 28;
  const circ = 2 * Math.PI * r;
  const offset = circ - (level / 100) * circ;
  return (
    <svg width="72" height="72" viewBox="0 0 72 72" className="-rotate-90">
      <circle cx="36" cy="36" r={r} stroke="rgba(128,128,128,0.2)" strokeWidth="6" fill="none" />
      <circle
        cx="36" cy="36" r={r}
        stroke={color} strokeWidth="6" fill="none"
        strokeLinecap="round"
        strokeDasharray={circ} strokeDashoffset={offset}
        style={{ filter: `drop-shadow(0 0 5px ${color})` }}
      />
    </svg>
  );
};

// ─── pH scale bar ─────────────────────────────────────────────────────────────
const PhBar = () => (
  <div className="w-full space-y-1.5">
    <div className="relative h-4 rounded-full overflow-hidden"
      style={{ background: "linear-gradient(to right, #ef4444, #f59e0b, #10b981, #3b82f6, #8b5cf6)" }}>
      {/* marker at ~6.8 which is ~57% across 0-14 */}
      <div className="absolute top-0 h-full w-0.5 bg-white/90 shadow"
        style={{ left: "49%" }} />
      <div className="absolute -top-1 text-[9px] font-bold text-white"
        style={{ left: "calc(49% - 6px)" }}>6.8</div>
    </div>
    <div className="flex justify-between text-[10px] font-medium">
      <span className="text-red-500">Acidic (0)</span>
      <span className="text-emerald-500">Neutral (7)</span>
      <span className="text-violet-500">Alkaline (14)</span>
    </div>
  </div>
);

// ─── TDS bar ──────────────────────────────────────────────────────────────────
const TdsBar = () => {
  const segments = [
    { label: "Pure", range: "0–50", color: "#3b82f6" },
    { label: "Good", range: "50–300", color: "#10b981" },
    { label: "High", range: "300–600", color: "#f59e0b" },
    { label: "Danger", range: "600+", color: "#ef4444" },
  ];
  return (
    <div className="w-full space-y-2">
      <div className="flex gap-1 h-4 rounded-full overflow-hidden">
        {segments.map((s, i) => (
          <div key={i} className="flex-1 rounded-sm" style={{ background: s.color, opacity: i === 1 ? 1 : 0.55 }} />
        ))}
      </div>
      <div className="flex gap-1">
        {segments.map((s, i) => (
          <div key={i} className="flex-1 text-center">
            <div className="text-xs font-bold" style={{ color: s.color }}>{s.label}</div>
            <div className="text-[10px] text-gray-400">{s.range}</div>
          </div>
        ))}
      </div>
      <p className="text-xs text-center font-medium" style={{ color: "#10b981" }}>
        ✓ Best for crops: 50–300 ppm
      </p>
    </div>
  );
};

// ─── Steps definition ─────────────────────────────────────────────────────────
const STEPS: Step[] = [
  {
    id: "welcome",
    icon: <Sparkles className="h-6 w-6 text-amber-500" />,
    iconBg: "rgba(245,158,11,0.15)",
    iconBorder: "rgba(245,158,11,0.3)",
    title: "Welcome to FarmWise! 🌱",
    subtitle: "Your smart farming assistant",
    description:
      "This quick tour will show you what each number on your dashboard means — no technical knowledge needed. You'll know exactly what to do when a reading looks off.",
    visual: (
      <div className="flex flex-col items-center gap-3 py-2">
        <div className="grid grid-cols-3 gap-3 w-full">
          {[
            { label: "pH", value: "6.8", color: "#3b82f6", icon: <Droplet className="h-4 w-4" /> },
            { label: "TDS", value: "280 ppm", color: "#8b5cf6", icon: <Scale className="h-4 w-4" /> },
            { label: "Moisture", value: "68%", color: "#10b981", icon: <Shrub className="h-4 w-4" /> },
          ].map((m) => (
            <div key={m.label}
              className="rounded-2xl p-3 flex flex-col items-center gap-1.5"
              style={{ background: `${m.color}18`, border: `1px solid ${m.color}40` }}>
              <div className="h-8 w-8 rounded-xl flex items-center justify-center"
                style={{ background: `${m.color}25`, color: m.color }}>
                {m.icon}
              </div>
              <span className="text-sm font-bold" style={{ color: m.color }}>{m.value}</span>
              <span className="text-[10px] text-gray-500 dark:text-gray-400 font-medium">{m.label}</span>
            </div>
          ))}
        </div>
      </div>
    ),
    tip: "Takes about 1 minute to complete",
  },
  {
    id: "ph",
    icon: <Droplet className="h-6 w-6 text-blue-500" />,
    iconBg: "rgba(59,130,246,0.15)",
    iconBorder: "rgba(59,130,246,0.3)",
    title: "What is pH?",
    subtitle: "Water acidity level",
    description:
      "pH tells you how acidic or alkaline your water is. Think of it like a ruler from 0 to 14. Most crops love water that sits right in the middle — not too acidic, not too alkaline.",
    visual: (
      <div className="w-full space-y-4">
        <PhBar />
        <div className="grid grid-cols-3 gap-2">
          {[
            { range: "Below 6", meaning: "Too acidic — nutrients get locked out of soil", color: "#ef4444", emoji: "⚠️" },
            { range: "6 – 7.5", meaning: "Perfect — plants absorb nutrients easily", color: "#10b981", emoji: "✅" },
            { range: "Above 7.5", meaning: "Too alkaline — can cause yellowing leaves", color: "#8b5cf6", emoji: "⚠️" },
          ].map((r) => (
            <div key={r.range}
              className="rounded-xl p-2.5 text-center space-y-1"
              style={{ background: `${r.color}12`, border: `1px solid ${r.color}30` }}>
              <div className="text-sm">{r.emoji}</div>
              <div className="text-[10px] font-bold" style={{ color: r.color }}>{r.range}</div>
              <div className="text-[9px] text-gray-500 dark:text-gray-400 leading-snug">{r.meaning}</div>
            </div>
          ))}
        </div>
      </div>
    ),
    tip: "If your pH is off, check with your local agricultural office for lime or sulfur treatments",
  },
  {
    id: "tds",
    icon: <Scale className="h-6 w-6 text-purple-500" />,
    iconBg: "rgba(168,85,247,0.15)",
    iconBorder: "rgba(168,85,247,0.3)",
    title: "What is TDS?",
    subtitle: "Total Dissolved Solids — minerals in water",
    description:
      "TDS (measured in ppm — parts per million) shows how many minerals and salts are dissolved in your water. A little is good for crops, but too much acts like a poison to plant roots.",
    visual: (
      <div className="w-full space-y-3">
        <TdsBar />
        <div className="rounded-xl p-3 space-y-1.5"
          style={{ background: "rgba(168,85,247,0.08)", border: "1px solid rgba(168,85,247,0.2)" }}>
          <p className="text-[11px] font-semibold text-purple-600 dark:text-purple-300">💡 Easy way to remember it:</p>
          <p className="text-[11px] text-gray-600 dark:text-gray-300 leading-snug">
            Imagine dissolved minerals as salt in food. A pinch makes it tasty (crops grow well). Too much and it's inedible (crops wilt and die).
          </p>
        </div>
      </div>
    ),
    tip: "High TDS? Try mixing with cleaner water or check if fertilizer run-off is entering your irrigation source",
  },
  {
    id: "soil",
    icon: <Shrub className="h-6 w-6 text-emerald-500" />,
    iconBg: "rgba(16,185,129,0.15)",
    iconBorder: "rgba(16,185,129,0.3)",
    title: "What is Soil Moisture?",
    subtitle: "How wet your soil is — shown as a percentage",
    description:
      "Soil moisture is the percentage of water in your soil. Too dry and roots can't drink. Too wet and roots rot. The circular gauge on your dashboard shows you exactly where you are.",
    visual: (
      <div className="flex flex-col items-center gap-4">
        <div className="grid grid-cols-3 gap-3 w-full">
          {[
            { level: 20, label: "Too Dry", desc: "Crops stressed, irrigation needed now", color: "#ef4444" },
            { level: 68, label: "Optimal", desc: "Perfect — keep maintaining this level", color: "#10b981" },
            { level: 90, label: "Waterlogged", desc: "Stop irrigation, risk of root rot", color: "#3b82f6" },
          ].map((s) => (
            <div key={s.label} className="flex flex-col items-center gap-1.5">
              <div className="relative w-[72px] h-[72px] flex items-center justify-center">
                <MiniGauge level={s.level} color={s.color} />
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-sm font-bold" style={{ color: s.color }}>{s.level}%</span>
                </div>
              </div>
              <span className="text-[10px] font-bold" style={{ color: s.color }}>{s.label}</span>
              <span className="text-[9px] text-gray-500 dark:text-gray-400 text-center leading-snug">{s.desc}</span>
            </div>
          ))}
        </div>
      </div>
    ),
    tip: "Optimal range for most crops is 60–80%. Check your specific crop guide for exact needs",
  },
  {
    id: "temp",
    icon: <Thermometer className="h-6 w-6 text-orange-500" />,
    iconBg: "rgba(249,115,22,0.15)",
    iconBorder: "rgba(249,115,22,0.3)",
    title: "Water Temperature",
    subtitle: "Affects how plants absorb nutrients",
    description:
      "Water temperature influences how well plant roots absorb nutrients. Cold water can shock roots and slow growth. Very warm water holds less oxygen — also bad for roots.",
    visual: (
      <div className="w-full grid grid-cols-3 gap-2">
        {[
          { range: "Below 15°C", icon: "🥶", label: "Too Cold", desc: "Slows root activity, stunts growth", color: "#3b82f6" },
          { range: "18 – 26°C", icon: "✅", label: "Ideal", desc: "Roots absorb nutrients efficiently", color: "#10b981" },
          { range: "Above 30°C", icon: "🥵", label: "Too Warm", desc: "Less oxygen, risk of root disease", color: "#ef4444" },
        ].map((r) => (
          <div key={r.label}
            className="rounded-xl p-2.5 text-center space-y-1"
            style={{ background: `${r.color}12`, border: `1px solid ${r.color}30` }}>
            <div className="text-lg">{r.icon}</div>
            <div className="text-[10px] font-bold" style={{ color: r.color }}>{r.label}</div>
            <div className="text-[8.5px] text-gray-400 dark:text-gray-400">{r.range}</div>
            <div className="text-[9px] text-gray-500 dark:text-gray-400 leading-snug">{r.desc}</div>
          </div>
        ))}
      </div>
    ),
    tip: "Irrigate early morning when water temperature is naturally cooler",
  },
  {
    id: "dashboard",
    icon: <LayoutDashboard className="h-6 w-6 text-cyan-500" />,
    iconBg: "rgba(6,182,212,0.15)",
    iconBorder: "rgba(6,182,212,0.3)",
    title: "Your Dashboard at a Glance",
    subtitle: "Everything in one place",
    description:
      "Your home screen shows all your farm's key numbers in real-time. Tap any card to see the full history and details. The color badges make it easy to spot problems at a glance.",
    visual: (
      <div className="w-full space-y-2.5">
        {[
          { color: "#10b981", badge: "Good / Optimal", meaning: "All clear — your farm is healthy" },
          { color: "#f59e0b", badge: "Warning / Warm", meaning: "Needs attention soon — check and act" },
          { color: "#ef4444", badge: "Alert / Danger", meaning: "Act now — crop health at risk" },
        ].map((s) => (
          <div key={s.badge}
            className="flex items-center gap-3 rounded-xl px-3 py-2.5"
            style={{ background: `${s.color}10`, border: `1px solid ${s.color}30` }}>
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold flex-shrink-0"
              style={{ background: `${s.color}20`, color: s.color, border: `1px solid ${s.color}40` }}>
              <CheckCircle2 className="h-3 w-3" />
              {s.badge}
            </div>
            <span className="text-[11px] text-gray-600 dark:text-gray-300">{s.meaning}</span>
          </div>
        ))}
        <p className="text-[11px] text-center text-gray-500 dark:text-gray-400 pt-1">
          Tap <span className="font-semibold text-blue-500">View all</span> on any card for detailed history
        </p>
      </div>
    ),
    tip: "You can replay this tour anytime from the Help section",
  },
];

// ─── Main Component ───────────────────────────────────────────────────────────
interface OnboardingTourProps {
  onComplete: () => void;
}

export function OnboardingTour({ onComplete }: OnboardingTourProps) {
  const [step, setStep] = useState(0);
  const [direction, setDirection] = useState(1);
  const dialogRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  const current = STEPS[step];
  const isLast = step === STEPS.length - 1;
  const progress = ((step + 1) / STEPS.length) * 100;

  // Focus the close button on mount for keyboard accessibility
  useEffect(() => {
    closeButtonRef.current?.focus();
  }, []);

  // Escape key closes the tour
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onComplete();
    };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [onComplete]);

  // Trap focus inside the dialog
  useEffect(() => {
    const el = dialogRef.current;
    if (!el) return;
    const focusable = el.querySelectorAll<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    const trap = (e: KeyboardEvent) => {
      if (e.key !== "Tab") return;
      if (e.shiftKey) {
        if (document.activeElement === first) { e.preventDefault(); last?.focus(); }
      } else {
        if (document.activeElement === last) { e.preventDefault(); first?.focus(); }
      }
    };
    el.addEventListener("keydown", trap);
    return () => el.removeEventListener("keydown", trap);
  }, [step]);

  const goNext = () => {
    if (isLast) { onComplete(); return; }
    setDirection(1);
    setStep((s) => s + 1);
  };
  const goPrev = () => {
    if (step === 0) return;
    setDirection(-1);
    setStep((s) => s - 1);
  };

  const variants = {
    enter: (d: number) => ({ x: d > 0 ? 60 : -60, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (d: number) => ({ x: d > 0 ? -60 : 60, opacity: 0 }),
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-3 sm:p-4"
      style={{ background: "rgba(0,0,0,0.55)", backdropFilter: "blur(6px)" }}
      aria-hidden="false"
      onClick={(e) => { if (e.target === e.currentTarget) onComplete(); }}
    >
      <motion.div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="tour-title"
        initial={{ y: 60, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 60, opacity: 0 }}
        transition={{ type: "spring", stiffness: 380, damping: 32 }}
        className="w-full max-w-sm rounded-[2rem] overflow-hidden flex flex-col"
        style={{
          background: "var(--card-bg, rgba(255,255,255,0.97))",
          boxShadow: "0 25px 60px rgba(0,0,0,0.25), 0 0 0 1px rgba(255,255,255,0.15)",
          maxHeight: "calc(100dvh - 24px)",
        }}
      >
        {/* ── Header ── */}
        <div className="px-5 pt-5 pb-3 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-3">
            <div
              className="h-10 w-10 rounded-2xl flex items-center justify-center flex-shrink-0"
              style={{ background: current.iconBg, border: `1px solid ${current.iconBorder}` }}
            >
              {current.icon}
            </div>
            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">{current.subtitle}</p>
              <h2 id="tour-title" className="text-base font-bold text-gray-800 dark:text-white leading-tight">{current.title}</h2>
            </div>
          </div>
          <button
            ref={closeButtonRef}
            onClick={onComplete}
            className="h-8 w-8 rounded-full flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-white/10 transition-colors"
            aria-label="Skip tour"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* ── Progress bar ── */}
        <div className="px-5 mb-3 flex-shrink-0">
          <div className="h-1.5 rounded-full bg-gray-200/70 dark:bg-white/10 overflow-hidden">
            <motion.div
              className="h-full rounded-full"
              style={{ background: "linear-gradient(to right, #3b82f6, #10b981)" }}
              initial={false}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.4 }}
            />
          </div>
          <p className="text-xs text-gray-400 mt-1 text-right">{step + 1} of {STEPS.length}</p>
        </div>

        {/* ── Animated step content — scrollable ── */}
        <div className="px-5 overflow-y-auto flex-1">
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={step}
              custom={direction}
              variants={variants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ type: "spring", stiffness: 380, damping: 35 }}
              className="space-y-4 pb-2"
            >
              {/* Description */}
              <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">{current.description}</p>

              {/* Visual */}
              <div className="rounded-2xl p-4"
                style={{ background: "rgba(0,0,0,0.03)", border: "1px solid rgba(0,0,0,0.06)" }}>
                {current.visual}
              </div>

              {/* Tip */}
              {current.tip && (
                <div className="flex gap-2 items-start rounded-xl px-3 py-2.5"
                  style={{ background: "rgba(59,130,246,0.07)", border: "1px solid rgba(59,130,246,0.15)" }}>
                  <span className="text-sm flex-shrink-0">💡</span>
                  <p className="text-xs text-blue-700 dark:text-blue-300 leading-snug">{current.tip}</p>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* ── Step dots ── */}
        <div className="flex justify-center gap-1.5 pt-3 pb-2 flex-shrink-0">
          {STEPS.map((_, i) => (
            <button
              key={i}
              onClick={() => { setDirection(i > step ? 1 : -1); setStep(i); }}
              className="rounded-full transition-all duration-300"
              style={{
                width: i === step ? 20 : 6,
                height: 6,
                background: i === step
                  ? "linear-gradient(to right, #3b82f6, #10b981)"
                  : "rgba(0,0,0,0.15)",
              }}
              aria-label={`Go to step ${i + 1}`}
            />
          ))}
        </div>

        {/* ── Footer buttons ── */}
        <div className="px-5 pb-5 pt-2 flex gap-3 flex-shrink-0">
          {step > 0 && (
            <button
              onClick={goPrev}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-2xl text-sm font-semibold text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/10 transition-colors"
            >
              <ChevronLeft className="h-4 w-4" />
              Back
            </button>
          )}
          <button
            onClick={goNext}
            className="flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl text-sm font-bold text-white transition-all active:scale-95"
            style={{ background: "linear-gradient(135deg, #3b82f6, #10b981)" }}
          >
            {isLast ? (
              <>
                <CheckCircle2 className="h-4 w-4" />
                Get Started!
              </>
            ) : (
              <>
                Next
                <ChevronRight className="h-4 w-4" />
              </>
            )}
          </button>
        </div>
      </motion.div>
    </div>
  );
}
