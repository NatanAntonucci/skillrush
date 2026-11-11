'use client';

import { useEffect, useState } from 'react';

const STORAGE_KEY = 'skillrush:preloaded';

export function Preloader() {
  const [hidden, setHidden] = useState(false);
  const [fading, setFading] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    let seen = false;
    try {
      seen = window.sessionStorage.getItem(STORAGE_KEY) === '1';
    } catch {
      seen = false;
    }

    if (seen || prefersReduced) {
      setHidden(true);
      return;
    }

    let value = 0;
    const started = Date.now();

    const timer = window.setInterval(() => {
      value = Math.min(100, value + 9 + Math.random() * 14);
      setProgress(Math.round(value));

      if (value >= 100 && Date.now() - started > 700) {
        window.clearInterval(timer);
        setFading(true);

        window.setTimeout(() => {
          setHidden(true);
          try {
            window.sessionStorage.setItem(STORAGE_KEY, '1');
          } catch {
            // ignora
          }
        }, 450);
      }
    }, 90);

    return () => window.clearInterval(timer);
  }, []);

  if (hidden) return null;

  return (
    <div
      aria-hidden="true"
      className={`fixed inset-0 z-[100] flex flex-col items-center justify-center gap-6 bg-slate-950 transition-opacity duration-500 ${
        fading ? 'pointer-events-none opacity-0' : 'opacity-100'
      }`}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/logo.svg" alt="" className="h-16 w-auto opacity-90" />

      <div className="w-56">
        <div className="h-1 w-full overflow-hidden rounded-full bg-slate-800">
          <div
            className="pixel-bar h-full transition-[width] duration-150 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>

        <div className="mt-2 flex items-center justify-between text-[11px] uppercase tracking-[0.2em] text-slate-500">
          <span>carregando</span>
          <span>{progress}%</span>
        </div>
      </div>
    </div>
  );
}
