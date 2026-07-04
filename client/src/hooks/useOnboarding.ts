import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";

const STORAGE_KEY = "farmwise_onboarding_v1";

export function useOnboarding() {
  const { user } = useAuth();
  const [showTour, setShowTour] = useState(false);

  useEffect(() => {
    if (!user) return;

    const seen = localStorage.getItem(`${STORAGE_KEY}_${user.id}`);
    if (!seen) {
      // Small delay so the dashboard loads first
      const t = setTimeout(() => setShowTour(true), 800);
      return () => clearTimeout(t);
    }
  }, [user]);

  const completeTour = () => {
    if (user) {
      localStorage.setItem(`${STORAGE_KEY}_${user.id}`, "done");
    }
    setShowTour(false);
  };

  const restartTour = () => {
    setShowTour(true);
  };

  return { showTour, completeTour, restartTour };
}
