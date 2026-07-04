import { useState, useEffect } from "react";

const SESSION_KEY = "esp32_setup_v1";

export function useEsp32Setup(userId?: number) {
  const [showSetup, setShowSetup] = useState(false);

  useEffect(() => {
    if (!userId) return;
    // Show on every login session; sessionStorage clears when tab/browser closes
    const seen = sessionStorage.getItem(`${SESSION_KEY}_${userId}`);
    if (!seen) {
      setShowSetup(true);
    }
  }, [userId]);

  const completeSetup = () => {
    if (userId) {
      sessionStorage.setItem(`${SESSION_KEY}_${userId}`, "done");
    }
    setShowSetup(false);
  };

  return { showSetup, completeSetup };
}
