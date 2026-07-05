import { useQuery } from "@tanstack/react-query";
import { useState, useCallback } from "react";

export interface SensorAlert {
  id: string;
  dbId?: number;
  title: string;
  message: string;
  type: "info" | "warning" | "danger";
  time: string;
  isResolved?: boolean;
}

export interface HistoryAlert {
  id: string;
  dbId?: number;
  title: string;
  message: string;
  type: "info" | "warning" | "danger";
  triggeredAt: string | null;
  resolvedAt: string | null;
  isResolved: true;
}

interface AlertsResponse {
  alerts: SensorAlert[];
  history: HistoryAlert[];
  generatedAt: string;
  farmId: number | null;
}

const DISMISSED_KEY = (userId?: number) =>
  `jalsetu_dismissed_alerts_${userId ?? "anon"}`;

function readDismissed(userId?: number): Set<string> {
  try {
    return new Set(
      JSON.parse(localStorage.getItem(DISMISSED_KEY(userId)) || "[]") as string[]
    );
  } catch {
    return new Set<string>();
  }
}

export function useAlerts(userId?: number) {
  const [dismissedIds, setDismissedIds] = useState<Set<string>>(() =>
    readDismissed(userId)
  );

  const { data, isLoading, refetch } = useQuery<AlertsResponse>({
    queryKey: ["/api/my-alerts"],
    refetchInterval: 30_000,
  });

  const allAlerts: SensorAlert[] = data?.alerts ?? [];
  const alerts = allAlerts.filter((a) => !dismissedIds.has(a.id));
  const history: HistoryAlert[] = data?.history ?? [];

  const dismiss = useCallback(
    (id: string) => {
      setDismissedIds((prev) => {
        const next = new Set(prev);
        next.add(id);
        try {
          localStorage.setItem(DISMISSED_KEY(userId), JSON.stringify([...next]));
        } catch {}
        return next;
      });
    },
    [userId]
  );

  const clearAll = useCallback(() => {
    const allIds = allAlerts.map((a) => a.id);
    setDismissedIds((prev) => {
      const next = new Set([...prev, ...allIds]);
      try {
        localStorage.setItem(DISMISSED_KEY(userId), JSON.stringify([...next]));
      } catch {}
      return next;
    });
  }, [userId, allAlerts]);

  return {
    alerts,        // active, non-dismissed
    allAlerts,     // all active from server
    history,       // resolved historical alerts from DB
    isLoading,
    farmId: data?.farmId,
    generatedAt: data?.generatedAt,
    dismiss,
    clearAll,
    refetch,
  };
}
