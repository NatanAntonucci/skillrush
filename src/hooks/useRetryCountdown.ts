'use client';

import { useCallback, useEffect, useState } from 'react';

export function useRetryCountdown() {
  const [deadline, setDeadline] = useState(0);
  const [remaining, setRemaining] = useState(0);
  const start = useCallback((seconds: number) => {
    setRemaining(Math.ceil(seconds));
    setDeadline(Date.now() + seconds * 1000);
  }, []);

  useEffect(() => {
    if (!deadline) return;
    const timer = window.setInterval(() => {
      const seconds = Math.max(0, Math.ceil((deadline - Date.now()) / 1000));
      setRemaining(seconds);
      if (!seconds) window.clearInterval(timer);
    }, 1000);
    return () => window.clearInterval(timer);
  }, [deadline]);

  return [remaining, start] as const;
}
