/**
 * AlertNotificationManager
 * Sits globally in App.tsx (renders nothing visible).
 * Polls /api/my-alerts every 30 s; when the user is NOT on /alerts,
 * pops a toast for each new unseen, undismissed alert (once per session).
 */
import { useEffect, useRef } from "react";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import type { SensorAlert } from "@/hooks/useAlerts";

const SESSION_KEY = "jalsetu_notified_alerts_session";
const DISMISSED_KEY = (uid?: number) => `jalsetu_dismissed_alerts_${uid ?? "anon"}`;

function readSet(storage: Storage, key: string): Set<string> {
  try {
    return new Set(JSON.parse(storage.getItem(key) || "[]") as string[]);
  } catch {
    return new Set<string>();
  }
}

export function AlertNotificationManager() {
  const [location] = useLocation();
  const { toast } = useToast();
  const { user } = useAuth();
  const notifiedRef = useRef<Set<string>>(readSet(sessionStorage, SESSION_KEY));

  const { data } = useQuery<{ alerts: SensorAlert[]; generatedAt: string }>({
    queryKey: ["/api/my-alerts"],
    refetchInterval: 30_000,
    enabled: !!user,
  });

  useEffect(() => {
    if (!data?.alerts?.length) return;
    // Never pop when the user is already looking at alerts
    if (location === "/alerts") return;

    const dismissed = readSet(localStorage, DISMISSED_KEY(user?.id));
    const newAlerts = data.alerts.filter(
      (a) => !notifiedRef.current.has(a.id) && !dismissed.has(a.id)
    );
    if (!newAlerts.length) return;

    // Mark all as seen this session so we don't repeat the toast
    newAlerts.forEach((a) => notifiedRef.current.add(a.id));
    try {
      sessionStorage.setItem(SESSION_KEY, JSON.stringify([...notifiedRef.current]));
    } catch {}

    // Show one toast, prioritising the highest severity
    const danger  = newAlerts.filter((a) => a.type === "danger");
    const warning = newAlerts.filter((a) => a.type === "warning");

    if (danger.length) {
      const first = danger[0];
      toast({
        title: `🚨 ${danger.length > 1 ? `${danger.length} Critical Alerts` : first.title}`,
        description:
          danger.length > 1
            ? `${danger.map((a) => a.title).join(" · ")} — tap Alerts to view.`
            : first.message,
        variant: "destructive",
        duration: 8000,
      });
    } else if (warning.length) {
      const first = warning[0];
      toast({
        title: `⚠️ ${warning.length > 1 ? `${warning.length} Farm Warnings` : first.title}`,
        description:
          warning.length > 1
            ? `${warning.map((a) => a.title).join(" · ")} — tap Alerts to view.`
            : first.message,
        duration: 6000,
      });
    } else {
      toast({
        title: newAlerts[0].title,
        description: newAlerts[0].message,
        duration: 5000,
      });
    }
  }, [data, location, user?.id, toast]);

  return null;
}
