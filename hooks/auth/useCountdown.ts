"use client";

import { useCallback, useEffect, useState } from "react";

/**
 * Seconds left until 0 after `restart(n)`; ticks once a second.
 * Starts idle (0) and reads the clock only when a countdown starts, so the page can be
 * pre-built without a time value (Cache Components rule).
 */
export function useCountdown() {
  const [endsAt, setEndsAt] = useState(0);
  const [now, setNow] = useState(0);

  const secondsLeft = Math.max(0, Math.ceil((endsAt - now) / 1000));

  useEffect(() => {
    if (secondsLeft === 0) return;
    const timer = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(timer);
  }, [secondsLeft]);

  const restart = useCallback((seconds: number) => {
    const start = Date.now();
    setNow(start);
    setEndsAt(start + seconds * 1000);
  }, []);

  return { secondsLeft, restart };
}
